// brocha.js
class Brocha {
  x; // Posición actual de la brocha en el eje X.
  y; // Posición actual de la brocha en el eje Y.
  px; // Posición previa de la brocha en el eje X (usada para dibujar la línea).
  py; // Posición previa de la brocha en el eje Y (usada para dibujar la línea).
  color; // Color actual de la brocha.
  offsetX; // Offset aleatorio en X para el movimiento de la brocha.
  offsetY; // Offset aleatorio en Y para el movimiento de la brocha.
  id; // Un identificador único para cada brocha, usado para variar el comportamiento.
  noiseOffsetX; // Offset para el ruido Perlin en X, para un movimiento orgánico.
  noiseOffsetY; // Offset para el ruido Perlin en Y, para un movimiento orgánico.

  constructor(id, anchoCanvas, altoCanvas, paleta) {
    this.id = id; // Asigna el ID a la brocha.
    this.x = anchoCanvas / 2; // Inicializa la posición X en el centro del canvas.
    this.y = altoCanvas / 2; // Inicializa la posición Y en el centro del canvas.
    this.px = anchoCanvas / 2; // Inicializa la posición previa X en el centro.
    this.py = altoCanvas / 2; // Inicializa la posición previa Y en el centro.
    this.color = paleta.darUnColor(); // Obtiene un color inicial de la paleta.
    // Los offsets ahora son más como "atractores" o puntos de referencia para el movimiento de ruido
    this.offsetX = random(-anchoCanvas / 4, anchoCanvas / 4); // Establece un offset X aleatorio.
    this.offsetY = random(-altoCanvas / 4, altoCanvas / 4); // Establece un offset Y aleatorio.
    // -> Se pueden modificar los valores '-anchoCanvas/4, anchoCanvas/4' para ajustar el rango de los atractores de las brochas.

    // Inicializar offsets de ruido para cada brocha de forma diferente
    this.noiseOffsetX = random(1000); // Inicializa un offset de ruido Perlin aleatorio para X.
    this.noiseOffsetY = random(2000); // Inicializa un offset de ruido Perlin aleatorio para Y.
  }

  // El método 'actualizar' ya no recibe objetivoX, objetivoY del mouse
  actualizar() {
    this.px = this.x; // Guarda la posición actual como la posición previa.
    this.py = this.y; // Guarda la posición actual como la posición previa.

    // Mover la brocha usando ruido Perlin para un movimiento autónomo orgánico
    // El 'id' y 'frameCount' aseguran que cada brocha tenga un patrón de movimiento único.
    let targetX = map(noise(this.noiseOffsetX + frameCount * 0.005), 0, 1, 0, width); // Calcula un objetivo X usando ruido Perlin, que varía con el tiempo.
    let targetY = map(noise(this.noiseOffsetY + frameCount * 0.005), 0, 1, 0, height); // Calcula un objetivo Y usando ruido Perlin, que varía con el tiempo.
    // -> Se puede modificar '0.005' para cambiar la velocidad del movimiento orgánico de la brocha.
    // -> Se pueden modificar los rangos '0, width' y '0, height' para limitar el área de movimiento de la brocha.

    // Las brochas principales pueden tener su propio offset aleatorio para mayor variedad
    // Y un poco de inercia para un movimiento suave
    this.x += (targetX + this.offsetX - this.x) / (15 + this.id * 3); // Mueve la brocha hacia el objetivo con cierta inercia (suavidad).
    this.y += (targetY + this.offsetY - this.y) / (15 + this.id * 3); // Mueve la brocha hacia el objetivo con cierta inercia (suavidad).
    // -> Se puede modificar '15' para cambiar la inercia general del movimiento (números más altos = más lento/suave).
    // -> Se puede modificar '3' para cambiar la diferencia de inercia entre las brochas.

    // Opcional: añadir un pequeño movimiento aleatorio para "nerviosismo"
    this.x += random(-0.5, 0.5); // Añade un pequeño movimiento aleatorio en X para un efecto de "nerviosismo".
    this.y += random(-0.5, 0.5); // Añade un pequeño movimiento aleatorio en Y para un efecto de "nerviosismo".
    // -> Se pueden modificar los valores '-0.5, 0.5' para ajustar la intensidad del "nerviosismo".
  }

  // 'gotear' ahora acepta el buffer gráfico como argumento.
  gotear(buffer) { // Dibuja un trazo de la brocha en el buffer.
    // Usa buffer.dist para calcular la distancia en el contexto del buffer.
    let s = random(1, 5) + 30 / buffer.dist(this.px, this.py, this.x, this.y); // Calcula el grosor de la línea basándose en la velocidad de la brocha.
    // -> Se pueden modificar los valores '1, 5' para cambiar el rango base del grosor.
    // -> Se puede modificar '30' para cambiar la influencia de la velocidad en el grosor.
    s = buffer.min(15, s); // Limita el grosor máximo de la línea.
    // -> Se puede modificar '15' para cambiar el grosor máximo de las líneas.

    // Aplica blendMode antes de dibujar la línea para el efecto de fusión.
    buffer.blendMode(buffer.BLEND); // O buffer.LIGHTEST; // Establece el modo de mezcla a MULTIPLY, lo que hace que los colores se oscurezcan al superponerse.
    // -> Se puede experimentar con otros modos de mezcla de p5.js, como buffer.DARKEN, buffer.ADD, buffer.SCREEN, etc. para diferentes efectos visuales.

    // Usa buffer.color para crear colores en el contexto del buffer.
    let colorGoteo1 = buffer.color(buffer.red(this.color), buffer.green(this.color), buffer.blue(this.color), random(50, 150)); // Crea un color con transparencia variable.
    // -> Se pueden modificar los valores '100, 220' para cambiar la transparencia de los trazos.

    buffer.strokeWeight(s); // Establece el grosor del trazo.
    buffer.stroke(colorGoteo1); // Establece el color del trazo.
    // Dibuja la línea en el buffer.
    buffer.line(this.px, this.py, this.x, this.y); // Dibuja una línea desde la posición previa a la actual.

    let colorGoteo2 = buffer.color(buffer.red(this.color), buffer.green(this.color), buffer.blue(this.color), random(50, 150)); // Crea un segundo color para un efecto espejo.
    buffer.stroke(colorGoteo2); // Establece el segundo color del trazo.
    // Dibuja la línea espejo en el buffer.
    buffer.line(buffer.width - this.px, buffer.height - this.py, buffer.width - this.x, buffer.height - this.y); // Dibuja una línea espejada.
    // -> Se puede eliminar esta línea si no se desea el efecto espejo.

    // Restablece el blendMode del buffer a su valor por defecto (BLEND) después de dibujar las líneas
    // para no afectar otros elementos que se dibujen en el buffer.
    buffer.blendMode(buffer.BLEND); // Restablece el modo de mezcla a su valor por defecto.
  }

  // --- MÉTODO AÑADIDO ---
  // Este método permite que el lienzo cambie el color y el atractor de la brocha
  cambiarColorYOffset(paleta, anchoCanvas, altoCanvas) { // Cambia el color y los offsets de la brocha.
    this.color = paleta.darUnColor(); // Asigna un nuevo color a la brocha desde la paleta.
    this.offsetX = random(-anchoCanvas / 4, anchoCanvas / 4); // Asigna un nuevo offset X aleatorio.
    this.offsetY = random(-altoCanvas / 4, altoCanvas / 4); // Asigna un nuevo offset Y aleatorio.
  }
}