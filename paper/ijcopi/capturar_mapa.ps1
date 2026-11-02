param(
    [string]$Base = "https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/",
    [string]$Salida = $PSScriptRoot
)
# Captura las figuras nuevas del articulo desde el sitio del lago, con Edge sin ventana. Adaptado
# del script del trabajo 38. La figura 4 es el mapa con la ficha del proyecto del ejemplo abierta
# (?folio=); la 5, su antes y ahora en el archivo de Esri (?comparar=1) en la vista de figura, que
# deja solo el satelite: las reglas de Google no permiten imprimir ni capturar Street View.
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$perfil = Join-Path $env:TEMP "captura_mapa_lago_edge"
$ejemplo = "estado=15&folio=MEX17170401001337"
$figuras = [ordered]@{
    "figura_ejemplo_mapa.png"     = @("?lang=en&ind=pagado_hab&ciclo=2025&evidencia=8&$ejemplo&c=19.33,-99.55,8&teselas=esri-gris", "1440,640")
    "figura_ejemplo_satelite.jpg" = @("?vista=figura&lang=en&$ejemplo&comparar=1&c=19.5083,-99.2750,17", "1200,400")
}
foreach ($nombre in $figuras.Keys) {
    $url = "$Base$($figuras[$nombre][0])"
    $destino = Join-Path $Salida $nombre
    $png = [IO.Path]::ChangeExtension($destino, ".png")
    foreach ($f in @($destino, $png)) { if (Test-Path $f) { Remove-Item $f } }
    # Perfil nuevo en cada captura: sin cache, el sitio se baja como lo veria alguien por primera vez
    if (Test-Path $perfil) { Remove-Item -Recurse -Force $perfil }
    Start-Process -Wait -NoNewWindow -FilePath $edge -ArgumentList @(
        "--headless=new", "--disable-gpu", "--hide-scrollbars", "--user-data-dir=$perfil",
        # Modo claro para imprimir; escala entera para que no se vean las uniones de las teselas
        "--blink-settings=preferredColorScheme=1",
        "--window-size=$($figuras[$nombre][1])", "--force-device-scale-factor=2", "--virtual-time-budget=30000",
        "--screenshot=`"$png`"", "`"$url`"")
    if ($nombre.EndsWith(".jpg")) {
        # La imagen de satelite pierde detalle con 256 colores: va en JPEG
        py -3 -c "from PIL import Image; import sys; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], quality=88, optimize=True)" $png $destino
        Remove-Item $png
    } else {
        # Sin paleta reducida: con 256 colores, el verde de los proyectos terminados salia negro
        py -3 -c "from PIL import Image; import sys; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1], optimize=True)" $destino
    }
    "{0}: {1:N0} KB" -f $nombre, ((Get-Item $destino).Length / 1KB)
}
