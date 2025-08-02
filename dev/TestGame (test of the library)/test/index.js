import * as physics from "../lib/physengine.js";
import * as render_ from "../lib/simpleRender.js";
import { Player } from "../src/playable/player.js";
import { centerCameraOnEntity, Entity } from "../src/gameobjects/entity.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let accumulator = 0;
let elapsed = 0;
//init

const FLOOR = physics.createBodyBox({position: {x:360, y: 600}, size: {w:720,h:50}, isStatic: true, noRotation:true,dynamicFriction: 0.4, staticFriction:0.6});
const obstacleA = physics.createBodyBox({position: {x:220, y: 550}, size: {w:50,h:50}, isStatic: true, noRotation:true,dynamicFriction: 0.4, staticFriction:0.6}); //, staticFriction:0, dynamicFriction:0});
const obstacleB = physics.createBodyBox({position: {x:160, y: 535}, size: {w:50,h:80}, isStatic: true, noRotation:true,dynamicFriction: 0.4, staticFriction:0.6}); //, staticFriction: 0, dynamicFriction:0});
const obstacleC = physics.createBodyBox({position: {x:360, y: 535}, size: {w:150,h:20}, isStatic: true, noRotation:true,dynamicFriction: 0.2, staticFriction:0.3});
obstacleC.setAngle(0.2);


const testEntityB = new Entity({position: {x:160, y: 30}, size: {w: 30, h: 30}});
testEntityB.createBox({density:1, hasRotations: false, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6});

const testEntityC = new Entity({position: {x:360, y: 30}, size: {w: 30, h: 30}});
testEntityC.createBox({density:1, hasRotations: true, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6});

const testEntity = new Entity({position: {x:560, y: 400}, size: {w: 30, h: 30}});
testEntity.createBox({density:1, hasRotations: false, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6, hasGravity: true});
testEntity.addCircularLight({position: testEntity.position, radius: 350, intensity: 1, color: {r:255, b: 0, g:70}});

const testPlayer = new Player(testEntity, canvas);

const PHYSWORLD = new physics.PhysWorld([testEntity.body,testEntityB.body,testEntityC.body, FLOOR, obstacleA, obstacleB, obstacleC], {x:0, y:550});


function update(dt)
{

    testPlayer.move();
 
    centerCameraOnEntity(testPlayer.camera, testPlayer.entity, canvas);

    PHYSWORLD.step({dt, useRotations: true, iterations: 20, directionalFriction: true});

    
}

function render(ctx)
{
    
    for(let currentBody = 0; currentBody < PHYSWORLD.bodies.length; currentBody++)
    {
        render_.drawPolygon({ctx, vertices: PHYSWORLD.bodies[currentBody].transformedVertices, fillStyle:'crimson', alpha: 1})
    }
    
    testEntity.drawRigidbodyFull(ctx, 'blue',1);

    render_.drawCircle({ctx, point: testPlayer.entity.position, radius: 10, color: 'green', rotationIndicator: true});
    render_.setDarkOverlayUnified({ctx,x:-500, y:-500 ,width: canvas.width * 4, height: canvas.height * 4, lights: testEntity.lights, hasColor: true});
    render_.drawCircle({ctx, point: testPlayer.camera.position, radius: 10, color: 'green'});
}

function gameLoop(timestamp)
{

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;
    elapsed += dt;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update(dt);

    //render(ctx);
    testPlayer.camera.drawWithCamera({ctx, canvas, drawScene: () => render(ctx)});

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);