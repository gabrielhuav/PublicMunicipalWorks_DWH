SELECT motivo_cambio AS motivo, count(*) AS versiones
FROM (SELECT DISTINCT d.proyecto_key, d.motivo_cambio
      FROM warehouse.dim_proyecto_federal d
      JOIN warehouse.fact_proyecto_ciclo f USING (proyecto_key)
      WHERE f.id_entidad = 15 AND d.version > 1) s
GROUP BY motivo_cambio
ORDER BY motivo_cambio;
