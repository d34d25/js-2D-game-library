import * as physics from "../../lib/physengine.js";
import * as render from "../../lib/simpleRender.js";
import { Levels } from "./level.js";
import { Entity, centerCameraOnEntity } from "../gameobjects/entity.js";
import { Player } from "../playable/player.js";
import { levelOneData } from "./levelsData.js";

const canvas = document.getElementById('myCanvas');

let levelData = levelOneData;


//platforms
let bodies = [];
let bodyLessEntities = [];
let lights = [];

const testCircle = physics.createBodyCircle({position: {x:0,y:0}, radius: 50, density: 1, restitution: 0, affectedByGravity: false});


for(let i = 0; i < levelData.length; i++)
{
    
    if(levelData[i].isEntity)
    {
        console.log("called");
        let tempEntity = new Entity({position: levelData[i].position, size: levelData[i].size, radius:levelData[i].radius});

        console.log("levelData lights length: ", levelData[i].lights.length);

        if(levelData[i].lights && levelData[i].lights.length > 0)
        {
            for(let j = 0; j < levelData[i].lights.length; j++)
            {
                let light = levelData[i].lights[j];

                if (light.isCircular)
                {
                    tempEntity.addCircularLight({position: levelData[i].position, radius: levelData[i].lights[j].radius,
                        intensity: levelData[i].lights[j].intensity,
                        color: levelData[i].lights[j].color,
                        alpha: levelData[i].lights[j].alpha});
                    
                    
                }
                else if (light.isCone)
                {
                    tempEntity.addConeLight({position: levelData[i].position, angle: levelData[i].lights[j].angle,
                        spread: levelData[i].lights[j].spread,
                        length: levelData[i].lights[j].length,
                        intensity: levelData[i].lights[j].intensity,
                        color: levelData[i].lights[j].color,
                        alpha: levelData[i].lights[j].alpha})
                }

            }
           
            console.log("tempEntity lights length: ", tempEntity.lights.length);

            for (let k = 0; k < tempEntity.lights.length; k++) 
            {
                lights.push(tempEntity.lights[k]);
            }
        }

        if(levelData[i].hasBody)
        {
            if(levelData[i].type === "box")
            {
                tempEntity.createBox({density: levelData[i].density, hasRotations: levelData[i].hasRotations, bounciness: levelData[i].bounciness,
                    dynamicFriction: levelData[i].dynamicFriction, staticFriction: levelData[i].staticFriction,
                    hasGravity: levelData[i].hasGravity,
                    angle: levelData[i].angle
                });
            }
            else if(levelData[i].type === "triangle")
            {
                tempEntity.createTriangle({density: levelData[i].density, hasRotations: levelData[i].hasRotations, bounciness: levelData[i].bounciness,
                    dynamicFriction: levelData[i].dynamicFriction, staticFriction: levelData[i].staticFriction,
                    hasGravity: levelData[i].hasGravity,
                    angle: levelData[i].angle
                });
            }
            else if(levelData[i].type === "circle")
            {

                tempEntity.createCircle({density: levelData[i].density, hasRotations: levelData[i].hasRotations, bounciness: levelData[i].bounciness,
                    dynamicFriction: levelData[i].dynamicFriction, staticFriction: levelData[i].staticFriction,
                    hasGravity: levelData[i].hasGravity,
                    angle: levelData[i].angle
                });
            }


            
            bodies.push(tempEntity.body);
        }
        else
        {
            bodyLessEntities.push(tempEntity);
        }
        
        
    }
    else if(levelData[i].hasBody && !levelData[i].isEntity)
    {
        let tempBody = null;

        if(levelData[i].type === "box")
        {
            tempBody = physics.createBodyBox({position: levelData[i].position, size: levelData[i].size,
                density: levelData[i].density,
                restitution: levelData[i].bounciness,
                linearDamping: levelData[i].linearDamping,
                angularDamping: levelData[i].angularDamping,
                isStatic: levelData[i].isStatic,
                noRotation: !levelData[i].hasRotations,
                affectedByGravity: levelData[i].hasGravity,
                dynamicFriction: levelData[i].dynamicFriction,
                staticFriction: levelData[i].staticFriction
            });
            tempBody.setAngle(levelData[i].angle);
        }
        else if(levelData[i].type === "triangle")
        {
            tempBody = physics.createBodyTriangle({position: levelData[i].position, size: levelData[i].size,
                density: levelData[i].density,
                restitution: levelData[i].bounciness,
                linearDamping: levelData[i].linearDamping,
                angularDamping: levelData[i].angularDamping,
                isStatic: levelData[i].isStatic,
                noRotation: !levelData[i].hasRotations,
                affectedByGravity: levelData[i].hasGravity,
                dynamicFriction: levelData[i].dynamicFriction,
                staticFriction: levelData[i].staticFriction
            });
            tempBody.setAngle(levelData[i].angle);
        }
        else if(levelData[i].type === "circle")
        {
            tempBody = physics.createBodyCircle({position: levelData[i].position, radius: levelData[i].radius,
                density: levelData[i].density,
                restitution: levelData[i].bounciness,
                linearDamping: levelData[i].linearDamping,
                angularDamping: levelData[i].angularDamping,
                isStatic: levelData[i].isStatic,
                noRotation: !levelData[i].hasRotations,
                affectedByGravity: levelData[i].hasGravity,
                dynamicFriction: levelData[i].dynamicFriction,
                staticFriction: levelData[i].staticFriction
            });
            tempBody.setAngle(levelData[i].angle);
        }

        if(tempBody !== null) 
        {
            bodies.push(tempBody);
        }
    }
}

