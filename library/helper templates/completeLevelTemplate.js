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


testLevel.update = function(dt)
{
    testLevel.player.move(dt);
    centerCameraOnEntity(testLevel.player.camera, testLevel.player.entity, canvas);
    testLevel.physWorld.step({dt, useRotations: true, iterations:20, directionalFriction: true, angleTolerance: 0.75});
}

testLevel.render = function(ctx)
{
    testLevel.player.camera.drawWithCamera({ctx, canvas, drawScene: () => renderScene({ctx, drawHitboxes: false, darkOverlay: true})});
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

    console.log("entities: ", testLevel.entities.length);
    for(let i = 0; i < testLevel.entities.length; i++)
    {
        
        const currentEntity = testLevel.entities[i];

        console.log("Entity color: ", currentEntity.color);

        if(!currentEntity.drawBody)
        {

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