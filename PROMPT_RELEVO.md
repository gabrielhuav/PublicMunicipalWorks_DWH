# Prompt de relevo (2 nov 2026)

Este archivo es el prompt para la sesión que continúa el trabajo. Está en la raíz del repositorio:
`PROMPT_RELEVO.md`, rama `ijcopi-obras`.

- En línea: <https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/blob/ijcopi-obras/PROMPT_RELEVO.md>
- En esta PC: `C:\Users\gabri\Documents\GitHub Desktop\PublicMunicipalWorks_DWH\PROMPT_RELEVO.md`

---

Continúas la extensión del trabajo 37 de ICOKG 2026 para el número especial de IJCOPI. Trabajas para Gabriel Hurtado Avilés: háblale en español y sé breve, le importa no gastar créditos.

Repositorio: <https://github.com/gabrielhuav/PublicMunicipalWorks_DWH>, rama `ijcopi-obras`
(<https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/tree/ijcopi-obras>). En esta PC:
`C:\Users\gabri\Documents\GitHub Desktop\PublicMunicipalWorks_DWH`. Sitio público del lago:
<https://github.com/gabrielhuav/PublicMunicipalWorks_Lakehouse> y
<https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/>.

Antes de hacer cualquier cosa, lee completo `AGENTS.md`
(<https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/blob/ijcopi-obras/AGENTS.md>). Es la memoria compartida: tiene las reglas que no se negocian, los hechos ya verificados y la sección "Relevo". Actualízala conforme avances y agrega tu línea a la Bitácora.

## Reglas principales (el detalle está en AGENTS.md)

- Ningún push sin autorización explícita de Gabriel. Antes de cada push, `scripts/verificar_enlaces_springer.ps1` debe terminar con `fallos: 0`. Nunca uses `git push --tags`. No fusiones a `main` ni toques `docs/`.
- No modifiques la base congelada: `paper/Paper_37_1.tex` y sus PDF, y `paper/ijcopi/Paper37_IJCOPI_v0_fiel.docx` y su PDF.
- No envíes correos sin que Gabriel vea el texto y lo apruebe.
- Cada cifra del artículo sale de un script del repositorio. Si no puedes verificar algo, dilo.
- El título y el bloque de autores ya están aprobados: no los toques.
- El .docx no se edita a mano: lo arma `paper/ijcopi/extender_v1.py` (los textos nuevos viven en ese script y las cifras en `cifras_extension.py`). Todo lo nuevo va resaltado en amarillo, y las figuras nuevas con marco amarillo. Escribe en inglés británico.
- Límites: máximo 15 páginas (hoy tiene exactamente 15) y al menos 9,582 palabras (hoy tiene 10,172). Mide con `paper/ijcopi/word_a_pdf.ps1` (usa Word), corre `verificar_amarillo.py` y revisa el PDF a ojo.

## Tarea 1: Street View del tanque en el artículo

Gabriel quiere que el ejemplo del artículo (.docx) incluya el antes y después de Google Street View, si existe. El ejemplo es el proyecto `MEX17170401001337`, un tanque de agua en Praderas de San Mateo, Naucalpan (sección "Ejemplo de las figuras 4 y 5" de AGENTS.md). Las tomas son de julio de 2015 (sin tanque) y agosto de 2024 (con tanque). Los panoramas están en `lakehouse/sitio/ejemplos.json`, con id, coordenadas, rumbo e inclinación.

Antes de hacerlo, resuelve esto con Gabriel. Según las reglas de Google (<https://about.google/brand-resource-center/products-and-services/geo-guidelines/>), Street View no se puede usar en impresos, revistas incluidas, ni capturarse; solo incrustarse en sitios web. Por eso la sesión anterior lo dejó únicamente en el sitio. Lee esas reglas tú mismo, explícale a Gabriel lo que dicen y propón alternativas que sí se puedan publicar, por ejemplo:

- a) Imágenes a nivel de calle con licencia abierta (Mapillary o KartaView, CC BY-SA), si hay tomas de esa esquina de antes y después de 2017.
- b) Una frase en la sección 9.4 con la URL del sitio que abre el antes y después con Street View: <https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/?estado=15&folio=MEX17170401001337&comparar=1>
- c) Lo que Gabriel decida. Anota su decisión en AGENTS.md.

Una figura nueva ocupa espacio: tendrás que recortar texto para seguir en 15 páginas. Además, Gabriel debe confirmar lo que la sección 9.4 dice de esos panoramas: la sesión anterior no pudo verlos (en sus capturas salían en negro) y se apoyó en lo que Gabriel describió.

## Después, en este orden (ver "Relevo" en AGENTS.md)

2. Gabriel decide si los alumnos de los repositorios de referencia van en agradecimientos.
3. Gabriel revisa la v1 completa, sobre todo la declaración de IA. Si tú redactas texto nuevo, la declaración también debe mencionarte.
4. Envío a IJCOPI antes del 9 de noviembre de 2026, a la dirección y con el asunto que indica AGENTS.md, con el texto del correo aprobado por Gabriel.

## Avisos técnicos

En Windows usa `py -3 -I` y `PYTHONIOENCODING=utf-8`. Windows PowerShell 5.1 lee mal los acentos de un .ps1 sin BOM. Si en `paper/ijcopi/` hay un archivo `~$...`, Word tiene el .docx abierto. Hay más en la sección "Avisos técnicos" de AGENTS.md.
