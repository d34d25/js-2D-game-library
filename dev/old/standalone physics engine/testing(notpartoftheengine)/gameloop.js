import { PhysWorld } from "../src/physics.js";
import { createBodyBox, createBodyCircle, createBodyTriangle, Rigidbody } from "../src/rigidbody.js";
import { TestPlayer } from "./testplayer.js";

let physicsSamples = [];
let avgPhysicsTime = 0;
let fps = 0;
let frameCount = 0;
let fpsLastTime = performance.now();


const keysPressed = {};

window.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

let mousePos = { x: 0, y: 0 };
let mouseClicked = false;

window.addEventListener('mousemove', (e) => {
  mousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousedown', (e) => {
  mouseClicked = true;
});

window.addEventListener('mouseup', (e) => {
  mouseClicked = false;
});


const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let box = createBodyBox({position: {x: 210, y: 400}, size: {w: 35, h:35}, density: 1, restitution: 0.6,affectedByGravity: true});
box.angle = 0;

let box2 = createBodyTriangle({position: {x: 700, y: 550}, size: {w: 70, h:30}, density: 1, restitution: 0.6 ,isStatic: true, noRotation: true});
box2.angle = 0;

let triangle = createBodyBox({position: {x: 500, y: 240}, size: {w: 35, h:35}, density: 1, restitution: 0.6, staticFriction:0.6, dynamicFriction:0.4});
triangle.setAngle(0.1);

let floor = createBodyBox({position: {x: 210, y: 600}, size: {w: 1, h:400}, density: 1, restitution: 0, isStatic:true, noRotation: true});
floor.angle = 0;

let floor2 = createBodyBox({position: {x: 400, y: 100}, size: {w: 120, h:40}, density: 1, restitution: 0,isStatic:true, noRotation: true});
floor2.setAngle(0.1);

let floor3 = createBodyBox({position: {x: 600, y: 500}, size: {w: 120, h:40}, density: 1, restitution: 0,isStatic:true, noRotation: true, staticFriction:0, dynamicFriction:0});
floor3.setAngle(-0.1);

let theFloor = createBodyBox({position: {x: 720/2, y: 640}, size: {w: 720, h:40}, density: 1, restitution: 0,isStatic:true, noRotation: true, dynamicFriction:0.4, staticFriction:0.6});


const phys = new PhysWorld([box,triangle, floor, box2 ,floor2, floor3, theFloor], {x:0, y:150});

let testPlayer = new TestPlayer(createBodyBox({position: {x: 0, y: 0}, size: {w: 35, h:35}, density: 1, restitution: 0, affectedByGravity: true, linearDamping:{x: 0,y:0}, angularDamping: 0.7, noRotation: true}), phys); 

phys.bodies.push(testPlayer.body);

let lastTime = 0;
let accumulator = 0;

let frameCounter = 0;
let timeAccumulator = 0;

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const physicsStart = performance.now(); // ⏱️ Start physics timer

    timeAccumulator += dt;
    frameCounter++;

    testPlayer.move(dt, keysPressed, mousePos, mouseClicked);

    phys.step({dt: dt, useRotations: true, iterations: 20}); //-------------------------------------------------------------------------



    const physicsEnd = performance.now(); // ⏱️ End physics timer
    const physicsDuration = physicsEnd - physicsStart;

    physicsSamples.push(physicsDuration);
    if (physicsSamples.length > 100) physicsSamples.shift();
    avgPhysicsTime = physicsSamples.reduce((a, b) => a + b, 0) / physicsSamples.length;

    // 🧠 FPS calculation
    frameCount++;
    if (performance.now() - fpsLastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsLastTime = performance.now();
    }

    // 🎨 Draw all bodies
    for (let body of phys.bodies) {
        if (body.isCircle) {
            drawCircle(ctx, body.position, 'red', body.radius, body.angle);
        } else {
            drawPolygon(ctx, body.transformedVertices, 'blue');
        }
        //drawAABBOutline(ctx, body.aabb, 'red', 2);
    }

    // 🖼️ Draw debug info
    drawDebugStats(ctx);

    if (timeAccumulator >= 1) {
    console.log(`Bodies updated this second: ${Rigidbody.updatedBodiesCount}`);
    timeAccumulator = 0;
    frameCounter = 0;
    }

    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);


function drawPolygon(ctx, vertices, fillStyle = 'blue') 
{
    if (vertices.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) 
    {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.stroke();
}

function drawCircle(ctx, point, color = 'red', radius = 15, rotation = 0) {
    ctx.save();

    ctx.translate(point.x, point.y);
    ctx.rotate(rotation);  // rotation is in radians

    // Draw circle centered at (0, 0)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // Draw direction indicator (along +X axis)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);  // forward vector (along rotated axis)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function drawAABBOutline(ctx, aabb, color = 'red', lineWidth = 1) 
{
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    const width = aabb.maxX - aabb.minX;
    const height = aabb.maxY - aabb.minY;
    ctx.strokeRect(aabb.minX, aabb.minY, width, height);
}


function drawDebugStats(ctx) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${fps}`, 10, 20);
    ctx.fillText(`Physics: ${avgPhysicsTime.toFixed(2)} ms`, 10, 40);
    ctx.fillText(`Bodies: ${phys.bodies.length}`, 10, 60);
    ctx.restore();
}
