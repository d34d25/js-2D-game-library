import { AABB } from "./aabb.js";
import { subtractVectors, normalize } from "./maths.js";
export class Rigidbody
{
    static updatedBodiesCount = 0;

    constructor(position, density, restitution, isStatic, rotates) 
    {
        this.position = position;
        this.angle = 0;
        this.linearVelocity = {x:0,y:0};
        this.angularVelocity = 0;

        this.linearDamping =  {x:0,y:0};
        this.angularDamping = 0;

        this.staticFriction = 0.6;
        this.dynamicFriction = 0.4;

        this.mass = 1;
        this.force =  {x:0,y:0};
        this.torque = 0;

        this.restitution = restitution;
        this.inertia = Infinity;

        this.density = density;
        
        this.size = {w:1, h:1};
        this.radius = 1;

        this.vertices = [];

        this.isStatic = isStatic;
        this.rotates = rotates;
        this.affectedByGravity = true;

        this.type = "";
        this.types = ["box", "triangle", "circle"];

        this.aabb = new AABB();

        this.FORCE_MULTIPLIER = 7250;
        this.TORQUE_MULTIPLIER = 20000;
    }

    get isBox()
    {
        return this.type === this.types[0];
    }

    get isTriangle()
    {
        return this.type === this.types[1];
    }

    get isCircle()
    {
        return this.type === this.types[2];
    }

    get invMass()
    {
        if (this.mass === Infinity || this.mass === 0) return 0;
        return 1 / this.mass;
    }

    get invInertia()
    {
        return (this.inertia === Infinity || this.inertia=== 0) ? 0 : (1 / this.inertia);
    }

    get hasInfiniteMass()
    {
        return this.mass === Infinity;
    }


    get transformedVertices()
    {
        let cos = Math.cos(this.angle);
        let sin = Math.sin(this.angle);

        let pos = this.position;

        return this.vertices.map(({x,y}) => {
            return{
                x: pos.x + x * cos - y * sin,
                y: pos.y + x * sin + y * cos
            };
        });
    }

    get normals() 
    {
        const normalList = [];

        let vertices = this.transformedVertices;

        for (let i = 0; i < vertices.length; i++) {
            let va = vertices[i];
            let vb = vertices[(i + 1) % vertices.length];

            let edge = subtractVectors(vb, va);
            let axis = normalize({ x: -edge.y, y: edge.x });

            normalList.push(axis);
        }

        //0 down, 1 left, 2 up, 3 right
        return normalList;
    }

    get normalDirection() {
        return {
            down: 0,
            left: 1,
            up: 2,
            right: 3,
        };
    }

    
    drawNormals(ctx, scale = 20) 
    {
        const vertices = this.transformedVertices;
        const normals = this.normals;

        const colors = ['red', 'green', 'blue', 'orange'];

        // Access your normalDirection mapping
        const normalDirection = this.normalDirection; // assuming it's a getter on your class

        for (let i = 0; i < vertices.length; i++) 
        {
            const va = vertices[i];
            const vb = vertices[(i + 1) % vertices.length];

            // Midpoint of edge
            const midpoint = {
                x: (va.x + vb.x) / 2,
                y: (va.y + vb.y) / 2
            };

            const normal = normals[i];

            // Use a bigger scale only for the "up" normal
            let scaleFactor = scale;
            if (i === normalDirection.up) {
                scaleFactor *= 1.5;  // increase size by 50%
            }

            const end = {
                x: midpoint.x + normal.x * scaleFactor,
                y: midpoint.y + normal.y * scaleFactor
            };

            const color = colors[i % colors.length];

            // Draw line
            ctx.beginPath();
            ctx.moveTo(midpoint.x, midpoint.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = (i === normalDirection.up) ? 4 : 2; // thicker line for up normal
            ctx.stroke();

            // Draw arrowhead
            drawArrowhead(ctx, midpoint, end, 10, color);
        }
    }



    move(amount)
    {
        this.position.x += amount.x;
        this.position.y += amount.y;
        
        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;
    }

    setPosition(amount)
    {
        this.position.x = amount.x;
        this.position.y = amount.y;

        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;

        calculateAABB(this);
    }

    rotate(amount)
    {
        this.angle += amount;

        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;
    }

    setAngle(amount)
    {
        this.angle = amount;

        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;

        calculateAABB(this);
    }

    addForce(amount)
    {
        this.force = {x: amount.x * this.FORCE_MULTIPLIER, y: amount.y * this.FORCE_MULTIPLIER};
        
        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;
    }

    addTorque(amount)
    {
        this.torque = amount * this.TORQUE_MULTIPLIER;

        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;
    }

    setLinearVelocity(amount)
    {
        this.linearVelocity = amount;

        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;
    }

    setAngularVelocity(amount)
    {
        this.angularVelocity = amount;
        this.needsUpdate = true;
        this.aabbNeedsUpdate = true;
    }


    createBox() 
    {
        let halfW = this.size.w / 2;
        let halfH = this.size.h / 2;

        this.vertices = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: halfW, y: halfH },
            { x: -halfW, y: halfH },
        ];

