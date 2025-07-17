// lienzo.js
class Lienzo {
  paleta; // Propiedad para almacenar la paleta de colores.
  brochas = []; // Un array para almacenar los objetos Brocha.
  NUM_BROCHAS = 3; // Número de brochas a utilizar en el lienzo.
  // -> Se puede modificar este número para tener más o menos líneas en movimiento.
  semilla; // Semilla para las funciones de ruido Perlin, usadas en las salpicaduras.

  siguienteTiempoDeCorte; // Almacena el tiempo en milisegundos para el próximo "corte" de color/offset.
  INTERVALO_CORTE_MIN = 5000; // Intervalo mínimo en milisegundos (5 segundos) para el cambio de color/offset.
  INTERVALO_CORTE_MAX = 15000; // Intervalo máximo en milisegundos (15 segundos) para el cambio de color/offset.
  // -> Se pueden modificar estos valores para que los colores de las brochas cambien más o menos seguido.

  constructor(paletaDeColores) {
    this.paleta = paletaDeColores; // Asigna la paleta de colores pasada al constructor.
  }

  // 'preparar' ya no necesita los parámetros de ancho/alto del canvas principal,
  // y no llama a background() en el canvas principal.
  preparar(anchoCanvas, altoCanvas) {
    // createCanvas ya se llamó en sketch.js.
    // noStroke() no es necesario aquí si se maneja en los métodos de dibujo del buffer.
    this.semilla = random(1000); // Inicializa la semilla para el ruido Perlin.

    // No se llama a background() aquí, el buffer ya tiene su fondo en sketch.js.

    for (let i = 0; i < this.NUM_BROCHAS; i++) { // Bucle para crear el número de brochas definido.
      // Pasa las dimensiones del canvas al constructor de Brocha
      let nuevaBrocha = new Brocha(i, anchoCanvas, altoCanvas, this.paleta); // Crea una nueva instancia de Brocha.
      this.brochas.push(nuevaBrocha); // Agrega la nueva brocha al array de brochas.
    }

    this.siguienteTiempoDeCorte = millis() + random(this.INTERVALO_CORTE_MIN, this.INTERVALO_CORTE_MAX); // Establece el primer tiempo para el corte de color/offset.
  }

  // 'dibujar' ahora acepta el buffer gráfico como argumento.
  dibujar(buffer) {
    // El cambio de color general ya no se maneja aquí, sino en sketch.js.

    for (let i = 0; i < this.NUM_BROCHAS; i++) { // Itera sobre cada brocha.
      let brochaActual = this.brochas[i]; // Obtiene la brocha actual.
      brochaActual.actualizar(); // Llama al método actualizar de la brocha para moverla.

      if (frameCount > 40) { // Asegura que las brochas empiecen a gotear después de 40 frames (evita un inicio brusco).
        brochaActual.gotear(buffer); // Llama al método gotear de la brocha, pasándole el buffer donde debe dibujar.
      }
    }
  }

