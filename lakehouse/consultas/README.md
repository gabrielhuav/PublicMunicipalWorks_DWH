# Consultas del lago y del almacén

Cada consulta tiene dos versiones: `.pg.sql` para PostgreSQL y `.duck.sql` para DuckDB
sobre el lago. `verificacion/verificar_lago.py` comprueba que las dos den las mismas filas.

| Consulta | Qué responde |
| --- | --- |
| `01_totales_por_ciclo` | Proyectos, aprobado y pagado por ciclo |
| `02_clasificacion_2024` | Gasto por entidad y clasificación en 2024 |
| `03_estado_de_mexico_2024` | Municipios del Estado de México; en el lago usa la poda de Iceberg |
| `04_rezago_2023` | Pago por habitante según el grado de rezago social |
| `05_alertas_por_ciclo` | Registros que cumplen cada criterio C1 a C4 |
| `06_historial_de_un_folio` | Estado de un proyecto en cada ciclo |
| `07_temascaltepec` | El municipio del capítulo, con registros reales |
| `08_contratos_por_modalidad` | Solo en el lago: contratos de obra por modalidad |

## En PostgreSQL

Desde la raíz del repositorio. Se copia la carpeta al contenedor y se abre `psql`:

```bash
docker compose -f docker/compose.yml up -d db
```

```bash
docker cp lakehouse/consultas/. obras-publicas-db-1:/consultas
```

```bash
docker exec -it obras-publicas-db-1 psql -U obras -d obras_publicas -f /consultas/01_totales_por_ciclo.pg.sql
```

En Git Bash, antepón `MSYS_NO_PATHCONV=1` al comando: sin eso convierte `/consultas` en una
ruta de Windows. En PowerShell no hace falta.

Para explorar a mano:

```bash
docker exec -it obras-publicas-db-1 psql -U obras -d obras_publicas
```

```sql
\dt warehouse.*
SELECT * FROM warehouse.v_proyecto_federal WHERE cvemun = '15086' AND ciclo = 2025 LIMIT 5;
SELECT folio, version, estatus, fecha_efectiva, fecha_expiracion, motivo_cambio
FROM warehouse.dim_proyecto_federal
WHERE folio = 'MEX16170300965559'
ORDER BY version;
```

## En el lago

`lago.py` abre DuckDB con una vista por tabla (`plata_proyectos`, `oro_alertas`...).

```bash
docker compose -f lakehouse/compose.yml up -d
```

```bash
lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py lakehouse/consultas/01_totales_por_ciclo.duck.sql
```

```bash
lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py "SELECT ciclo, count(*) FROM plata_contratos GROUP BY 1 ORDER BY 1"
```

Viaje en el tiempo, con el lago tal como estaba después de cargar 2022:

```bash
lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py --instantanea 2022 "SELECT ciclo, count(*) FROM proyectos_entonces GROUP BY 1 ORDER BY 1"
```