        this.type = this.types[0];
    }

   
    createTriangle() 
    {
        let halfW = this.size.w / 2;
        let h = this.size.h;

        this.vertices = [
            { x: -halfW, y: 0 },
            { x: halfW, y: 0 },
            { x: 0, y: -h }
        ];

        this.type = this.types[1];
    }

    createCircle()
    {
        this.type = this.types[2];
    }

    
    updateBody(time, gravity = {x:0, y: 9.8}, iterations)
    {
        if(this.isStatic) return;

        time /= iterations;

        //Rigidbody.updatedBodiesCount++;

        let acceleration = {x: 0, y:0};

        let angularAcceleration = 0;

        //position
        acceleration.x += this.force.x / this.mass;
        acceleration.y += this.force.y / this.mass;

        if(this.affectedByGravity)
        {
            acceleration.x += gravity.x;
            acceleration.y += gravity.y;
        }
       
        this.linearVelocity.x += acceleration.x * time;
        this.linearVelocity.y += acceleration.y * time;     

        this.linearVelocity.x *= Math.pow(1 - this.linearDamping.x, time);
        this.linearVelocity.y *= Math.pow(1 - this.linearDamping.y, time);

        this.position.x += this.linearVelocity.x * time;
        this.position.y += this.linearVelocity.y * time;

        //angle
        angularAcceleration += this.torque / this.inertia;

        this.angularVelocity += angularAcceleration * time;
        this.angle += this.angularVelocity * time;
        
        this.angularVelocity *= Math.pow(1 -this.angularDamping, time);

        calculateAABB(this);

        //force reset
        this.force.x = 0;
        this.force.y = 0;
    }
    

}


function calculateAABB(body)
{
    const aabb = body.aabb;
    
    if(body.isCircle)
    {
        aabb.minX = body.position.x - body.radius;
        aabb.maxX = body.position.x + body.radius;

        aabb.minY =  body.position.y - body.radius;
        aabb.maxY =  body.position.y + body.radius;
    }
    else
    {
        
        const vertices = body.transformedVertices;

        aabb.minX = Infinity;
        aabb.maxX = -Infinity;
        aabb.minY = Infinity;
        aabb.maxY = -Infinity;

        for (let i = 0; i < vertices.length; i++) 
        {
            const v = vertices[i];

            if (v.x < aabb.minX) aabb.minX = v.x;
            if (v.x > aabb.maxX) aabb.maxX = v.x;

            if (v.y < aabb.minY) aabb.minY = v.y;
            if (v.y > aabb.maxY) aabb.maxY = v.y;
        }

    }
}



export function createBodyBox({position = {x:0, y:0},size = {w:10, h:10},density = 1,restitution = 0.5,linearDamping = {x:0, y:0},
    angularDamping = 0,isStatic = false,noRotation = false, affectedByGravity = true, dynamicFriction = 0.4, staticFriction = 0.6} = {})
{
    const body = new Rigidbody(position,density ,restitution, isStatic, noRotation);
    body.size = size;
    const area = body.size.w * body.size.h;

    body.createBox();

    body.mass = Infinity;
    body.inertia = Infinity;

    body.linearDamping = linearDamping;
    body.angularDamping = angularDamping;

    body.staticFriction = staticFriction;
    body.dynamicFriction = dynamicFriction;

    body.affectedByGravity = affectedByGravity;

    calculateAABB(body);

    if(!body.isStatic)
    {
        body.mass = area * body.density;
        body.inertia = (1 / 12) * body.mass * (body.size.w * body.size.w + body.size.h * body.size.h);
    }

    body.needsUpdate = true;

    return body;
}

export function createBodyTriangle({position = {x:0, y:0},size = {w:10, h:10},density = 1,restitution = 0.5,linearDamping = {x:0, y:0},
    angularDamping = 0,isStatic = false,noRotation = false, affectedByGravity = true, dynamicFriction = 0.4, staticFriction = 0.6} = {})
{
    const body = new Rigidbody(position, density, restitution, isStatic, noRotation);
    body.size = size;
    body.createTriangle();

    body.mass = Infinity;
    body.inertia = Infinity;

    const base = body.size.w;
    const height = body.size.h;

    body.linearDamping = linearDamping;
    body.angularDamping = angularDamping;

    body.staticFriction = staticFriction;
    body.dynamicFriction = dynamicFriction;

    body.affectedByGravity = affectedByGravity;

    calculateAABB(body);

    if(!body.isStatic)
    {
        const area = 0.5 * body.size.w * body.size.h;
        body.mass = area * density;
        body.inertia = (body.mass * (base * base + height * height)) / 36;
    }

    body.needsUpdate = true;

    return body;
}   

export function createBodyCircle({position = {x:0, y:0},radius = 10,density = 1,restitution = 0.5,linearDamping = {x:0, y:0},
    angularDamping = 0,isStatic = false,noRotation = false, affectedByGravity = true, dynamicFriction = 0.4, staticFriction = 0.6} = {})
{
    const body = new Rigidbody(position, density, restitution, isStatic, noRotation);
    body.radius = radius;

    body.createCircle();

    body.mass = Infinity;
    body.inertia = Infinity;

    body.linearDamping = linearDamping;
    body.angularDamping = angularDamping;

    if(dynamicFriction > staticFriction)
    {
        console.warn("Static friction should be higher than dynamic friction");
    }

    body.staticFriction = staticFriction;
    body.dynamicFriction = dynamicFriction;
    

    body.affectedByGravity = affectedByGravity;

    calculateAABB(body);

    if(!body.isStatic)
    {
        const area = Math.PI * body.radius * body.radius;
        body.mass = area * body.density;
        body.inertia = 0.5 * body.mass * body.radius * body.radius;
    }

    body.needsUpdate = true;

    return body;
}




function drawArrowhead(ctx, from, to, size = 20, color = 'black') 
{
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
        to.x - size * Math.cos(angle - Math.PI / 6),
        to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        to.x - size * Math.cos(angle + Math.PI / 6),
        to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}