bodies.push(testCircle);
//player
const testEntity = new Entity({position: {x:560, y: 400}, size: {w: 30, h: 30}});
testEntity.createBox({density:1, hasRotations: false, bounciness: 0, dynamicFriction: 0.4, staticFriction:0.6, hasGravity: false});
testEntity.addCircularLight({position: testEntity.position, radius: 1350, intensity: 1, color: {r:255, b: 0, g:70}});
const testPlayer = new Player(testEntity, canvas);



for (let i = 0; i < testPlayer.entity.lights.length; i++) {
    lights.push(testPlayer.entity.lights[i]);
}


console.log("lights length: ", lights.length);

console.log("bodies length: ", bodies.length);

let levelOne = new Levels(
    {
        player: testPlayer,
        bodies: bodies,
        gravity: {x:0, y:550},
        tileSize: {w:100,h:100}
    }
)

console.log("physworld bodies length: ", levelOne.physWorld.bodies.length);


levelOne.physWorld.bodies = bodies;
levelOne.physWorld.bodies.push(testPlayer.entity.body);

//levelOne.physWorld.bodies.push(testCircle);

 for(let currentBody = 0; currentBody < levelOne.physWorld.bodies.length; currentBody++)
 {
    console.log("shape type", levelOne.physWorld.bodies[currentBody].type);
 }


console.log("physworld bodies length: ", levelOne.physWorld.bodies.length);


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

    //testPlayer.entity.body.drawNormals(ctx, 100);
    

   for(let currentBody = 0; currentBody < levelOne.physWorld.bodies.length; currentBody++)
    {
        if(!levelOne.physWorld.bodies[currentBody].isCircle)
        {
            render.drawPolygon({ctx, vertices: levelOne.physWorld.bodies[currentBody].transformedVertices, fillStyle:'crimson', alpha: 1})
        }
        else
        {
            render.drawCircle({ctx, point: levelOne.physWorld.bodies[currentBody].position, color: 'green', radius: levelOne.physWorld.bodies[currentBody].radius,
                rotation: levelOne.physWorld.bodies[currentBody].angle,
                rotationIndicator: false})
        }

        //levelOne.physWorld.bodies[currentBody].drawNormals(ctx, 100);
        
        for(let i = 0; i < bodyLessEntities.length; i++)
        {
            render.drawCircle({ctx, point:  bodyLessEntities[i].position, color: 'green', radius: bodyLessEntities[i].radius,
                rotation: bodyLessEntities[i].angle,
                rotationIndicator: false})
        }
    }

    levelOne.player.entity.drawRigidbodyFull(ctx, 'blue',1);


    render.setDarkOverlayUnified({ctx,x:-500, y:-500 ,width: canvas.width * 4, height: canvas.height * 4, lights: lights, hasColor: true});



}

export default levelOne;
