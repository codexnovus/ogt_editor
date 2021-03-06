const consoleLevel = 1; // Si el mensaje de debug es igual o inferior a este valor, muestralo al usuario (niveles: 0 = no tiene mensaje, 1 = error, 2 = aviso, 3 = info)
        const debugLevel   = 3; // Si el mensaje de debug es igual o inferior a este valor, muestralo en la consola de desarrollo
        const gridSize     = 101; // cuanto ocupará cada pixel por defecto; en pixeles



        window.lienzo = {
            contenido: [],
            pixeles: [],
            lineashor: [],
            lineasver: [],
            ancho: 0,
            alto: 0,
            posX: 0,
            posY: 0,
            ultimaposX: 0,
            ultimaposY: 0,
            redim: function (w,h) {
                // Si ya tiene el ancho correcto, no hace falta redimensionar
                if (this.ancho == w && this.alto == h) {
                    return true;
                }
                // Solo hace falta redimensionar si el ancho o alto son mayores; si es menor podemos dejarlo como está.
                if (this.ancho < w || this.alto < h) {
                    for (y = 0; y < h; y++) {
                        // Esta posición de la matriz 'contenido' tiene un array dentro? Si no es el caso, inicializala con un array vacío
                        if (!Array.isArray(this.contenido[y])) {
                            this.contenido[y] = [];
                            this.pixeles[y] = [];
                        };
                        for (x = 0; x < w; x++) {
                            // Esta posición es un string? Si no es el caso, inicializar con "#FFFFFF"
                            if (typeof this.contenido[y][x] !== "string") {
                                this.contenido[y][x] = "#FFFFFF";
                            }
                        }
                    }
                }
                // Actualizamos las propiedades
                this.ancho = w;
                this.alto = h;
                return true;
            }
        };
        
        class Editor extends Phaser.Scene {
            constructor () { super (); }

            create () {
                var scene = this;
                scene.redim();

                this.input.on('pointerdown',function(pointer) {
                    lienzo.ultimaposX = lienzo.posX;
                    lienzo.ultimaposY = lienzo.posY;
                    const {posX, posY} = lienzo;
                    const cursorcolor = $('#cursorcolor').val();
                    lienzo.contenido[posY][posX] = cursorcolor;
                    lienzo.pixeles[posY][posX].setFillStyle(Phaser.Display.Color.HexStringToColor(cursorcolor).color);
                })

                this.input.on('pointermove',function(pointer) {
                    lienzo.posX = Math.floor(pointer.x/gridSize);
                    lienzo.posY = Math.floor(pointer.y/gridSize);
                    const {posX, posY, ultimaposX, ultimaposY} = lienzo;
                    if (pointer.isDown) {
                        if (posX != ultimaposX || posY != ultimaposY) {
                            debug(`Drag Event initiated. Cursor position is X(${posX}) Y(${posY}). Current color is ${lienzo.contenido[posY][posX]}`);
                            const cursorcolor = $('#cursorcolor').val();
                            lienzo.contenido[posY][posX] = cursorcolor;
                            lienzo.pixeles[posY][posX].setFillStyle(Phaser.Display.Color.HexStringToColor(cursorcolor).color);
                            lienzo.ultimaposX = posX;
                            lienzo.ultimaposY = posY;
                        }
                    }
                });

                $('.imagesize-emitter').change(function () {
                    scene.redim(true);
                });
            }

            redim (destroy = false) {
                const pixelWidth  = $('#filewidth').val(),  // Tamaño de la rejilla definido por el usuario. Por defecto, 8
                      pixelHeight = $('#fileheight').val(),
                      canvasWidth = pixelWidth*gridSize,
                      canvasHeight = pixelHeight*gridSize;
                lienzo.redim(pixelWidth,pixelHeight);
                const pixelcontent = lienzo.contenido;
                editor.scale.resize(canvasWidth, canvasHeight);
                if (destroy) {
                    lienzo.lineashor.forEach(line => line.destroy());
                    lienzo.lineasver.forEach(line => line.destroy());
                }
                // dibujamos las líneas
                for (x = 1; x < pixelWidth; x++)  {
                    lienzo.lineashor[x] = this.add.line(0,0,x*gridSize,0,x*gridSize,canvasHeight*2,0xcccccc);
                }
                for (y = 1; y < pixelHeight; y++) {
                    lienzo.lineasver[y] = this.add.line(0,0,0,y*gridSize,canvasWidth*2,y*gridSize,0xcccccc);
                }
                // dibujamos los pixeles
                for (y=0; y < pixelHeight; y++) {
                    for (x=0; x < pixelWidth; x++) {
                        if (typeof lienzo.pixeles[y][x] == "undefined") {
                            lienzo.pixeles[y][x] = this.add.rectangle(x*gridSize+(gridSize/2),y*gridSize+(gridSize/2),gridSize-1,gridSize-1,Phaser.Display.Color.HexStringToColor(pixelcontent[y][x]).color);
                        }
                    }
                }
            }
        }

        let config = {
            type: Phaser.CANVAS,
            width: 5,
            height: 5,
            canvas: document.getElementById('editor'),
            backgroundColor: "#FFFFFF",
            scene: [ Editor ],
            scale: {
                mode: Phaser.Scale.NONE
            }
        }

        function debug(message, level = 3) {
            levels = ['','(ERROR)','(AVISO)','(INFO)']
            if (consoleLevel >= level) {
                document.getElementById('editor_log').innerHTML += `${levels[level]} ${message} \n`;
            }
            if (debugLevel >= level) {
                switch (level) {
                    case 1:
                        console.error(levels[level], message);
                        break;
                    case 2:
                        console.warn(levels[level], message);
                        break;
                    default:
                        console.log(levels[level], message)
                }
            }
        }
        // importación del fichero
        $('#fileimport').click(function() {
            const importedImage  = $('#filecontent').val();
            const result = importOGT(importedImage);
            let {status,content} = result;
            if (!status) {
                debug(content, 1);
            } else {
                // haz algo
            }
        });

        // descarga del fichero
        $('#filesave').click(function() {
            let inputfilename = window.prompt("¿como quieres llamar al fichero?", "sintitulo")
            const filename =  `${inputfilename == "" ? "sintitulo" : inputfilename}.${$('#filetype').val() == 2? 'OGTT' : 'OGT'}`;
                  image    = generateOGT();
            let   element  = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + image);
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            debug("Descarga en curso", 0);
        })

        // exportación del fichero
        $('#fileexport').click(function() {
            $('#filecontent').val(generateOGT());
            debug("Exportación del archivo terminada", 0);
        });

        function importOGT(image) {
            const validHex = /#[0-9A-F]{6}/;
            // Sanity checks. Hay contenido en el cuadro de importación?
            if (image.length == 0) { return {status: false, content: 'La imagen está vacía!'}};
            // filtremos todos los caracteres innecesarios: espacios y saltos de línea
            image = image.replace(/\r|\n| /g,'');
            // separamos la imagen por los punto y coma dobles
            image = image.split(';;');
            // aislamos la cabecera del resto
            let [cabecera, ...contenido] = image;
            // separamos la cabecera por los punto y comas
            cabecera = cabecera.split(';');
            // si la cabecera no tiene como mínimo cuatro entradas (id, version, alto, ancho), marcamos el archivo como invalido
            if (cabecera.length < 4) { return {status: false, content: '¡La imagen no es un fichero OGT válido!'}};
            let [id, version, alto, ancho, ...meta] = cabecera; // futuras versiones pueden tener más campos, como CRC
            // si el id no es OGT o OGTT, entonces no es un archivo parseable
            if (!(id === 'OGT' || id === 'OGTT')) { return {status: false, content: '¡La imagen no es un fichero OGT válido!'}};
            $('#filetype').val(id === 'OGT'? 1 : 2);
            // de momento ignoramos versión, aunque puede ser importante en el futuro
            if (version !== 'v0.5') {debug (`La versión de este fichero es ${version}; este parser solo ha sido probado con la versión 0.5. Puede que no funcione`, 2) };
            // si las medidas son inferiores a 2 pixels o mayores a 50 pixeles, cancelalo; y si no es un número, pues también
            if (isNaN(parseInt(ancho)) || isNaN(parseInt(alto))) { return {status: false, content: '¡Este fichero no es un OGT válido!'}};
            if (ancho < 2 || ancho > 50 || alto < 2 || alto > 50) { return {status: false, content: '¡Las dimensiones de esta imagen no son correctas!'}};
            // Si la imagen es un OGT prieto, hemos de descomprimirla
            if (id === 'OGTT') {
                contenido = LZW.decompress(contenido).split(';;');
            }
            // Redimensionamos el lienzo
            $('#filewidth').val(ancho);
            $('#fileheight').val(alto);
            editor.scene.keys.default.redim(true);
            // iteramos sobre la imagen
            for (y = 0; y < alto; y++) {
                let fila = [];
                // si por lo que fuera tenemos más filas que las indicadas en la cabecera, rellenamos los huecos con arrays vacios
                if (typeof contenido[y] === 'undefined' || contenido[y] === "") {
                    debug (`¡La fila ${y} está vacía! Tratando de recuperar lo que se pueda...`, 2);
                } else {
                    fila = contenido[y].split(';');
                }
                for (x = 0; x < ancho; x++) {
                    let color = "#FFFFFF";
                    // si por lo que fuera tenemos más columnas que las indicadas, o el color es inválido, marcamos el píxel de color blanco
                    if (!validHex.test(fila[x])) {
                        debug(`¡La columna ${x} de la fila ${y} no tiene un valor hexadecimal válido! Tratando de recuperar lo que se pueda...`, 2);
                    } else {
                        color = fila[x];
                    }
                    lienzo.contenido[y][x] = color;
                    lienzo.pixeles[y][x].setFillStyle(Phaser.Display.Color.HexStringToColor(color).color);
                }
            }
            
            return {status:true, content: 'Se ha cargado la imagen correctamente'};
        }

        function generateOGT() {
            const {contenido, ancho, alto} = lienzo,
                  formato = $('#filetype').val(); // 1 = RAW, 2 = TIGHT
            let result = "";
            switch (formato) {
                case "1": // OGT RAW
                    result += `OGT;v0.5;${ancho};${alto};;\n`;
                    for (y=0; y < alto; y++) {
                        for (x=0; x < ancho; x++) {
                            result+=`${contenido[y][x]};`
                        }
                        result += `;\n`;
                    }
                    break;
                case "2": // OGT PRIETO
                    result += `OGTT;v0.5;${ancho};${alto};;`;
                    let imagen = "";
                    for (y=0; y < alto; y++) {
                        for (x=0; x < ancho; x++) {
                            imagen+=`${contenido[y][x]};`
                        }
                        imagen+=`;`;
                    }
                    result += LZW.compress(imagen);
                    break;
                default:
                    debug("Algo malo ha pasado con el generador de OGT",1);
                    break;
            }

            return result;
        }


        let editor = new Phaser.Game(config);
        
        // Utilidades
        // interprete LZW con cálculo de CRC32
        const LZW = {
            compress: function(uncompressedData) {
                // Inicializamos variables
                let dataArray = (uncompressedData+"").split(""),
                    compressedData  = [],
                    dictionary = {},
                    phrase = dataArray[0],
                    code = 71,
                    i, currChar;
                for (i=1; i < dataArray.length; i++) {
                    currChar = dataArray[i];
                    if (dictionary[phrase+currChar] != null) {
                        phrase += currChar;
                    } else {
                        compressedData.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0));
                        dictionary[phrase + currChar] = code;
                        code++;
                        phrase = currChar;
                    }
                }
                compressedData.push(phrase.length > 1 ? dictionary[phrase] : phrase.charCodeAt(0));
                for (i=0; i < compressedData.length; i++) {
                    compressedData[i] = String.fromCharCode(compressedData[i]);
                }
                return compressedData.join("");
            },
            decompress: function(compressedData) {
                let dataArray= (compressedData+"").split(""),
                    dictionary = {},
                    currChar = dataArray[0],
                    oldPhrase = currChar,
                    uncompressedData = [currChar],
                    code = 71,
                    phrase, i;
                for (i = 1; i < dataArray.length; i++) {
                    let currCode = dataArray[i].charCodeAt(0);
                    if(currCode < 71) {
                        phrase = dataArray[i];
                    } else {
                        phrase = dictionary[currCode] ? dictionary[currCode] : (oldPhrase + currChar);
                    }
                    uncompressedData.push(phrase);
                    currChar = phrase.charAt(0);
                    dictionary[code] = oldPhrase + currChar;
                    code++;
                    oldPhrase = phrase;
                }
                return uncompressedData.join("");
            },
            CRC: function(string) {
                const generateTable = () => {
                    let c, table = [];
                    for (var i = 0; i < 256; i++) {
                        c = i;
                        for (var n = 0; n < 8; n++) {
                            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                        }
                        table[i] = c;
                    }
                    return table;
                }

                let crcTable = window.crcTable || (window.crcTable = generateTable()),
                    crc = 0 ^ (-1);
                string = unescape(encodeURIComponent(string));
                
                for (let i = 0; i < string.length; i++) {
                    crc = (crc >>> 8) ^ crcTable[(crc ^ string.charCodeAt(i)) && 0xFF];
                }
                 
                return (crc ^ (-1)) >>> 0;
            }
        }