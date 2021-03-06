const GAMECANVAS = document.getElementById("gameCanvas");
const CTX = GAMECANVAS.getContext("2d");

let HEIGHT = GAMECANVAS.height;
let WIDTH = GAMECANVAS.width;

let START = true;
let SHOWDEBUG = true;

let NUMBEROFBOIDZ = 13;

let MASTERBOID = {};
let ALLBOIDZ = [];

let TICK = 0;

let UPDATEVOODOO = {
  UPDATELIST: [
    {k:'keyinobj', v:"valueofobj"}
  ]
};

const initRun = () => {
  console.table([
      { group: 1, speed: 0.1, view: 23, angle: 42 },
      { group: 2, speed: 0.01, view: 2, angle: 23 },
      { group: 3, speed: 0.2, view: 3, angle: 12 },
      { group: 4, speed: 0.03, view: 42, angle: 54 },
      { group: 5, speed: 0.009, view: 64, angle: 4 },
    ]);

  calcCanvas();
  // MASTERBOID = new canvasVector(500,300,42,0.09);
  ALLBOIDZ = [];
  for(let i=0;i<=NUMBEROFBOIDZ;i++) {
    ALLBOIDZ[i] = new canvasVector(Math.random()*WIDTH,Math.random()*HEIGHT,Math.random()*360,(Math.random()*0.02)+0.05);
  }

  metaDraw();
};


const metaDraw = () => {
  TICK++;
  CTX.clearRect(0, 0, WIDTH, HEIGHT);
  // MASTERBOID.update();
  // MASTERBOID.draw();

  if(UPDATEVOODOO.UPDATELIST.length!==0) {
    for(let u in ALLBOIDZ) {
      for(let i in UPDATEVOODOO.UPDATELIST) {
        if(ALLBOIDZ[u][UPDATEVOODOO.UPDATELIST[i].k]||false) {
          ALLBOIDZ[u][UPDATEVOODOO.UPDATELIST[i].k] = UPDATEVOODOO.UPDATELIST[i].v;
        }
      }
    }
    UPDATEVOODOO.UPDATELIST = [];
  }

  for(let f in ALLBOIDZ) {
    for(let s in ALLBOIDZ) {
      if(f===s) continue;
      ALLBOIDZ[f].canISeeThat(ALLBOIDZ[s]);
    }
  }
  
  for(let b in ALLBOIDZ) {
    // if(TICK%(60*5)===0) ALLBOIDZ[b].DotFill = "RGBA(23,23,23,0.5)";
    ALLBOIDZ[b].update();
    ALLBOIDZ[b].draw(true);
  }

  if(START) window.requestAnimationFrame(metaDraw);
}

const debugToggle = () => {
  SHOWDEBUG = (SHOWDEBUG||false)? false : true;
};

const calcCanvas = () => {
  GAMECANVAS.height = Math.floor( window.innerHeight / 100 )*100;
  GAMECANVAS.width = Math.floor( window.innerWidth / 100 )*100;
  // GAMECANVAS.width -= 700;

  HEIGHT = GAMECANVAS.height;
  WIDTH = GAMECANVAS.width;
  // STATICPOS = {
  //   WIDTH: WIDTH/2,
  //   HEIGHT: HEIGHT/2.6,
  //   RADIUS: HEIGHT/8
  // }
};

// Converts from degrees to radians.
const toRadians = (degrees) => {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
const toDegrees = (radians) => {
  return radians * 180 / Math.PI;
};