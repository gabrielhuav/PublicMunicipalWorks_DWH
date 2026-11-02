param(
    [string]$Base = "https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/",
    [string]$Salida = $PSScriptRoot
)
# Captura la figura nueva del articulo desde el sitio publicado del lago, con Edge sin ventana.
# vista=figura deja solo el mapa y su leyenda. Adaptado del script del trabajo 38.
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$perfil = Join-Path $env:TEMP "captura_mapa_lago_edge"
$figuras = @{
    "figura_mapa_lago.png" = "?vista=figura&lang=en&ind=pagado_hab&ciclo=2024&teselas=esri-gris"
}
foreach ($nombre in $figuras.Keys) {
    $destino = Join-Path $Salida $nombre
    if (Test-Path $destino) { Remove-Item $destino }
    $url = "$Base$($figuras[$nombre])"
    Start-Process -Wait -NoNewWindow -FilePath $edge -ArgumentList @(
        "--headless=new", "--disable-gpu", "--hide-scrollbars", "--user-data-dir=$perfil",
        # Modo claro para imprimir; escala entera para que no se vean las uniones de las teselas
        "--blink-settings=preferredColorScheme=1",
        "--window-size=900,560", "--force-device-scale-factor=2", "--virtual-time-budget=25000",
        "--screenshot=`"$destino`"", "`"$url`"")
    # Paleta de 256 colores: sin perder legibilidad, el .docx pesa una quinta parte
    py -3 -c "from PIL import Image; import sys; Image.open(sys.argv[1]).convert('RGB').quantize(256).save(sys.argv[1], optimize=True)" $destino
    "{0}: {1:N0} KB" -f $nombre, ((Get-Item $destino).Length / 1KB)
}
