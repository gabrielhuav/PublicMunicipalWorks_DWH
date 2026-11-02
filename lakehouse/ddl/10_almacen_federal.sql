-- Integración aditiva de los registros federales al almacén del capítulo.
--
-- Solo crea objetos nuevos en warehouse: no altera ninguna tabla, vista ni disparador
-- existente, y el único vínculo con el modelo original es dim_tiempo, dimensión
-- conformada. Las obras sintéticas (dim_obra) y las reales (dim_proyecto_federal) no
-- comparten dimensión de obra a propósito: ninguna consulta puede mezclarlas por error.
-- verificar_lago.py comprueba que las tablas originales queden idénticas.

DROP VIEW IF EXISTS warehouse.v_proyecto_federal;
DROP TABLE IF EXISTS warehouse.fact_proyecto_ciclo;
DROP TABLE IF EXISTS warehouse.dim_proyecto_federal;
DROP TABLE IF EXISTS warehouse.dim_municipio;

-- SCD Tipo 1: censo y rezago son de un solo año.
CREATE TABLE warehouse.dim_municipio (
    municipio_key   INTEGER PRIMARY KEY,
    cvemun          CHAR(5) NOT NULL UNIQUE,
    entidad         TEXT NOT NULL,
    municipio       TEXT NOT NULL,
    pobtot          BIGINT NOT NULL,
    irs             DOUBLE PRECISION,
    grado_rezago    TEXT
);

-- SCD Tipo 2 con las mismas columnas de vigencia que dim_obra. Cada ciclo es una
-- observación: si cambian estatus, monto o clasificación se abre otra versión.
CREATE TABLE warehouse.dim_proyecto_federal (
    proyecto_key    BIGINT PRIMARY KEY,
    folio           TEXT NOT NULL,
    version         SMALLINT NOT NULL,
    nombre          TEXT,
    categoria       TEXT,
    clasificacion   TEXT,
    institucion_ejecutora TEXT,
    estatus         TEXT,
    aprobado        NUMERIC(20,2),
    fecha_efectiva  DATE NOT NULL,
    fecha_expiracion DATE NOT NULL,
    es_actual       BOOLEAN NOT NULL,
    motivo_cambio   TEXT,
    UNIQUE (folio, version)
);

-- Grano: un proyecto por ciclo. tiempo_key es el cierre del ejercicio: pagado es un
-- acumulado a esa fecha, no el gasto de un periodo.
CREATE TABLE warehouse.fact_proyecto_ciclo (
    tiempo_key      INTEGER NOT NULL REFERENCES warehouse.dim_tiempo(tiempo_key),
    proyecto_key    BIGINT NOT NULL REFERENCES warehouse.dim_proyecto_federal(proyecto_key),
    municipio_key   INTEGER REFERENCES warehouse.dim_municipio(municipio_key),
    ciclo           SMALLINT NOT NULL,
    id_entidad      SMALLINT NOT NULL,
    aprobado        NUMERIC(20,2),
    pagado_reportado NUMERIC(20,2),
    pagado          NUMERIC(20,2),
    pct_fisico      NUMERIC(8,2),
    pct_financiero  NUMERIC(20,2),
    n_contratos     INTEGER NOT NULL,
    monto_contratos NUMERIC(20,2),
    es_fais         BOOLEAN NOT NULL,
    lat             DOUBLE PRECISION,
    lon             DOUBLE PRECISION,
    c1_ciclo        BOOLEAN,
    c1_tipo         BOOLEAN,
    c2              BOOLEAN,
    c3              BOOLEAN,
    c4              BOOLEAN,
    PRIMARY KEY (tiempo_key, proyecto_key)
);

CREATE INDEX idx_fact_proyecto_ciclo_ciclo ON warehouse.fact_proyecto_ciclo (ciclo, id_entidad);
CREATE INDEX idx_fact_proyecto_ciclo_mun ON warehouse.fact_proyecto_ciclo (municipio_key);
CREATE INDEX idx_dim_proyecto_folio ON warehouse.dim_proyecto_federal (folio);

CREATE VIEW warehouse.v_proyecto_federal AS
SELECT f.ciclo, d.folio, d.version, d.nombre, d.categoria, d.clasificacion, d.estatus,
       m.cvemun, m.entidad, m.municipio, f.aprobado, f.pagado, f.pct_fisico,
       f.pct_financiero, f.n_contratos, f.es_fais, f.lat, f.lon
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_proyecto_federal d USING (proyecto_key)
LEFT JOIN warehouse.dim_municipio m USING (municipio_key);
