import * as physics from "../../lib/physengine.js";
import * as render from "../../lib/simpleRender.js";
import * as levels from "../../lib/level.js";
import { testData } from "./levelsData.js";
import { centerCameraOnEntity } from "../../lib/entity.js";

const canvas = document.getElementById('myCanvas');

const loadedData = levels.loadLevelData(testData, canvas);

let testLevel = new levels.Level(
    {
        player: loadedData.player,
        bodies: loadedData.bodies,
        entities: loadedData.entities,
        gravity: {x:0, y:550}
    }
)


/*idea: put these 3 functions below inside the level class, all the stuff that can be
passed via arguments as conditions will be passed and for the rest I could pass
a function as a parameter to "inject" the update and code that can't be
predicted*/

/*
example 
renderScene(ctx, drawHitboxes, overlay, overlayX, overlayY, overlayWidth, overlayHeight, coloredLigths, drawSprite(), otherDraw())
*/

testLevel.update = function(dt)
{
    testLevel.player.move(dt);
    centerCameraOnEntity(testLevel.player.camera, testLevel.player.entity, canvas);
    testLevel.physWorld.step({dt, useRotations: true, iterations:20, directionalFriction: true, angleTolerance: 0.75});
    //otherUpdate() ----> as parameter
}


testLevel.render = function(ctx)
{
    //if (useCamera)
    testLevel.player.camera.drawWithCamera({ctx, canvas, drawScene: () => renderScene({ctx, drawHitboxes: false, darkOverlay: true})});
    //else renderScene();
}

function renderScene({ctx, drawHitboxes = false, darkOverlay = false, 
    overlayXstart = -500, overlayYstart = -500,
    overlayWidth = canvas.width * 4,
    overlayHeight = canvas.height * 4,
    coloredLights = true})
{
    for(let i = 0; i < testLevel.bodies.length; i++)
    {
        const currentBody = testLevel.bodies[i];

        if(!currentBody.isCircle)
        {
            render.drawPolygon({
                ctx,
                vertices: currentBody.transformedVertices,
                fillStyle: loadedData.bodyColors[i],
                alpha: 1
            })
        }
        else
        {
            render.drawCircle({
                ctx,
                point: currentBody.position,
                color: loadedData.bodyColors[i],
                radius: currentBody.radius,
                rotationIndicator: false
            })
        }

    }
    
    for(let i = 0; i < testLevel.entities.length; i++)
    {
        
        const currentEntity = testLevel.entities[i];

        if(!currentEntity.drawBody)
        {
            //drawSprite() ----> as parameter
        }
        else
        {

            if(!currentEntity.body.isCircle)
            {
                render.drawPolygon({
                    ctx,
                    vertices: currentEntity.body.transformedVertices,
                    fillStyle: currentEntity.color,
                    alpha: 1
                })
            }
            else
            {
                render.drawCircle({
                    ctx,
                    point: currentEntity.body.position,
                    color: currentEntity.color,
                    radius: currentBody.radius,
                    rotationIndicator: false
                })
            }
        }
    }
    /*
     else
     {
        otherDraw() ----> also as parameter
     }
     */

    if(darkOverlay)
    {
        render.setDarkOverlayUnified({
            ctx,
            x: overlayXstart,
            y: overlayYstart,
            width: overlayWidth,
            height: overlayHeight,
            lights: loadedData.lights,
            hasColor: coloredLights
        })
    }

    if(drawHitboxes)
    {
        for(let i = 0; i < testLevel.allBodies.length; i++)
        {
            const currentBody = testLevel.bodies[i];

            if(!currentBody.isCircle)
            {
                render.drawPolygonOutline({
                    ctx,
                    vertices: currentBody.transformedVertices,
                    fillStyle: 'crimson',
                    alpha: 1
                })
            }
            else
            {
                render.drawCircleOutline({
                    ctx,
                    point: currentBody.position,
                    color: 'green',
                    radius: currentBody.radius,
                    rotationIndicator: false
                })
            }

        }
    }
}

export default testLevel;