  // 'salpicar' ahora acepta el buffer como argumento.
  salpicar(posicionX, posicionY, buffer, tipoDeCapa = 'normal') { // Dibuja salpicaduras en una posición dada y en un buffer específico.
    let colorCrudo = this.paleta.darUnColor(); // Obtiene un color de la paleta.
    // Usa buffer.color para crear colores en el contexto del buffer.
    let c = buffer.color(buffer.red(colorCrudo), buffer.green(colorCrudo), buffer.blue(colorCrudo)); // Crea un objeto color para el buffer.

    posicionX += random(-15, 15); // Añade un pequeño offset aleatorio a la posición X.
    posicionY += random(-15, 15); // Añade un pequeño offset aleatorio a la posición Y.
    // -> Se pueden modificar los valores '-15, 15' para ajustar la dispersión inicial de las salpicaduras.

    let movimientoX = random(-100, 100); // Define un rango de movimiento aleatorio para las salpicaduras en X.
    let movimientoY = random(-100, 100); // Define un rango de movimiento aleatorio para las salpicaduras en Y.
    // -> Se pueden modificar los valores '-100, 100' para ajustar la amplitud del movimiento de las salpicaduras.

    let numGotas = 40; // Número de gotas individuales por salpicadura.
    let sFactor = 200; // Factor para el tamaño de la gota, influenciado por la distancia.
    let aFactor = 5; // Factor para la transparencia de la gota.

    switch (tipoDeCapa) { // Controla las propiedades de las salpicaduras según su tipo.
      case 'fondo': // Manchas más tenues para el fondo (activadas por graves).
        numGotas = 20; // Menos gotas.
        sFactor = 80; // Gotas más pequeñas.
        aFactor = 2; // Más transparentes.
        c = buffer.color(buffer.red(colorCrudo), buffer.green(colorCrudo), buffer.blue(colorCrudo), random(50, 100)); // Color más opaco.
        // -> Se pueden ajustar estos valores para cambiar la apariencia de las salpicaduras de fondo.
        break;
      case 'grito': // Manchas grandes y densas (activadas por gritos).
        numGotas = 10; // Más gotas.
        sFactor = 200; // Gotas más grandes.
        aFactor = 10; // Menos transparentes.
        c = buffer.color(buffer.red(colorCrudo), buffer.green(colorCrudo), buffer.blue(colorCrudo), random(180, 255)); // Color muy opaco.
        // -> Se pueden ajustar estos valores para cambiar la apariencia de las salpicaduras de grito.
        break;
        // 'normal' o cualquier otro caso usará los valores por defecto
    }

    for (let i = 0; i < numGotas; i++) { // Bucle para dibujar cada gota individual.
      this.semilla += 0.01; // Incrementa la semilla para variar el ruido Perlin.
      // Usa el contexto del buffer para noise y dist.
      let x = posicionX + movimientoX * (0.5 - buffer.noise(this.semilla + i)); // Calcula la posición X de la gota usando ruido Perlin.
      let y = posicionY + movimientoY * (0.5 - buffer.noise(this.semilla + 2 * i)); // Calcula la posición Y de la gota usando ruido Perlin.

      let s = sFactor / buffer.dist(posicionX, posicionY, x, y); // Calcula el tamaño de la gota basado en la distancia al centro.
      if (s > 20) s = 20; // Limita el tamaño máximo de la gota.
      // -> Se puede modificar '20' para cambiar el tamaño máximo de las gotas.
      let a = 255 - s * aFactor; // Calcula la transparencia de la gota.
      a = buffer.constrain(a, 0, 255); // Asegura que la transparencia esté en el rango válido (0-255).

      buffer.noStroke(); // Dibuja sin borde en el buffer.
      // Usa buffer.color para manipular la transparencia del color en el contexto del buffer.
      c = buffer.color(buffer.red(c), buffer.green(c), buffer.blue(c), a); // Aplica la transparencia al color.
      buffer.fill(c); // Rellena con el color en el buffer.
      let x2 = x + random(-5, 5);
      let y2 = y + random(-5, 5);
      buffer.line(x, y, x2, y2); // Dibuja la elipse en el buffer.
      this.semilla += 0.01; // Incrementa la semilla nuevamente para mayor variación.
    }
  }

  // 'puntear' ahora acepta el buffer como argumento.
  puntear(posicionX, posicionY, buffer, tipoDeCapa = 'normal') { // Dibuja puntos en una posición dada y en un buffer específico.
    let colorCrudo = this.paleta.darUnColor(); // Obtiene un color de la paleta.
    // Usa buffer.color para crear colores en el contexto del buffer.
    let c = buffer.color(buffer.red(colorCrudo), buffer.green(colorCrudo), buffer.blue(colorCrudo)); // Crea un objeto color para el buffer.

    let numPuntos = 1; // Número de puntos por grupo.
    let spread = 30; // Rango de dispersión de los puntos.
    let pointSize = 1; // Tamaño base de los puntos.
    let alpha = 100; // Transparencia base de los puntos.

    switch (tipoDeCapa) { // Controla las propiedades de los puntos según su tipo.
      case 'unica': // Puntos un poco más grandes (para agudos).
        numPuntos = 1; // Más puntos.
        spread = 0.5; // Mayor dispersión.
        pointSize = 2; // Puntos más grandes.
        alpha = 180; // Menos transparentes.
        // -> Se pueden ajustar estos valores para cambiar la apariencia de los puntos activados por agudos.
        break;
      case 'doble': // Puntos de tamaño regular (para agudos).
        numPuntos = 1; // Número intermedio de puntos.
        spread = 0.5; // Dispersión intermedia.
        pointSize = 1; // Tamaño intermedio.
        alpha = 150; // Transparencia intermedia.
        // -> Se pueden ajustar estos valores para cambiar la apariencia de los puntos activados por agudos (si se usara este tipo).
        break;
    }

    for (let i = 0; i < numPuntos; i++) { // Bucle para dibujar cada punto individual.
      let x = posicionX + random(-spread, spread); // Calcula la posición X del punto dentro del rango de dispersión.
      let y = posicionY + random(-spread, spread); // Calcula la posición Y del punto dentro del rango de dispersión.

      let alphaPunto = random(alpha * 0.8, alpha); // Variación de transparencia para cada punto.
      // Usa buffer.color para manipular la transparencia del color en el contexto del buffer.
      c = buffer.color(buffer.red(c), buffer.green(c), buffer.blue(c), alphaPunto); // Aplica la transparencia al color del punto.
      buffer.fill(c); // Rellena con el color en el buffer.
      buffer.ellipse(x, y, pointSize); // Dibuja la elipse (punto) en el buffer.
    }
  }
}