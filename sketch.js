// sketch.js
let miPaleta; // Declara la variable para el objeto Paleta, que maneja la selección de colores.
let miLienzo; // Declara la variable para el objeto Lienzo, que gestiona el área de dibujo y las brochas.
let microfono; // Declara la variable para el objeto p5.AudioIn, que capta la entrada de audio del micrófono.
let analizadorFFT; // Declara la variable para el objeto p5.FFT, que analiza las frecuencias del audio (graves, agudos).
let miCapaPollock; // Declara la variable para un buffer gráfico (p5.Graphics), donde se dibuja todo el arte. Esto permite efectos de acumulación.

// --- Constantes para ajustar la sensibilidad ---
const UMBRAL_GRITO = 0.4; // Umbral de volumen para detectar un "grito" (volumen alto).
// -> Se puede modificar este valor (0.0 a 1.0) para ajustar qué tan fuerte debe ser la voz para activar las salpicaduras de "grito".
const UMBRAL_GRAVES = 0.7; // Umbral de energía para detectar sonidos graves.
// -> Se puede modificar este valor (0.0 a 1.0) para ajustar la sensibilidad de los graves para los cortes y salpicaduras de fondo.
const UMBRAL_AGUDOS = 0.5; // Umbral de energía para detectar sonidos agudos.
// -> Se puede modificar este valor (0.0 a 1.0) para ajustar la sensibilidad de los agudos para las salpicaduras de puntos.

function preload() {
    miPaleta = new Paleta(); // Crea una nueva instancia del objeto Paleta.
  
}

function setup() {
    createCanvas(windowWidth, windowHeight); // Crea un canvas que ocupa todo el ancho y alto de la ventana del navegador.

    // Inicializa el buffer gráfico con las mismas dimensiones que el lienzo principal
    miCapaPollock = createGraphics(windowWidth, windowHeight); // Crea un lienzo gráfico fuera de pantalla para dibujar.
    // Establece un color de fondo inicial para el buffer, similar al "fondo beige" sugerido
    miCapaPollock.background(50, 50, 50); // Establece un color de fondo beige claro en el buffer gráfico.
    // -> Se puede modificar el color RGB (ej: background(255, 0, 0); para rojo) para cambiar el color de fondo inicial.

    miLienzo = new Lienzo(miPaleta); // Crea una nueva instancia del objeto Lienzo, pasándole la paleta de colores.
    miLienzo.preparar(windowWidth, windowHeight); // Llama al método preparar del Lienzo, pasando las dimensiones de la ventana para inicializar las brochas.

    microfono = new p5.AudioIn(); // Crea un objeto para la entrada de audio del micrófono.
    microfono.start(); // Inicia la captura de audio del micrófono.

    analizadorFFT = new p5.FFT(); // Crea un objeto para realizar un análisis de Fourier (FFT) del audio.
    analizadorFFT.setInput(microfono); // Conecta la entrada del micrófono al analizador FFT.

    // Crea un párrafo de texto para las instrucciones iniciales.
    let textoInstrucciones = createP("Haz clic o toca la pantalla para habilitar el micrófono y empezar a pintar con tu voz.");
    textoInstrucciones.position(width / 2 - 200, height / 2 - 50); // Posiciona el texto en el centro de la pantalla.
    textoInstrucciones.style('color', 'white'); // Establece el color del texto a blanco.
    textoInstrucciones.style('max-width', '400px'); // Establece el ancho máximo del contenedor de texto.
    textoInstrucciones.style('font-size', '20px'); // Establece el tamaño de la fuente.
    textoInstrucciones.style('text-align', 'center'); // Centra el texto.
    textoInstrucciones.style('background-color', 'rgba(0,0,0,0.7)'); // Establece un fondo semitransparente oscuro para el texto.
    textoInstrucciones.style('padding', '20px'); // Añade padding alrededor del texto.
    textoInstrucciones.style('border-radius', '10px'); // Añade bordes redondeados al contenedor del texto.
    // -> Se pueden modificar todas las propiedades de estilo (color, tamaño, fondo, etc.) para personalizar la apariencia de las instrucciones.
}

