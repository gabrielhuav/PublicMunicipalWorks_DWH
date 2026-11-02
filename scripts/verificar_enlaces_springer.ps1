param([string]$Tex = "$PSScriptRoot\..\paper\Paper_37_1.tex")
# Comprueba que responden todos los enlaces del capitulo de Springer y que siguen
# en origin los tags publicados. Esos enlaces no pueden cambiar ni dejar de
# funcionar, asi que hay que correr esto antes de cada push.
$texto = (Get-Content $Tex -Encoding UTF8 | Where-Object { $_.TrimStart() -notmatch '^%' }) -join "`n"
$urls = @([regex]::Matches($texto, '\\(?:url|href)\{([^}]+)\}') | ForEach-Object {
    $_.Groups[1].Value -replace '\\%', '%' -replace '\\_', '_' -replace '\\&', '&'
} | Where-Object { $_ -match '^https?://' })
# El capitulo imprime el mapa con &idioma=en; la forma corta tambien debe funcionar.
$urls += 'https://gabrielhuav.github.io/PublicMunicipalWorks_DWH/mapa/?modo=claro'
$urls = $urls | Sort-Object -Unique
$fallos = 0
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest $u -UseBasicParsing -MaximumRedirection 10 -TimeoutSec 30 -UserAgent "Mozilla/5.0"
        "{0} {1}" -f $r.StatusCode, $u
    } catch {
        $c = $_.Exception.Response.StatusCode.value__
        if ($u -match '^https://doi\.org/(.+)$' -and $c -in 403, 429) {
            # Algunas editoriales rechazan clientes automaticos; basta con que el DOI resuelva.
            $h = Invoke-RestMethod "https://doi.org/api/handles/$($Matches[1])" -TimeoutSec 30
            "{0} {1} (editorial bloquea scripts; DOI resuelve: {2})" -f $c, $u, ($h.responseCode -eq 1)
            if ($h.responseCode -ne 1) { $fallos++ }
        } else {
            "FALLA {0} {1}" -f $c, $u
            $fallos++
        }
    }
}
# En origin solo estan los dos tags con release; los otros v1.* son locales.
$tags = @{ 'v1.2.0-icokg2026' = '515a1c6'; 'v1.7.3-icokg2026' = '8feb73c' }
$remotos = @(git ls-remote --tags origin)
foreach ($t in $tags.Keys) {
    $l = $remotos | Where-Object { $_ -match "refs/tags/$([regex]::Escape($t))$" }
    if ($l -and $l.StartsWith($tags[$t])) {
        "tag {0} {1}" -f $tags[$t], $t
    } else {
        "FALLA tag $t, se esperaba $($tags[$t])"
        $fallos++
    }
}
"enlaces: $($urls.Count), tags: $($tags.Count), fallos: $fallos"
exit $fallos
