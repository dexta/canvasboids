class canvasVector {
  constructor(x,y,direction,speed) {
    this.X = x;
    this.Y = y;
    this.D = direction;
    this.S = speed;

    this.R = 30; // radius from x/y

    this.lastViewList = [];

    this.viewRadius = 95;
    this.separationRadius = 40;
    this.alignmentRadius = 70;
    this.cohesionRadius = 90;

    this.separationWeight = 1;
    this.alignmentWeight = 1;
    this.cohesionWeight = 1;


    this.lineWidth = 2;
    this.strokeStyle = "#ee4d2e";
    this.fillStyle = "RGBA(23,23,23,0.5)";
    this.debugStyle = "RGBA(23,23,23,0.5)";

    this.defaults = {
      speedMin: 0.01, 
      speedMax: 0.2, 
      lineWidth: 2,
      strokeStyle: "#ee4d2e",
      fillStyle: "RGBA(23,23,23,0.5)",
      debugStyle: "RGBA(23,23,23,0.5)",

    };
  }

  pointsPlus(degree,radius) {
    let radi = (radius||false)? radius : this.R;
    return {
      x: this.X + radi * Math.cos( toRadians(degree) ),
      y: this.Y + radi * Math.sin( toRadians(degree) )
    }
  }

  genFigure() {
    return [
      this.pointsPlus(this.D),
      this.pointsPlus(this.D+150),
      this.pointsPlus(this.D+165,this.R-(this.R/3)),
      this.pointsPlus(this.D+195,this.R-(this.R/3)),
      this.pointsPlus(this.D+210),      
    ];
  }

  canISeeThat(otherObj) {
    let cTrue = ( Math.pow( this.viewRadius + otherObj.R ,2) ) >= ( Math.pow(this.X-otherObj.X,2) + Math.pow(this.Y-otherObj.Y,2) );
    if(cTrue) {
      // otherObj.fillStyle = "#23FF23";
      this.lastViewList.push(otherObj);
    }
    return cTrue;
  }

  doAlignment() {
    // passe den winkel an
    let sumD = this.D;
    let total = 1;
    for(let a in this.lastViewList) {
      if( ( Math.pow( this.alignmentRadius + this.lastViewList[a].R ,2) ) >= 
          ( Math.pow(this.X-this.lastViewList[a].X,2) + Math.pow(this.Y-this.lastViewList[a].Y,2) )) {
        sumD += this.lastViewList[a].D;
        total++;  
      }
    }

    // this.D = ( ( (sumD/total) - this.D) + 360 )%360;
    // this.D = (sumD/total);
    return (sumD/total);
  }

  doCohesion() {
    // bewege dich auf den mittelpunkt des nachbaren zu
    let sumC = this.D;
    let count = 1;
    for(let c in this.lastViewList) {
      if( ( Math.pow( this.cohesionRadius + this.lastViewList[c].R ,2) ) >= 
          ( Math.pow(this.X-this.lastViewList[c].X,2) + Math.pow(this.Y-this.lastViewList[c].Y,2) )) {
        sumC = Math.atan2( this.lastViewList[c].Y - this.Y, this.lastViewList[c].X - this.X );
        count++;
      }
    }
    return (sumC/count);
  }

  doSeparation(otherObj) {

    let sumC = this.D;
    let total = 1;

    for(let s in this.lastViewList) {
      if(( Math.pow( this.separationRadius + this.lastViewList[s].R ,2) ) >= ( Math.pow(this.X-this.lastViewList[s].X,2) + Math.pow(this.Y-this.lastViewList[s].Y,2) )) {
        let distAngle = Math.atan2( this.lastViewList[s].Y - this.Y, this.lastViewList[s].X - this.X ) * 180 / Math.PI;
        let distPixel = Math.sqrt( Math.pow(this.lastViewList[s].Y - this.Y, 2) + Math.pow(this.lastViewList[s].X-this.X, 2) );
        if(distPixel<this.R/4) {
          if(distAngle<this.D+22.5||distAngle>this.D-22.5) {
            // in front
            this.S += this.S/3;
          } else {
            this.S -= this.S/3;
          }

        }
        sumC += (distAngle+180)*(1/distPixel);
        total++;
      }
    }

    return sumC/total;
    // if(( Math.pow( this.R + otherObj.R ,2) ) >= ( Math.pow(this.X-otherObj.X,2) + Math.pow(this.Y-otherObj.Y,2) )) { 
      // let distAngle = ((Math.atan2( otherObj.Y - this.Y, otherObj.X - this.X ) * 180 / Math.PI)+360)%360;
      // let distPixel = Math.sqrt( Math.pow(otherObj.Y - this.Y, 2) + Math.pow(otherObj.X-this.X, 2) );
      // // console.log(`Angle: ${distAngle} Pixel: ${distPixel}`);

      // let angleHalf = this.D - (distAngle+this.D)/2;
      // if( angleHalf < 12) { 
      //   this.D += angleHalf/16;
      //   this.S -= (this.S/5);

      //   this.fillStyle = "#FF2323";
      // } else {        
      //   this.S += (this.S/6);
      //   this.fillStyle = "#2323FF";
      // }

    // }
    // if(this.S<this.defaults.speedMin) this.S=this.defaults.speedMin;
    // if(this.S>this.defaults.speedMax) this.S=this.defaults.speedMax;
    
  }

  update() {
    // do the magic here
    if(this.lastViewList.length>0) {
      let haveAlign = this.doAlignment();
      let haveCohes = this.doCohesion();
      let haveSepar = this.doSeparation();
      let sumWeight = this.separationWeight+this.alignmentWeight+this.cohesionWeight;

      this.D = ( 
                  ( 
                    ( 
                      (haveAlign*this.alignmentWeight) +
                      (haveCohes*this.cohesionWeight) +
                      (haveSepar*this.separationWeight)
                     ) / sumWeight 
                  ) + 360 
                ) % 360;

    }
    
    // clear the brain

    this.lastViewList = [];

    let newCord = this.pointsPlus(this.D,this.R*this.S);
    this.X = newCord.x;
    this.Y = newCord.y;

    let speedNorm = (this.defaults.speedMax-this.defaults.speedMin)/2;
    if(this.S>speedNorm) { this.S -= speedNorm/10; } else { this.S += speedNorm/7; }
    if(this.X<this.R*-1) this.X = WIDTH+this.R;
    if(this.Y<this.R*-1) this.Y = HEIGHT+this.R;
    if(this.X>(WIDTH+this.R)) this.X = this.R*-1;
    if(this.Y>(HEIGHT+this.R)) this.Y = this.R*-1;
  }

  draw(debug) {
    // Dot in the center
    if(debug||false) {
      CTX.beginPath();
      CTX.lineWidth = this.lineWidth;
      CTX.strokeStyle = "grey";
      CTX.arc(this.X, this.Y, this.viewRadius, 0, 2 * Math.PI, false);
      CTX.stroke();
      CTX.beginPath();
      CTX.lineWidth = this.lineWidth;
      CTX.strokeStyle = "green";
      CTX.arc(this.X, this.Y, this.cohesionRadius, 0, 2 * Math.PI, false);
      CTX.stroke();
      CTX.beginPath();
      CTX.lineWidth = this.lineWidth;
      CTX.strokeStyle = "blue";
      CTX.arc(this.X, this.Y, this.alignmentRadius, 0, 2 * Math.PI, false);
      CTX.stroke();
      CTX.beginPath();
      CTX.lineWidth = this.lineWidth;
      CTX.strokeStyle = "red";
      CTX.arc(this.X, this.Y, this.separationRadius, 0, 2 * Math.PI, false);
      CTX.stroke();
      
      // CTX.beginPath();
      // CTX.lineWidth = this.lineWidth/2;
      // // CTX.strokeStyle = "#424242";
      // CTX.arc(this.X, this.Y, this.R, 0, 2 * Math.PI, false);
      // CTX.stroke();
    }
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
    this.fillStyle = this.defaults.fillStyle;
    this.strokeStyle = this.defaults.strokeStyle;
  }
}

