class Paleta {
  colores = []; 

  constructor() {
   
    this.colores = [
      color(26,26,26),              
      color(214, 203, 178),             
      color(241, 240, 236),   
      color(166, 120, 60),            
      color(109, 110, 112),     
      color(45, 60, 73),    
    ];
  }

  darUnColor() {
    return random(this.colores);
  }

}