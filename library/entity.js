import * as physics from "../../lib/physengine.js";
import * as render from "../../lib/simpleRender.js";

export class Entity
{
    constructor({position = {x:0, y:0}, size = {w:10,h:10}, radius = 20, drawBody = true, color = {r:255,g:0,b:0}, imagePath = "", cropImage = false, frameW = 10, frameH = 10})
    {

        this.position = position;
        this.size = size;
        this.radius = radius;

        this.body = null;
        this.drawBody = drawBody;
        this.color = color;

        this.image = null;
        this.sprites = [];
        this.currentSprite = null;

        if(imagePath != null || imagePath !== "")
        {
            this.image = render.loadImageLazy(imagePath);
        }

        if(cropImage && this.image !== null)
        {
            this.image.onLoad(() => {
                this.sprites = render.cropImage(this.image, frameW, frameH);
            })
        }

        this.lights = [];
    }

    createBox({density = 1, bounciness = 0.3, hasGravity = true, linearDamping = {x:0,y:0}, angularDamping = 0, staticFriction = 0.6, dynamicFriction = 0.4, isStatic = false, hasRotations = true, angle = 0})
    {
        this.body = physics.createBodyBox({position: this.position, size: this.size, density, restitution: bounciness, affectedByGravity: hasGravity, linearDamping, angularDamping,staticFriction, dynamicFriction, isStatic, noRotation: !hasRotations});
        this.body.setAngle(angle);
    }

    createCircle({density = 1, bounciness = 0.3, hasGravity = true, linearDamping = {x:0,y:0}, angularDamping = 0, staticFriction = 0.6, dynamicFriction = 0.4, isStatic = false, hasRotations = true, angle = 0})
    {
        this.body = physics.createBodyCircle({position: this.position, radius: this.radius, density, restitution: bounciness, affectedByGravity: hasGravity, linearDamping, angularDamping,staticFriction, dynamicFriction, isStatic, noRotation: !hasRotations});
        this.body.setAngle(angle);
    }

    createTriangle({density = 1, bounciness = 0.3, hasGravity = true, linearDamping = {x:0,y:0}, angularDamping = 0, staticFriction = 0.6, dynamicFriction = 0.4, isStatic = false, hasRotations = true, angle = 0})
    {
        this.body = physics.createBodyTriangle({position: this.position, size: this.size, density, restitution: bounciness, affectedByGravity: hasGravity, linearDamping, angularDamping,staticFriction, dynamicFriction, isStatic, noRotation: !hasRotations});
        this.body.setAngle(angle);
    }

    addCircularLight({position = {x:0, y:0}, radius = 10, intensity = 1, color = { r: 255, g: 255, b: 255}, alpha = 0.2})
    {
        this.lights.push(new render.CircularLigth({position, radius, intensity, color, alpha}));
    }

    addConeLight({position = { x: 0, y: 0 },angle = 0,spread = 6,length = 100,intensity = 1,color = { r: 255, g: 200, b: 100 }, alpha = 0.2}) 
    {
        this.lights.push(new render.ConeLight({position, angle, spread, length, intensity, color, alpha}));
    }

    drawRigidbodyFull(ctx, color, alpha)
    {
        if(this.body === null) return;
        
        if(!this.body.isCircle)
        {
            render.drawPolygon({ctx, vertices: this.body.transformedVertices, fillStyle: color, alpha});
        }
        else
        {
            render.drawCircle({ctx, point: this.body.position, color, radius: this.body.radius, rotation: this.body.angle, rotationIndicator: true, alpha});
        }
        
    }

    drawRigidbodyOutline({ctx, color, thickness = 2,alpha = 1})
    {
        if(this.body === null) return;

        if(!this.body.isCircle)
        {
            render.drawPolygonOutline({ctx, vertices: this.body.transformedVertices, strokeStyle: color, alpha, lineWidth: thickness});
        }
        else
        {
            render.drawCircleOutline({ctx, point: this.body.position, color, radius: this.body.radius, rotation: this.body.angle, rotationIndicator: true, alpha});
        }
    }

    drawImage({ctx, scaleX = 1, scaleY = 1, alpha = 1, flipX = false, flipY = false})
    {
        if(this.image === null) return;
        this.image.draw({ctx,scaleX,scaleY, rotationRadians: this.body.angle, flipHorizontally: flipX, flipVertically: flipY, alpha});
    }

    drawSprite({ctx,startFrame, endFrame, animationSpeed, elapsedTime, scaleX = 1, scaleY = 1, alpha = 1, flipX = false, flipY = false})
    {
        if(this.sprites == []) return;
        this.currentSprite = render.playAnimation({
            spriteArray: this.sprites,
            startFrame,
            endFrame,
            animationSpeed,
            elapsedTime
        });

        if(this.currentSprite !== null)
        {
            this.currentSprite.draw({ctx, dx: this.position.x, dy: this.position.y, scaleX, scaleY, alpha, flipHorizontally: flipX, flipVertically: flipY});
        }
    }
    
}

export function howToCenterTheCamera()
{
    return "(position + size /2) - canvas size / 2 / camera scale";
}

export function centerCameraOnEntity(camera, entity, canvas) 
{
    const centerX = entity.position.x + entity.size.w / 2;
    const centerY = (entity.position.y - 120) + entity.size.h / 2;

    camera.position = {
        x: centerX - canvas.width / 2 / camera.scale,
        y: centerY - canvas.height / 2 / camera.scale
    };
}


