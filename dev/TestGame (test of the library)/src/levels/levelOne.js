import * as physics from "../../lib/physengine.js";
import * as render from "../../lib/simpleRender.js";
import { Levels } from "./level.js";
import { Entity, centerCameraOnEntity } from "../gameobjects/entity.js";
import { Player } from "../playable/player.js";

const canvas = document.getElementById('myCanvas');

//platforms

const FLOOR = physics.createBodyBox({position: {x:360, y: 600}, size: {w:720,h:50}, isStatic: true, noRotation:true,dynamicFriction: 0.4, staticFriction:0.6});

const obstacleA = physics.createBodyBox({position: {x:220, y: 550}, size: {w:50,h:50}, isStatic: true, noRotation:true,dynamicFriction: 0.4, staticFriction:0.6}); //, staticFriction:0, dynamicFriction:0});
const obstacleB = physics.createBodyBox({position: {x:40, y: 535}, size: {w:50,h:80}, isStatic: true, noRotation:true,dynamicFriction: 0.4, staticFriction:0.6}); //, staticFriction: 0, dynamicFriction:0});
const obstacleC = physics.createBodyBox({position: {x:360, y: 535}, size: {w:150,h:20}, isStatic: true, noRotation:true,dynamicFriction: 0.2, staticFriction:0.3});
obstacleC.setAngle(0.2);



const testEntityB = new Entity({position: {x:120, y: 30}, size: {w: 30, h: 30}});
testEntityB.createBox({density:1, hasRotations: false, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6});

const testEntityD = new Entity({position: {x:120, y: 60}, size: {w: 30, h: 30}});
testEntityD.createBox({density:1, hasRotations: false, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6});

const testEntityC = new Entity({position: {x:360, y: 10}, size: {w: 30, h: 30}});
testEntityC.createBox({density:1, hasRotations: true, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6});

//player
const testEntity = new Entity({position: {x:560, y: 400}, size: {w: 30, h: 30}});
testEntity.createBox({density:1, hasRotations: false, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6, hasGravity: false});
testEntity.addCircularLight({position: testEntity.position, radius: 350, intensity: 1, color: {r:255, b: 0, g:70}});
const testPlayer = new Player(testEntity, canvas);


let levelOne = new Levels(
    {
        player: testPlayer,
        bodies: [testEntityB.body,FLOOR,testPlayer.entity.body, obstacleA, obstacleB, testEntityC.body, obstacleC, testEntityD.body],
        entities: [],
        gravity: {x:0, y:550}
    }
)

levelOne.update = function(dt)
{
    levelOne.player.move();
    centerCameraOnEntity(levelOne.player.camera, levelOne.player.entity, canvas);
    levelOne.physWorld.step({dt, useRotations: true, iterations:20, directionalFriction: true, angleTolerance: 0.75});

}

levelOne.render = function(ctx)
{
    
    testPlayer.camera.drawWithCamera({ctx, canvas, drawScene: () => renderScene(ctx)});
}

function renderScene(ctx)
{

    for(let currentBody = 0; currentBody < levelOne.physWorld.bodies.length; currentBody++)
    {
        render.drawPolygon({ctx, vertices: levelOne.physWorld.bodies[currentBody].transformedVertices, fillStyle:'crimson', alpha: 1})
    }

    levelOne.player.entity.drawRigidbodyFull(ctx, 'blue',1);

    render.setDarkOverlayUnified({ctx,x:-500, y:-500 ,width: canvas.width * 4, height: canvas.height * 4, lights: testEntity.lights, hasColor: true});
}

export default levelOne;