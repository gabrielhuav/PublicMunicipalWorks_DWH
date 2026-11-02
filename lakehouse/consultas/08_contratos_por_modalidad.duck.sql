-- Solo en el lago: los contratos no se cargan al almacén, se consultan donde están.
SELECT ciclo, coalesce(modalidad, 'sin dato') AS modalidad, count(*) AS contratos,
       sum(monto) AS monto
FROM plata_contratos
WHERE ciclo >= 2023 AND tipo_contratacion = 'Obra'
GROUP BY ciclo, modalidad
ORDER BY ciclo, contratos DESC;
