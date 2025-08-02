import { drawCircle, drawPolygon, drawCircleOutline, drawPolygonOutline, drawRectangle, drawGradientCircle, drawGradientTriangle, drawTriangle } from "./src/basicDrawing.js";
import { Camera } from "./src/camera.js";
import { drawFPS } from "./src/debugDrawing.js";
import { cropImage, loadImageLazy, playAnimation } from "./src/imageDrawing.js";
import { CircularLigth, ConeLight, setDarkOverlayUnified} from "./src/light.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const boxVertices = [
  { x: 100, y: 50 },
  { x: 300, y: 50 },
  { x: 300, y: 150 },
  { x: 100, y: 150 }
];

const lights = [
  new CircularLigth({ position: { x: 300, y: 150 }, radius: 200, intensity: 1, color: { r: 255, g: 0, b: 0 }  }),
  new ConeLight({position: { x: 700, y: 150 },angle: Math.PI/2 * 1.5,spread: 8,length: 200,intensity: 0.8})
];

const camera = new Camera({position: {x: 0, y: 0}, scale:1, rotation: 2});

var testImage = loadImageLazy("assets/Sprite-0001.png");
var sprites = [];

testImage.onLoad(() => {
  sprites = cropImage(testImage, 21, 21);
});

let angle = 0;

function startGameLoop() {
  let lastTime = performance.now();
  let fps = 0, frames = 0, lastFpsUpdate = lastTime;

  let elapsed = 0;

  function loop(now) {
    frames++;
    if (now - lastFpsUpdate >= 1000) {
      fps = frames;
      frames = 0;
      lastFpsUpdate = now;
    }

    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    elapsed += deltaTime;

    camera.rotation += 0.01;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.drawWithCamera({ctx, canvas, drawScene: () => draw(elapsed)});
    
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

startGameLoop();


function draw(elapsed)
{

  drawPolygonOutline({ctx: ctx, vertices: boxVertices});

    drawCircle({ctx: ctx, point: {x:200,y:200}, color: 'red', radius: 20, rotationIndicator: true});
    
    drawFPS();

    testImage.draw({ctx,x: 120,y: 20,scaleX: 5,scaleY: 5,rotationRadians: angle,alpha: 1, flipHorizontally: false});

    const currentSprite = playAnimation({
      spriteArray: sprites,
      startFrame: 0,
      endFrame: sprites.length - 1,
      animationSpeed: 3,
      elapsedTime: elapsed
    });

    angle += 0.01;
    drawRectangle({ctx,x: 100, y:100, color: 'green', rotation: angle, width: 300, height:100, alpha: 0.5});
    
    if (currentSprite) {
      currentSprite.draw({ctx,dx: 100,dy: 200,scaleX: 10,scaleY: 10,rotationRadians: angle,alpha: 1});
    }

    setDarkOverlayUnified({ctx, width: canvas.width * 2,height: canvas.height * 2,lights: lights,hasColor: true});

    drawGradientCircle({ctx,x: 500, y:500,radius:60});
    drawGradientTriangle({ctx,x: 500, y:500,width:60, height:70});
    drawTriangle({ctx,x: 100, y:500,width:60, height:70});

}