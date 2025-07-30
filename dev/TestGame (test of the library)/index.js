import * as physics from "./lib/physengine.js";
import * as render_ from "./lib/simpleRender.js";
import { Player } from "./player.js";
import { Entity } from "./src/gameobjects/entity.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let accumulator = 0;

//init

const FLOOR = physics.createBodyBox({position: {x:360, y: 600}, size: {w:720,h:50}, isStatic: true, noRotation:true});
const obstacleA = physics.createBodyBox({position: {x:220, y: 550}, size: {w:50,h:50}, isStatic: true, noRotation:true});
const obstacleB = physics.createBodyBox({position: {x:160, y: 535}, size: {w:50,h:80}, isStatic: true, noRotation:true});

const testEntity = new Entity({position: {x:360, y: 30}, size: {w: 30, h: 30}});
testEntity.createBox({density:1, hasRotations: true, bounciness: 0});
testEntity.addCircularLight({position: testEntity.position, radius: 350, intensity: 1, color: {r:255, b: 0, g:70}, alpha: 0.2});

const testPlayer = new Player(testEntity, canvas);

const PHYSWORLD = new physics.PhysWorld([testPlayer.entity.body, FLOOR, obstacleA, obstacleB], {x:0, y:150});

function update(dt)
{
    testPlayer.move();
    PHYSWORLD.step({dt, useRotations: true, iterations: 20});
}

function render(ctx)
{
    for(let currentBody = 1; currentBody < PHYSWORLD.bodies.length; currentBody++)
    {
        render_.drawPolygon({ctx, vertices: PHYSWORLD.bodies[currentBody].transformedVertices, fillStyle:'crimson', alpha: 1})
    }
    
    testEntity.drawRigidbodyFull(ctx, 'blue',1);

    render_.setDarkOverlayUnified({ctx,x:0, y:0 ,width: canvas.width, height: canvas.height, lights: testEntity.lights, hasColor: true});
}

function gameLoop(timestamp)
{

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update(dt);

    render(ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);