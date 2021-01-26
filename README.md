# ogt_editor

Editor para el formáto gráfico OGT

Cosas que puede hacer de momento:
- Cambiar los pixeles de negro a blanco y viceversa
- Exportar el resultado en OGT RAW
- Color
- Importar OGT RAW
- Comprimir el OGT usando LZW para poder compartirlos en twitch (OGT TIGHT || OGT PRIETO)

Cosas que podrá hacer en el futuro:
- Calcular CRC (la función está implementada pero falta ver como se gestionarán los meta)
- Capturar colores usando May+Click

## Formato OGT TIGHT
Igual que OGT RAW, con las siguientes diferencias:
- Se eliminan los saltos de línea (Se usa como separador ;;) * de hecho, mi parser de OGT RAW también ignora los saltos de linea pero la especificación "oficial" es que el separador de línea es `;;\n`
- La cabecera usa el identificador "OGTT" en vez de OGT
- La imagen está comprimida usando LZW

El resultado es una reducción notable de tamaño, especialmente en imagenes con pocos colores.
