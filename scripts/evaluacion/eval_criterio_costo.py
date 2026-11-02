"""
eval_criterio_costo.py
=============================================================================
Reevalúa el criterio de costo que el capítulo dejó como trabajo futuro, con el
mismo generador, las mismas semillas, las mismas prevalencias y la misma verdad
de referencia que eval_deteccion_v2.py. No modifica ese script.

El capítulo explica por qué C1 falla: compara un monto absoluto contra la media
del periodo, así que señala obras grandes, no caras. Un revisor preguntaría si
eso se arregla con el criterio o si los sobreprecios son indetectables. Aquí se
prueban tres variantes de C1, una por cada hipótesis:

  * R0, la regla del capítulo, como control: debe repetir su recall de .351.
  * R1, costo por tipo de obra: desviación robusta de log(precio del contrato)
    frente a las obras del mismo tipo. El grano es la obra, no el registro.
  * R2, R1 más C4, brecha de pago: el capítulo señala que ningún criterio mira la
    distancia entre avance financiero y físico mientras el físico supere 30 %.

Los umbrales se fijan de antemano y se reportan todos: elegir el mejor sobre
estos mismos datos sería medir sobre el conjunto de ajuste.

Uso
---
    python scripts/evaluacion/eval_criterio_costo.py
    python scripts/evaluacion/eval_criterio_costo.py --json salida.json
"""
import argparse
import json
import os
import sys

import numpy as np
from sklearn.ensemble import IsolationForest

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eval_deteccion_v2 import (AVANCE_FISICO_BAJO, AVANCE_PRESUP_ALTO,  # noqa: E402
                               DIAS_RETRASO, EPS, Z_PRESUPUESTO, metricas, rasgos,
                               regla)
from generar_dataset_obras import generar  # noqa: E402

CAUSAS = ("abandono", "baja_productividad", "obra_fantasma", "pago_adelantado",
          "sobreprecio")
PREVALENCIAS = (0.05, 0.10, 0.15, 0.20)
UMBRALES_TIPO = (2.0, 2.5, 3.0)
# Puntos porcentuales entre avance financiero y físico. 30 es el mismo margen que
# separa los dos umbrales de C3 cuando se leen como brecha mínima de 50.
BRECHA_PAGO = 30.0
MAD_A_SIGMA = 1.4826


def z_por_tipo(datos):
    """Desviación robusta de log(precio) dentro de cada tipo de obra.

    Cada obra aporta su contrato una sola vez: una obra lenta genera más
    registros y, por registro, pesaría más en la mediana de su tipo.
    """
    precios = {}
    for r in datos:
        llave = (r["comunidad"], r["tipo_obra"], r["anio"], r["presupuesto_miles_pesos"])
        precios.setdefault(r["tipo_obra"], set()).add(llave)
    centro = {}
    for tipo, obras in precios.items():
        v = np.log([o[3] for o in obras])
        med = np.median(v)
        centro[tipo] = (med, MAD_A_SIGMA * np.median(np.abs(v - med)))
    return np.array([
        (np.log(r["presupuesto_miles_pesos"]) - centro[r["tipo_obra"]][0])
        / (centro[r["tipo_obra"]][1] + EPS) for r in datos])


def regla_tipo(datos, z_tipo, umbral, con_brecha):
    y = np.zeros(len(datos), dtype=int)
    s = np.zeros(len(datos))
    for i, r in enumerate(datos):
        # Solo por arriba: un precio bajo no es un sobreprecio.
        c1 = z_tipo[i] > umbral
        puntos = max(z_tipo[i], 0.0) * Z_PRESUPUESTO / umbral
        c2 = r["dias_retraso"] > DIAS_RETRASO
        if c2:
            puntos = max(puntos, r["dias_retraso"] / DIAS_RETRASO)
        c3 = (r["avance_fisico_porcentaje"] < AVANCE_FISICO_BAJO
              and r["avance_presupuestal_porcentaje"] > AVANCE_PRESUP_ALTO)
        if c3:
            puntos = max(puntos, 3.5)
        brecha = r["avance_presupuestal_porcentaje"] - r["avance_fisico_porcentaje"]
        c4 = con_brecha and brecha > BRECHA_PAGO
        if c4:
            puntos = max(puntos, 3.0 * brecha / BRECHA_PAGO)
        s[i] = puntos
        y[i] = int(c1 or c2 or c3 or c4)
    return y, s


def por_causa(datos, y_pred):
    salida = {}
    for causa in CAUSAS:
        idx = [i for i, r in enumerate(datos) if r["causa_latente"] == causa]
        if idx:
            salida[causa] = float(y_pred[idx].mean())
    return salida


def intervalo(valores):
    v = np.array(valores, dtype=float)
    return float(v.mean()), float(1.96 * v.std(ddof=1) / np.sqrt(len(v)))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--semillas", type=int, default=10)
    ap.add_argument("--json")
    args = ap.parse_args()

    semillas = range(42, 42 + args.semillas)
    resultado = {}
    for prev in PREVALENCIAS:
        filas = {}

        def anotar(nombre, m, causas=None):
            f = filas.setdefault(nombre, {"m": [], "c": []})
            f["m"].append(m)
            if causas:
                f["c"].append(causas)

        for semilla in semillas:
            datos = generar(semilla=semilla, prevalencia=prev)
            verdad = np.array([r["es_anomalia_real"] for r in datos], dtype=int)
            y0, s0 = regla(datos)
            anotar("R0 capítulo", metricas(verdad, y0, s0), por_causa(datos, y0))
            z = z_por_tipo(datos)
            for u in UMBRALES_TIPO:
                y, s = regla_tipo(datos, z, u, False)
                anotar(f"R1 tipo z>{u}", metricas(verdad, y, s), por_causa(datos, y))
                y, s = regla_tipo(datos, z, u, True)
                anotar(f"R2 tipo z>{u} + brecha", metricas(verdad, y, s), por_causa(datos, y))
                # Línea base al mismo presupuesto de alertas de R2.
                if u == 3.0:
                    X = rasgos(datos)
                    bosque = IsolationForest(
                        n_estimators=100, contamination=prev, random_state=semilla).fit(X)
                    p = -bosque.score_samples(X)
                    k = int(y.sum())
                    ybase = np.zeros(len(datos), dtype=int)
                    ybase[np.argsort(-p)[:k]] = 1
                    anotar("Isolation Forest, mismo presupuesto que R2 z>3.0",
                           metricas(verdad, ybase, p))

        print(f"\n── prevalencia latente {prev:.0%}")
        print(f"   {'método':<48}{'precisión':>13}{'recall':>13}{'F1':>13}{'ROC-AUC':>13}{'PR-AUC':>13}{'alertas':>9}")
        resultado[f"{prev:.2f}"] = {}
        for nombre, f in filas.items():
            medias = {k: intervalo([x[k] for x in f["m"]])
                      for k in ("precision", "recall", "f1", "roc", "pr", "alertas")}
            texto = "".join(f"{medias[k][0]:>8.3f}±{medias[k][1]:.3f}"
                            for k in ("precision", "recall", "f1", "roc", "pr"))
            print(f"   {nombre:<48}{texto}{medias['alertas'][0]:>9.0f}")
            causas = {c: intervalo([x[c] for x in f["c"] if c in x])
                      for c in CAUSAS if f["c"]}
            if causas and prev == 0.15:
                print("      recall: " + "  ".join(
                    f"{c} {v[0]:.3f}±{v[1]:.3f}" for c, v in causas.items()))
            resultado[f"{prev:.2f}"][nombre] = {"metricas": medias, "causas": causas}

    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(resultado, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
