-- Lo que el almacén resuelve con SCD 2: el estado de un proyecto en cada ciclo.
SELECT ciclo, estatus, aprobado, pagado
FROM oro_proyecto_ciclo
WHERE folio = 'MEX00180101071655'
ORDER BY ciclo;
