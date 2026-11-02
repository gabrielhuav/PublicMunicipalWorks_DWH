param(
    [string]$Destino = (Join-Path (Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent) "PublicMunicipalWorks_Lakehouse"),
    [string]$Rama = "ijcopi-obras"
)
# Prepara la copia publica del lago, sin subir nada. Vive en un repositorio propio para que el
# sitio nuevo tenga enlaces nuevos y el de ICOKG no cambie. Lleva el lago y el almacen en que se
# carga; la memoria de trabajo, el manuscrito y la demostracion web de ICOKG no se publican.
# Toma lo que esta en el commit de $Rama, no lo que haya sin guardar en la carpeta.
$ErrorActionPreference = "Stop"
$raiz = git -C $PSScriptRoot rev-parse --show-toplevel
$rutas = @(".gitignore", "LICENSE.md", "backend", "db", "docker", "scripts", "lakehouse")

if (-not (Test-Path (Join-Path $Destino ".git"))) {
    New-Item -ItemType Directory -Force $Destino | Out-Null
    git -C $Destino init -q -b main
}
Get-ChildItem $Destino -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force

$tar = Join-Path $env:TEMP "obras_lago_publicar.tar"
git -C $raiz -c core.autocrlf=false archive -o $tar $Rama -- @rutas
tar -xf $tar -C $Destino
Remove-Item $tar

$publicar = Join-Path $Destino "lakehouse\publicar"
Move-Item (Join-Path $publicar "README.md") (Join-Path $Destino "README.md")
New-Item -ItemType Directory -Force (Join-Path $Destino ".github\workflows") | Out-Null
Move-Item (Join-Path $publicar "pages.yml") (Join-Path $Destino ".github\workflows\pages.yml")
Remove-Item -Recurse $publicar
Remove-Item (Join-Path $Destino "scripts\verificar_enlaces_springer.ps1")

# El codigo del lago es de otro autor que el almacen; la licencia MIT admite varios titulares.
# Sin acentos en este archivo: Windows PowerShell 5.1 lee como ANSI un script sin BOM.
$licencia = Join-Path $Destino "LICENSE.md"
$texto = [IO.File]::ReadAllText($licencia)
$titular = '(?m)^(Copyright \(c\) 2026 Uriel Gonz.lez Casiano, Marco Tulio Maldonado Mej.a)$'
if ($texto -notmatch $titular) { throw "la licencia ya no tiene el titular esperado" }
$nuevo = "Copyright (c) 2026 Gabriel Hurtado Avil$([char]0xE9)s (lakehouse/)"
$texto = [regex]::Replace($texto, $titular, { param($m) $m.Value + "`n" + $nuevo })
[IO.File]::WriteAllText($licencia, $texto, (New-Object Text.UTF8Encoding $false))

$n = (Get-ChildItem $Destino -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\\.git\\' } | Measure-Object Length -Sum)
"copia lista en {0}: {1} archivos, {2:N1} MB" -f $Destino, $n.Count, ($n.Sum / 1MB)
