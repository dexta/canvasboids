class canvasBoid {
  constructor(x,y,d) {
    this.x = x;
    this.y = y;

    this.position = new Victor(x, y);
    
    this.velocity = new Victor(0,0);
    // this.velocity.rotateDeg(d);
    this.acceleration = new Victor(0.02,0.02);
    this.acceleration.rotateDeg(d);
    this.maxForce = 0.002;
    this.maxSpeed = 2;

    this.lastViewList = [];

    this.shipRadius = 30;
    this.viewRadius = 100;   
    this.cohesionRadius = 90;
    this.alignmentRadius = 70;
    this.separationRadius = 40;

    this.lineWidth = 2;
    this.strokeStyle = "#ee4d2e";
    this.fillStyle = "RGBA(23,23,23,0.5)";
    this.debugStyle = "RGBA(23,23,23,0.5)";
  }
  
  pointsPlus(degree,radius) {
    let radi = (radius||false)? radius : this.shipRadius;
    return {
      x: this.position.x + radi * Math.cos( toRadians(degree) ),
      y: this.position.y + radi * Math.sin( toRadians(degree) )
    }
  }

  drawCircle(cRadius,cColor,cLineW) {
    if(!(cRadius||false)) return;
    CTX.beginPath();
    CTX.lineWidth = cLineW||this.lineWidth;
    CTX.strokeStyle = cColor||this.strokeStyle;
    CTX.arc(this.position.x, this.position.y, cRadius, 0, 2 * Math.PI, false);
    CTX.stroke();
  }

  genFigure() {
    let direction = this.acceleration.angleDeg();
    return [
      this.pointsPlus(direction),
      this.pointsPlus(direction+150),
      this.pointsPlus(direction+165,this.shipRadius-(this.shipRadius/3)),
      this.pointsPlus(direction+195,this.shipRadius-(this.shipRadius/3)),
      this.pointsPlus(direction+210),      
    ];
  }

  canISeeThat(otherObj) {
    let cTrue = ( Math.pow( this.viewRadius + otherObj.shipRadius ,2) ) >= ( Math.pow(this.x-otherObj.x,2) + Math.pow(this.x-otherObj.x,2) );
    if(cTrue) {
      this.lastViewList.push(otherObj);
    }
    return cTrue;
  }


  align() {
    let steering = new Victor();
    let total = 0;
    for(let a in this.lastViewList) {
      let d = Math.atan2( this.lastViewList[a].position.y - this.position.y, this.lastViewList[a].position.x - this.position.x );
      if(d < this.alignmentRadius) {
        steering.add(this.lastViewList[a].velocity);
        total++;
      }
    }
    if(total > 0) {
      steering.divide(new Victor(total,total));
      steering.setMag(new Victor(this.maxSpeed,this.maxSpeed));
      // steering.setMag(this.maxSpeed);
      steering.subtract(this.velocity);
      steering.limit(this.maxForce, .001);
    }
    return steering;
  }

  separation() {
    let steering = new Victor();
    let total = 0;
    for(let a in this.lastViewList) {
      let d = Math.atan2( this.lastViewList[a].position.y - this.position.y, this.lastViewList[a].position.x - this.position.x );
      if(d < this.cohesionRadius) {
        let diff = new Victor(this.position);
        diff.subtract(this.lastViewList[a].position);
        diff.divide(new Victor(d * d));
        steering.add(diff);
        total++;
      }
    }
    if(total > 0) {
      steering.divide(new Victor(total,total));
      // steering.subtract(this.position)
      steering.setMag(new Victor(this.maxSpeed,this.maxSpeed));
      // steering.setMag(this.maxSpeed);
      steering.subtract(this.velocity);
      steering.limit(this.maxForce, .001);
    }
    return steering;
  }

  cohesion() {
    let steering = new Victor();
    let total = 0;
    for(let a in this.lastViewList) {
      let d = Math.atan2( this.lastViewList[a].position.y - this.position.y, this.lastViewList[a].position.x - this.position.x );
      if(d < this.cohesionRadius) {
        steering.add(this.lastViewList[a].velocity);
        total++;
      }
    }
    if(total > 0) {
      steering.divide(new Victor(total,total));
      steering.subtract(this.position)
      steering.setMag(new Victor(this.maxSpeed,this.maxSpeed));
      // steering.setMag(this.maxSpeed);
      steering.subtract(this.velocity);
      steering.limit(this.maxForce, .001);
    }
    return steering;
  }


  update() {
    let alignment = this.align();
    let cohesion = this.cohesion();
    let separation = this.separation();

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    // this.acceleration.add(separation);

    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed,0.75);
    // this.acceleration.multiply(0);
    this.lastViewList = [];

    if(this.position.x<this.shipRadius*-1) this.position.x = WIDTH+this.shipRadius;
    if(this.position.y<this.shipRadius*-1) this.position.y = HEIGHT+this.shipRadius;
    if(this.position.x>(WIDTH+this.shipRadius)) this.position.x = this.shipRadius*-1;
    if(this.position.y>(HEIGHT+this.shipRadius)) this.position.y = this.shipRadius*-1;
    this.x = this.position.x;
    this.y = this.position.y;
  }


  draw() {
    // this.drawCircle(this.separationRadius, "#FF2323", 4);
    // this.drawCircle(this.alignmentRadius, "#2323FF", 3);
    this.drawCircle(this.cohesionRadius, "#23FF23", 2);
    this.drawCircle(this.viewRadius, "#232342", 1);
    const figure = this.genFigure();

    CTX.beginPath();
    CTX.lineWidth = this.lineWidth;
    CTX.strokeStyle = this.strokeStyle;
    CTX.moveTo(figure[0].x,figure[0].y);
    for(let f=1,fl=figure.length-1;f<=fl;f++) {
      CTX.lineTo(figure[f].x,figure[f].y);  }
    CTX.lineTo(figure[0].x,figure[0].y);
    CTX.fillStyle = this.fillStyle;
    CTX.fill();
    CTX.stroke();
    // this.fillStyle = this.defaults.fillStyle;
    // this.strokeStyle = this.defaults.strokeStyle;

  }
}