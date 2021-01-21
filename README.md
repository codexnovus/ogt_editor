# ogt_editor

Editor para el formáto gráfico OGT

Cosas que puede hacer de momento:
- Cambiar los pixeles de negro a blanco y viceversa
- Exportar el resultado en OGT RAW

Cosas que no puede hacer de momento (y son importantes):
- Color
- Importar OGT RAW

Cosas que podrá hacer en el futuro:
- Calcular CRC
- Comprimir el OGT usando LZW para poder compartirlos en twitch

_Mi idea básica era dejar la cabecera descomprimida y añadir el CRC como un nuevo campo, seguido de la cadena LZW._

`OGTT;v0.5;_ancho_;_alto_;_crc_;;_imagen comprimida_`
