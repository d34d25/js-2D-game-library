import * as physics from "./physengine.js";
import {Entity} from "./entity.js";
import { Player } from "./player.js";


export class Level
{

    constructor({player,entities = [] ,bodies = [], gravity = {x:0, y:150}})
    {
        this.player = player;
        this.entities = entities;
        this.bodies = bodies;
        this.gravity = gravity;

        const entityBodies = entities
        .filter(entity => entity.body)    // Only entities that have a body
        .map(entity => entity.body);      // Get the body from each entity

        this.allBodies = [...entityBodies, ...bodies];
        
        this.physWorld = new physics.PhysWorld(this.allBodies, this.gravity);
    }


    update(dt, canvas)
    {
        console.alert("Method update(ctx, canvas) must be overriden");
    }
    

    render(ctx, canvas)
    {
       console.alert("Method render(ctx, canvas) must be overriden");
    }

    
}


export function loadLevelData(levelData, canvas)
{
    let bodies = [];
    let bodyColors = [];
    
    let entities = [];
    let lights = [];

    let player = null;

    for(let i = 0; i < levelData.length; i++)
    {
        if(levelData[i].isEntity)
        {
            let color = rgbToCss(levelData[i].color);

            let tempEntity = new Entity({position: levelData[i].position, 
                size: levelData[i].size, 
                radius:levelData[i].radius, 
                drawBody: levelData[i].drawBody, 
                color: color});

            if(levelData[i].lights && levelData[i].lights.length > 0)
            {
                for(let j = 0; j < levelData[i].lights.length; j++)
                {
                    let light = levelData[i].lights[j];


                    if (light.isCircular && !light.isCone)
                    {
                        tempEntity.addCircularLight({position: levelData[i].position, radius: levelData[i].lights[j].radius,
                            intensity: levelData[i].lights[j].intensity,
                            color: levelData[i].lights[j].color,
                            alpha: levelData[i].lights[j].alpha});
                        
                        
                    }
                    else if (light.isCone && !light.isCircular)
                    {

                        tempEntity.addConeLight({position: levelData[i].position, 
                            angle: levelData[i].lights[j].angle,
                            spread: levelData[i].lights[j].spread,
                            length: levelData[i].lights[j].length,
                            intensity: levelData[i].lights[j].intensity,
                            color: levelData[i].lights[j].color,
                            alpha: levelData[i].lights[j].alpha})
                    }

                }
            

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
                
            }
            
            entities.push(tempEntity);
            
        }
        else if(levelData[i].hasBody && !levelData[i].isEntity)
        {
            let tempBody = null;
            let color = rgbToCss(levelData[i].color);
            bodyColors.push(color);

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


    return {bodies, bodyColors, entities, lights, player}

}


function rgbToCss({ r, g, b }) 
{
    return `rgb(${r}, ${g}, ${b})`;
}