function draw() {
    // Dibuja todo en el buffer miCapaPollock, no directamente en el canvas principal
    miLienzo.dibujar(miCapaPollock); // Llama al método dibujar del Lienzo, pasándole el buffer gráfico donde debe dibujar.

    // Muestra el contenido del buffer en el canvas principal
    image(miCapaPollock, 0, 0); // Dibuja el contenido del buffer gráfico sobre el canvas principal. Esto hace que el dibujo persista.

    if (getAudioContext().state !== 'running') return; // Si el contexto de audio no está activo, detiene la ejecución de draw (hasta que el usuario haga clic).

    let volumenActual = microfono.getLevel(); // Obtiene el nivel de volumen actual del micrófono (0.0 a 1.0).
    analizadorFFT.analyze(); // Realiza el análisis de frecuencias del audio.

    let bajos = analizadorFFT.getEnergy('bass'); // Obtiene la energía de la banda de frecuencias "bass" (graves).
    let agudos = analizadorFFT.getEnergy('highMid'); // Obtiene la energía de la banda de frecuencias "highMid" (agudos medios).
    let superAgudos = analizadorFFT.getEnergy('treble'); // Obtiene la energía de la banda de frecuencias "treble" (agudos).

    let bajosNorm = map(bajos, 0, 255, 0, 1); // Normaliza el valor de "bajos" de 0-255 a 0-1.
    let agudosNorm = map(agudos, 0, 255, 0, 1); // Normaliza el valor de "agudos" de 0-255 a 0-1.
    let superAgudosNorm = map(superAgudos, 0, 255, 0, 1); // Normaliza el valor de "superAgudos" de 0-255 a 0-1.

console.log(`Bajos: ${bajosNorm.toFixed(2)}, Agudos: ${agudosNorm.toFixed(2)}, Super Agudos: ${superAgudosNorm.toFixed(2)}`);
    if (volumenActual > UMBRAL_GRITO) { // Si el volumen actual excede el umbral de grito...
        let intensidad = map(volumenActual, UMBRAL_GRITO, 1, 1, 0.5); // Calcula una intensidad basada en qué tanto se supera el umbral.
        for (let i = 0; i < intensidad; i++) { // Bucle para dibujar múltiples salpicaduras según la intensidad.
            miLienzo.salpicar(random(width), random(height), miCapaPollock, 'grito'); // Llama a salpicar en el lienzo, en una posición aleatoria, usando el buffer y el tipo 'grito'.
        }
    }

    // --- BLOQUE MODIFICADO PARA "CORTAR" Y REINICIAR TRAZOS CON BAJOS ---
    if (bajosNorm > UMBRAL_GRAVES) { // Si la energía de los graves excede el umbral...
        // Ejecutar el corte y reinicio de trazo solo ocasionalmente
        // para evitar un reinicio constante con ruido de fondo.
        if (frameCount % 60 === 0) { // Verifica si el número de fotogramas es divisible por 60 (cada 60 frames, aprox. 1 segundo).
            for (let brocha of miLienzo.brochas) { // Itera sobre todas las brochas.
                // Reiniciar la posición de la brocha a un nuevo punto aleatorio
                brocha.x = random(width); // Mueve la brocha a una nueva posición X aleatoria.
                brocha.y = random(height); // Mueve la brocha a una nueva posición Y aleatoria.
                brocha.px = brocha.x; // Establece la posición previa X igual a la actual, para "cortar" el trazo.
                brocha.py = brocha.y; // Establece la posición previa Y igual a la actual, para "cortar" el trazo.
                brocha.cambiarColorYOffset(miLienzo.paleta, width, height); // Cambia el color y el offset de la brocha.
            }
        }
        // -> Se puede modificar '60' a otro número para cambiar la frecuencia con la que los graves reinician los trazos (ej: '30' para cada 0.5 segundos).

        // Las salpicaduras de fondo para los graves pueden seguir como estaban.
        if (frameCount % 10 === 0) { // Si el número de fotogramas es divisible por 10 (cada 10 frames).
            miLienzo.salpicar(random(width), random(height), miCapaPollock, 'fondo'); // Llama a salpicar en el lienzo, en una posición aleatoria, usando el buffer y el tipo 'fondo'.
        }
        // -> Se puede modificar '10' a otro número para cambiar la frecuencia con la que los graves generan salpicaduras de fondo.
    }

    if (agudosNorm > UMBRAL_AGUDOS || superAgudosNorm > UMBRAL_AGUDOS) { // Si la energía de los agudos medios o super agudos excede el umbral...
        let brochaReferencia = miLienzo.brochas[0]; // Toma la primera brocha como referencia para la posición.
        let posX = brochaReferencia.x; // Obtiene la posición X de la brocha de referencia.
        let posY = brochaReferencia.y; // Obtiene la posición Y de la brocha de referencia.

        miLienzo.puntear(posX + random(-80, 80), posY + random(-80, 80), miCapaPollock, 'unica'); // Llama a puntear cerca de la brocha de referencia, usando el buffer y el tipo 'unica'.
        miLienzo.salpicar(posX + random(-80, 80), posY + random(-80, 80), miCapaPollock, 'normal'); // Llama a salpicar cerca de la brocha de referencia, usando el buffer y el tipo 'normal'.
        // -> Se pueden modificar los valores '-80, 80' para ajustar el rango de dispersión de los puntos y salpicaduras de agudos.
    }

    // Este bloque de cambio de color general sigue funcionando como antes,
    // pero ahora las brochas también pueden cambiar de color con los graves.
    if (millis() > miLienzo.siguienteTiempoDeCorte) { // Si el tiempo actual excede el tiempo programado para el siguiente corte...
        for (let brocha of miLienzo.brochas) { // Itera sobre todas las brochas.
            brocha.cambiarColorYOffset(miLienzo.paleta, width, height); // Cambia el color y el offset de cada brocha.
        }
        miLienzo.siguienteTiempoDeCorte = millis() + random(miLienzo.INTERVALO_CORTE_MIN, miLienzo.INTERVALO_CORTE_MAX); // Establece un nuevo tiempo aleatorio para el próximo corte.
    }
}

function mousePressed() { // Se ejecuta cuando se hace clic o se toca la pantalla.
    let instrucciones = select('p'); // Selecciona el elemento de párrafo (las instrucciones).
    if (instrucciones) { // Si las instrucciones existen...
        instrucciones.remove(); // Las elimina de la pantalla.
    }
    if (getAudioContext().state !== 'running') { // Si el contexto de audio no está activo (pausado)...
        getAudioContext().resume(); // Lo reanuda, permitiendo que el micrófono funcione.
    }
}

function windowResized() { // Se ejecuta cuando se redimensiona la ventana del navegador.
    resizeCanvas(windowWidth, windowHeight); // Redimensiona el canvas principal para que ocupe el nuevo tamaño de la ventana.
    miCapaPollock = createGraphics(windowWidth, windowHeight); // Re-inicializa el buffer gráfico con las nuevas dimensiones.
    miCapaPollock.background(255, 250, 240); // Establece el fondo del buffer gráfico.
    miLienzo.preparar(windowWidth, windowHeight); // Vuelve a preparar el lienzo, actualizando las dimensiones para las brochas.
}