import * as physics from "../../lib/physengine.js";
import * as render from "../../lib/simpleRender.js";
import { Levels } from "./level.js";
import { Entity, centerCameraOnEntity } from "../gameobjects/entity.js";
import { Player } from "../playable/player.js";
import { testData } from "./levelsData.js";

const canvas = document.getElementById('myCanvas');

//platforms




function loadLevelData(levelData, canvas)
{
    let bodies = [];
    let bodyLessEntities = [];
    let lights = [];
    let player = null;

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

                    console.log("Checking light:", light);

                    if (light.isCircular && !light.isCone)
                    {
                        tempEntity.addCircularLight({position: levelData[i].position, radius: levelData[i].lights[j].radius,
                            intensity: levelData[i].lights[j].intensity,
                            color: levelData[i].lights[j].color,
                            alpha: levelData[i].lights[j].alpha});
                        
                        
                    }
                    else if (light.isCone && !light.isCircular)
                    {
                        console.log("Creating cone light with:", light);

                        tempEntity.addConeLight({position: levelData[i].position, 
                            angle: levelData[i].lights[j].angle,
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


                if(levelData[i].isPlayer)
                {
                    player = new Player(tempEntity, canvas);
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


    return {bodies, bodyLessEntities, lights, player}

}






const loadedData = loadLevelData(testData, canvas);

let levelOne = new Levels(
    {
        player: loadedData.player,
        bodies: [],
        gravity: {x:0, y:550},
        tileSize: {w:100,h:100}
    }
)


levelOne.physWorld.bodies = loadedData.bodies;

//levelOne.physWorld.bodies = [testPlayer.entity.body, testCircleC, testTriangleC, testBoxA, testCircleB, testTriangleB, testBoxC, testTriangleA, testCircleA, testBoxB];




levelOne.update = function(dt)
{
    levelOne.player.move();
    centerCameraOnEntity(levelOne.player.camera, levelOne.player.entity, canvas);
   
    levelOne.physWorld.step({dt, useRotations: true, iterations:20, directionalFriction: true, angleTolerance: 0.75});
}

levelOne.render = function(ctx)
{
    levelOne.player.camera.drawWithCamera({ctx, canvas, drawScene: () => renderScene(ctx)});
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
        
        for(let i = 0; i < loadedData.bodyLessEntities.length; i++)
        {   
            if(loadedData.bodyLessEntities[i].type = "circle")
            {
                render.drawCircle({ctx, point:  loadedData.bodyLessEntities[i].position, color: 'green', radius: loadedData.bodyLessEntities[i].radius,
                rotation: loadedData.bodyLessEntities[i].angle,
                rotationIndicator: false})
            }
            
            
        }
    }

    levelOne.player.entity.drawRigidbodyFull(ctx, 'blue',1);

    
    render.setDarkOverlayUnified({ctx,x:-500, y:-500 ,width: canvas.width * 4, height: canvas.height * 4, lights: loadedData.lights, hasColor: true});



}

export default levelOne;
