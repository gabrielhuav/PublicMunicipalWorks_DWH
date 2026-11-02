"""Capa bronce: copia cada archivo oficial, sin alterarlo, al almacén de objetos.

La ruta sigue la convención hive de la Ecuación 1 del capítulo y el hash de la
fuente viaja como metadato del objeto. Al terminar se relee cada objeto y se
compara byte por byte contra el manifiesto, no solo el tamaño.
"""
import hashlib
import sys

from botocore.exceptions import ClientError

from comun import BUCKET, cliente_s3, fuentes, ruta_local


def main():
    s3 = cliente_s3()
    try:
        s3.head_bucket(Bucket=BUCKET)
    except ClientError:
        s3.create_bucket(Bucket=BUCKET)

    fallos = 0
    for f in fuentes():
        clave = f"bronce/{f['ruta_bronce']}"
        s3.upload_file(str(ruta_local(f)), BUCKET, clave, ExtraArgs={
            "Metadata": {"sha256": f["sha256"], "fuente": f["id"]}})
        h = hashlib.sha256()
        cuerpo = s3.get_object(Bucket=BUCKET, Key=clave)["Body"]
        for bloque in cuerpo.iter_chunks(1 << 20):
            h.update(bloque)
        bien = h.hexdigest() == f["sha256"]
        fallos += not bien
        print(f"{'ok   ' if bien else 'FALLA'} s3://{BUCKET}/{clave}", flush=True)
    print(f"objetos con fallo: {fallos}")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