class simpleC {
  constructor(x,y,r) {
    this.X = x;
    this.Y = y;
    this.R = r;
  }

  draw() {
    CTX.beginPath();
    CTX.lineWidth = 2;
    CTX.strokeStyle = "#000023";
    CTX.arc(this.X, this.Y, this.R, 0, 2 * Math.PI, false);
    CTX.stroke();
    CTX.beginPath();
    CTX.arc(this.X, this.Y, 2, 0, 2 * Math.PI, false);
    CTX.stroke();
  }

  collision(otherObj) {
    return ( Math.pow( this.R + otherObj.R ,2) ) >= ( Math.pow(this.X-otherObj.X,2) + Math.pow(this.Y-otherObj.Y,2) );
  }

  distAngle(otherObj) {
    return {
              angle: ((Math.atan2( otherObj.Y - this.Y, otherObj.X - this.X ) * 180 / Math.PI)+360)%360,
              dist: Math.sqrt( Math.pow(otherObj.Y - this.Y, 2) + Math.pow(otherObj.X-this.X, 2) )
            };
  }

  drawAngle(otherObj) {
    let andi = this.distAngle(otherObj);
    // andi.angle = (andi.angle+360)%360;
    CTX.beginPath();
    CTX.lineWidth = 3;
    CTX.strokeStyle = "#FF0000";
    CTX.moveTo(this.X,this.Y);
    CTX.lineTo(this.X + this.R * Math.cos( toRadians(andi.angle) ) , this.Y + this.R * Math.sin( toRadians(andi.angle) ) );
    CTX.stroke();
  }

}

