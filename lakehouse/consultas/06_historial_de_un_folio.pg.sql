-- Lo que el almacén resuelve con SCD 2: el estado de un proyecto en cada ciclo.
SELECT f.ciclo, d.estatus, d.aprobado, f.pagado
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_proyecto_federal d USING (proyecto_key)
WHERE d.folio = 'MEX00180101071655'
ORDER BY f.ciclo;
