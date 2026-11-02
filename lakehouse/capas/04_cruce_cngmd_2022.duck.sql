-- Contratos de obra de 2022 según dos fuentes oficiales: lo que cada municipio declaró a INEGI
-- en el CNGMD 2023 y lo que SHCP registra como contratos de obra convocados por un municipio.
-- Una diferencia no prueba irregularidad: el CNGMD cubre todos los recursos del municipio y
-- SHCP solo el gasto federalizado.
SELECT cvemun, contratos_cngmd, monto_cngmd, contratos_shcp, monto_shcp, relacion
FROM oro_cruce_cngmd
ORDER BY cvemun;