let sT1 = {};
let sT2 = {};
let sT3 = {};
const shortTest = () => {
  CTX.clearRect(0,0,WIDTH,HEIGHT);
  sT1 = new simpleC(650,90,55);
  sT2 = new simpleC(780,295,50);
  sT3 = new simpleC(650,295,80);
  sT1.draw();
  sT2.draw();
  sT3.draw();
  let testTable = [
    {CollisiOn1:sT1.collision(sT1), CollisiOn2:sT1.collision(sT2), CollisiOn3:sT1.collision(sT3)},
    {CollisiOn1:sT2.collision(sT1), CollisiOn2:sT2.collision(sT2), CollisiOn3:sT2.collision(sT3)},
    {CollisiOn1:sT3.collision(sT1), CollisiOn2:sT3.collision(sT2), CollisiOn3:sT3.collision(sT3)},
  ];
  let testTable2 = [
    {AngleTo1:sT1.distAngle(sT1).angle, AngleTo2:sT1.distAngle(sT2).angle, AngleTo3:sT1.distAngle(sT3).angle},
    {AngleTo1:sT2.distAngle(sT1).angle, AngleTo2:sT2.distAngle(sT2).angle, AngleTo3:sT2.distAngle(sT3).angle},
    {AngleTo1:sT3.distAngle(sT1).angle, AngleTo2:sT3.distAngle(sT2).angle, AngleTo3:sT3.distAngle(sT3).angle},
  ];
  let testTable3 = [
    {DistTo1:sT1.distAngle(sT1).dist, DistTo2:sT1.distAngle(sT2).dist, DistTo3:sT1.distAngle(sT3).dist},
    {DistTo1:sT2.distAngle(sT1).dist, DistTo2:sT2.distAngle(sT2).dist, DistTo3:sT2.distAngle(sT3).dist},
    {DistTo1:sT3.distAngle(sT1).dist, DistTo2:sT3.distAngle(sT2).dist, DistTo3:sT3.distAngle(sT3).dist},
  ];
  console.table(testTable);
  console.table(testTable2);
  console.table(testTable3);
  sT3.drawAngle(sT1);
  sT3.drawAngle(sT2);
}