import { AABBvsAABB, areContactsAligned, circleVsCircle, circleVsPolygon, findContactPoints, SAT } from "./collisions.js";
import { addVectors, almostEqualVector, crossProduct, dotProduct, multiplyVectors, normalize, scaleVector, subtractVectors } from "./maths.js";
import { Mainfold } from "./mainfold.js";

export class PhysWorld
{
    
    constructor(bodies = [], gravity = {x:0, y:0})
    {
        this.bodies = bodies;

        this.gravity = gravity;

        this.contacts = [];
        
        this.raList = [];
        this.rbList = [];

        this.impulseList = [];
        this.frictionImpulseList = [];
        this.jList = [];
    }

    step({dt, useRotations = false, iterations = 10}) 
    {
        //Rigidbody.updatedBodiesCount = 0;

        for(let i = 0; i < iterations; i++)
        {
            for (let body of this.bodies) 
            {
                body.updateBody(dt, this.gravity, iterations);   
            }

            const n = this.bodies.length;

            for(let i = 0; i < n; i++)
            {
                for(let j = i + 1; j < n; j++)
                {
                    const bodyA = this.bodies[i];
                    const bodyB = this.bodies[j];

                    if(!AABBvsAABB(bodyA, bodyB)) continue;

                    if(bodyA.isStatic && bodyB.isStatic) continue;

                    this.collisionStep(bodyA,bodyB, useRotations);
                }
            }
        }
        
    }

    collisionStep(bodyA, bodyB, useRotations)
    {   
        let result = this.resolveCollisions(bodyA, bodyB);

        if(result.collision)
        {

            this.separateBodies(bodyA,bodyB, result);

            let contacts = findContactPoints(bodyA,bodyB);

            let manifold = new Mainfold(
                bodyA,
                bodyB,
                result.normal,
                result.depth,
                contacts.contact1,
                contacts.contact2,
                contacts.contactCount
            );

            if(useRotations)
            {
                this.resolveCollisionsRotationalAndFriction(manifold);
            }
            else
            {
                this.resolveCollisionsBasicWithFriction(manifold);   
            }
            
        }
    }

    separateBodies(bodyA, bodyB, result)
    {
        if (bodyA.hasInfiniteMass || bodyA.isStatic) 
        {
            bodyB.move({ x: result.normal.x * result.depth, y: result.normal.y * result.depth });
        } 
        else if (bodyB.hasInfiniteMass || bodyB.isStatic) 
        {
            bodyA.move({ x: -result.normal.x * result.depth, y: -result.normal.y * result.depth });
        }
        else
        {
            bodyA.move({ x: -result.normal.x * result.depth / 2, y: -result.normal.y * result.depth / 2 });
            bodyB.move({ x: result.normal.x * result.depth / 2, y: result.normal.y * result.depth / 2 });
        }
    }

    resolveCollisions(bodyA ,bodyB)
    {
        if(bodyA.isStatic && bodyB.isStatic) return;

        let result = null;

        if (!bodyA.isCircle && !bodyB.isCircle)
        {
            result = SAT(bodyA,bodyB);
        }
        else if (bodyA.isCircle && bodyB.isCircle)
        {
            result = circleVsCircle(bodyA, bodyB);
        }
        else if (!bodyA.isCircle && bodyB.isCircle)
        {
            result = circleVsPolygon(bodyB,bodyA);
        }
        else if (!bodyB.isCircle && bodyA.isCircle)
        {
            result = circleVsPolygon(bodyA,bodyB);
        }
        else
        {
            console.error("one of the polygons has an unsupported shape");
        }

        return result;

    }

    resolveCollisionsBasic(manifold)
    {

        const bodyA = manifold.bodyA;
        const bodyB = manifold.bodyB;
        const normal =  manifold.normal;

        let relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

        if(dotProduct(relativeVel,normal) > 0) return;

        let e = 0;

        if(bodyA.mass === Infinity  || bodyA.isStatic)
        {
            e = bodyB.restitution;
        }
        else if (bodyB.mass === Infinity  || bodyB.isStatic)
        {
            e = bodyA.restitution;
        }
        else
        {
            e = Math.min(bodyA.restitution,bodyB.restitution);
        }

        let j = -(1 + e) * dotProduct(relativeVel, normal);

        j /= bodyA.invMass + bodyB.invMass;

        //console.log("Impulse scalar j:", j);


        if(!bodyA.isStatic)
        {
            bodyA.linearVelocity.x -= j * bodyA.invMass * normal.x;
            bodyA.linearVelocity.y -= j * bodyA.invMass * normal.y;
        }

        if(!bodyB.isStatic)
        {
            bodyB.linearVelocity.x += j * bodyB.invMass * normal.x;
            bodyB.linearVelocity.y += j * bodyB.invMass * normal.y;
        }

         
    }

    resolveCollisionsBasicWithFriction(manifold)
    {

        const bodyA = manifold.bodyA;
        const bodyB = manifold.bodyB;
        const normal =  manifold.normal;

        let relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

        let sf = Math.sqrt(bodyA.staticFriction * bodyB.staticFriction);
        let df = Math.sqrt(bodyA.dynamicFriction * bodyB.dynamicFriction);


        if(dotProduct(relativeVel,normal) > 0) return;

        let e = 0;

        if(bodyA.mass === Infinity  || bodyA.isStatic)
        {
            e = bodyB.restitution;
        }
        else if (bodyB.mass === Infinity  || bodyB.isStatic)
        {
            e = bodyA.restitution;
        }
        else
        {
            e = Math.min(bodyA.restitution,bodyB.restitution);
        }

        let j;

        j = -(1 + e) * dotProduct(relativeVel, normal);

        j /= bodyA.invMass + bodyB.invMass;

        if(!bodyA.isStatic)
        {
            bodyA.linearVelocity.x -= j * bodyA.invMass * normal.x;
            bodyA.linearVelocity.y -= j * bodyA.invMass * normal.y;
        }

        if(!bodyB.isStatic)
        {
            bodyB.linearVelocity.x += j * bodyB.invMass * normal.x;
            bodyB.linearVelocity.y += j * bodyB.invMass * normal.y;
        }

        relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

        const velAlongNormal = dotProduct(relativeVel, normal);

        let tangent = subtractVectors(relativeVel, scaleVector(normal, velAlongNormal));

        if (almostEqualVector(tangent, {x: 0, y: 0})) return;
        tangent = normalize(tangent);

        let jt = -dotProduct(relativeVel, tangent);
        jt /= bodyA.invMass + bodyB.invMass;

        let frictionImpulse;
        if (Math.abs(jt) < j * sf) 
        {
            frictionImpulse = scaleVector(tangent, jt);
        } 
        else 
        {
            frictionImpulse = scaleVector(tangent, -j * df);
        }

        if (!bodyA.isStatic) 
        {
            bodyA.linearVelocity = subtractVectors(bodyA.linearVelocity, scaleVector(frictionImpulse, bodyA.invMass));
        }
        if (!bodyB.isStatic) 
        {
            bodyB.linearVelocity = addVectors(bodyB.linearVelocity, scaleVector(frictionImpulse, bodyB.invMass));
        }

    }

    resolveCollisionsRotational(manifold)
    {
        const bodyA = manifold.bodyA;
        const bodyB = manifold.bodyB;
        const normal =  manifold.normal

        const contact1 = manifold.contact1;
        const contact2 = manifold.contact2;
        const contactCount = manifold.contactCount;

        let e = 0;

        if(bodyA.mass === Infinity  || bodyA.isStatic)
        {
            e = bodyB.restitution;
        }
        else if (bodyB.mass === Infinity  || bodyB.isStatic)
        {
            e = bodyA.restitution;
        }
        else
        {
            e = Math.min(bodyA.restitution,bodyB.restitution);
        }

        let contactList = [contact1, contact2];

        for(let i = 0; i < contactCount; i++)
        {
            this.impulseList[i] = {x:0,y:0};
            this.raList[i] = {x: 0, y: 0};
            this.rbList[i] = {x: 0, y: 0};
        }

        for(let i = 0; i < contactCount; i++)
        {
            let ra = {x: 0, y: 0};
            let rb = {x: 0, y: 0};

            ra = subtractVectors(contactList[i], bodyA.position);
            rb = subtractVectors(contactList[i], bodyB.position);

            this.raList[i] = ra;
            this.rbList[i] = rb;

            let raPerp = {x: -ra.y, y: ra.x};
            let rbPerp = {x: -rb.y, y: rb.x};

            let angularLinearVelA = scaleVector(raPerp, bodyA.angularVelocity);
            let angularLinearVelB = scaleVector(rbPerp, bodyB.angularVelocity);

            let relativeVel = subtractVectors(
                addVectors(bodyB.linearVelocity, angularLinearVelB),
                addVectors(bodyA.linearVelocity, angularLinearVelA)
            );

            let contactVelocityMag = dotProduct(relativeVel, normal);

            if (contactVelocityMag > 0) continue;

            let raPerpDotN = dotProduct(raPerp, normal);
            let rbPerpDotN = dotProduct(rbPerp, normal);

            let denominator = bodyA.invMass + bodyB.invMass + 
            (raPerpDotN * raPerpDotN) * bodyA.invInertia + 
            (rbPerpDotN * rbPerpDotN) * bodyB.invInertia;

            //console.log("contacts", contactCount);

            let j;

            if(contactCount === 2 && areContactsAligned(contact1,contact2,normal)) //(contactCount === 2 && areContactsAligned(contact1,contact2,normal))
            {
                //console.log("called");

                relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

                j = -(1 +e ) * dotProduct(relativeVel, normal);
                
                j /= bodyA.invMass + bodyB.invMass;

                j /= contactCount;

                //console.log("j linear: ", j);
            }
            else
            {
                j = -(1 + e) * contactVelocityMag;

                j /= denominator;

                j /= contactCount;

                //console.log("j rotational: ", j);
            }

            let impulse = {x:0, y:0};

            impulse.x = j * normal.x;
            impulse.y = j * normal.y;

            this.impulseList[i] = impulse;
        }


        for(let i = 0; i < contactCount; i++)
        {
            let impulse = this.impulseList[i];

            let ra = this.raList[i];
            let rb = this.rbList[i];

            if(!bodyA.isStatic)
            {
                bodyA.linearVelocity.x += -impulse.x * bodyA.invMass;
                bodyA.linearVelocity.y += -impulse.y * bodyA.invMass;
                
            }

            if(!bodyA.rotates)
            {
                bodyA.angularVelocity += -crossProduct(ra, impulse) * bodyA.invInertia;
            }

            if(!bodyB.isStatic)
            {
                bodyB.linearVelocity.x += impulse.x * bodyB.invMass;
                bodyB.linearVelocity.y += impulse.y * bodyB.invMass;
                
            }
        
            if(!bodyB.rotates)
            {
                bodyB.angularVelocity += crossProduct(rb, impulse) * bodyB.invInertia;
            }
            
        }
    }

    resolveCollisionsRotationalAndFriction(manifold)
    {
        const bodyA = manifold.bodyA;
        const bodyB = manifold.bodyB;
        const normal =  manifold.normal

        const contact1 = manifold.contact1;
        const contact2 = manifold.contact2;
        const contactCount = manifold.contactCount;

        let e = 0;

        if(bodyA.mass === Infinity  || bodyA.isStatic)
        {
            e = bodyB.restitution;
        }
        else if (bodyB.mass === Infinity  || bodyB.isStatic)
        {
            e = bodyA.restitution;
        }
        else
        {
            e = Math.min(bodyA.restitution,bodyB.restitution);
        }

        //let sf = (bodyA.staticFriction + bodyB.staticFriction) * 0.5;
        //let df = (bodyA.dynamicFriction + bodyB.dynamicFriction) * 0.5;

        let sf = Math.sqrt(bodyA.staticFriction * bodyB.staticFriction);
        let df = Math.sqrt(bodyA.dynamicFriction * bodyB.dynamicFriction);


        let contactList = [contact1, contact2];

        for(let i = 0; i < contactCount; i++)
        {
            this.impulseList[i] = {x:0,y:0};
            this.frictionImpulseList[i] = {x:0,y:0};
            this.jList[i] = 0;
            this.raList[i] = {x: 0, y: 0};
            this.rbList[i] = {x: 0, y: 0};
        }

        for(let i = 0; i < contactCount; i++)
        {
            let ra = {x: 0, y: 0};
            let rb = {x: 0, y: 0};

            ra = subtractVectors(contactList[i], bodyA.position);
            rb = subtractVectors(contactList[i], bodyB.position);

            this.raList[i] = ra;
            this.rbList[i] = rb;

            let raPerp = {x: -ra.y, y: ra.x};
            let rbPerp = {x: -rb.y, y: rb.x};

            let angularLinearVelA = scaleVector(raPerp, bodyA.angularVelocity);
            let angularLinearVelB = scaleVector(rbPerp, bodyB.angularVelocity);

            let relativeVel = subtractVectors(
                addVectors(bodyB.linearVelocity, angularLinearVelB),
                addVectors(bodyA.linearVelocity, angularLinearVelA)
            );

            let contactVelocityMag = dotProduct(relativeVel, normal);

            if (contactVelocityMag > 0) continue;

            let raPerpDotN = dotProduct(raPerp, normal);
            let rbPerpDotN = dotProduct(rbPerp, normal);

            let denominator = bodyA.invMass + bodyB.invMass + 
            (raPerpDotN * raPerpDotN) * bodyA.invInertia + 
            (rbPerpDotN * rbPerpDotN) * bodyB.invInertia;


            let j;

            if(contactCount === 2 && areContactsAligned(contact1,contact2,normal))
            {

                relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

                j = -(1 +e ) * dotProduct(relativeVel, normal);
                
                j /= bodyA.invMass + bodyB.invMass;

                j /= contactCount;

            }
            else
            {
                j = -(1 + e) * contactVelocityMag;

                j /= denominator;

                j /= contactCount;

            }

            this.jList[i] = j;

            let impulse = {x:0, y:0};

            impulse.x = j * normal.x;
            impulse.y = j * normal.y;

            this.impulseList[i] = impulse;
        }


        for(let i = 0; i < contactCount; i++)
        {
            let impulse = this.impulseList[i];

            let ra = this.raList[i];
            let rb = this.rbList[i];

            if(!bodyA.isStatic)
            {
                bodyA.linearVelocity.x += -impulse.x * bodyA.invMass;
                bodyA.linearVelocity.y += -impulse.y * bodyA.invMass;
                
            }

            if(!bodyA.rotates)
            {
                bodyA.angularVelocity += -crossProduct(ra, impulse) * bodyA.invInertia;
            }

            if(!bodyB.isStatic)
            {
                bodyB.linearVelocity.x += impulse.x * bodyB.invMass;
                bodyB.linearVelocity.y += impulse.y * bodyB.invMass;
                
            }
        
            if(!bodyB.rotates)
            {
                bodyB.angularVelocity += crossProduct(rb, impulse) * bodyB.invInertia;
            }
            
        }

        //friction
        for(let i = 0; i < contactCount; i++)
        {
            let ra = {x: 0, y: 0};
            let rb = {x: 0, y: 0};

            ra = subtractVectors(contactList[i], bodyA.position);
            rb = subtractVectors(contactList[i], bodyB.position);

            this.raList[i] = ra;
            this.rbList[i] = rb;

            let raPerp = {x: -ra.y, y: ra.x};
            let rbPerp = {x: -rb.y, y: rb.x};

            let angularLinearVelA = scaleVector(raPerp, bodyA.angularVelocity);
            let angularLinearVelB = scaleVector(rbPerp, bodyB.angularVelocity);

            let relativeVel = subtractVectors(
                addVectors(bodyB.linearVelocity, angularLinearVelB),
                addVectors(bodyA.linearVelocity, angularLinearVelA)
            );

            let dot = dotProduct(relativeVel, normal);
            let tangent = subtractVectors(relativeVel, scaleVector(normal, dot));


            if(almostEqualVector(tangent, {x:0,y:0}))
            {
                continue;
            }
            else
            {
                tangent = normalize(tangent);
            }
            
            let raPerpDotT = dotProduct(raPerp, tangent);
            let rbPerpDotT = dotProduct(rbPerp, tangent);

            let denominator = bodyA.invMass + bodyB.invMass + 
            (raPerpDotT * raPerpDotT) * bodyA.invInertia + 
            (rbPerpDotT * rbPerpDotT) * bodyB.invInertia;


            let j = this.jList[i];

            let jt = 0;

            jt = -dotProduct(relativeVel, tangent);

            jt /= denominator;

            jt /= contactCount;

            let frictionImpulse = {x:0, y:0};
           
            if(Math.abs(jt) <= j * sf)
            {
                frictionImpulse.x = jt * tangent.x;
                frictionImpulse.y = jt * tangent.y;
            }
            else
            {
                frictionImpulse.x = -j * tangent.x * df;
                frictionImpulse.y = -j * tangent.y * df;
            }


            this.frictionImpulseList[i] = frictionImpulse;
        }


        for(let i = 0; i < contactCount; i++)
        {
            let frictionImpulse = this.frictionImpulseList[i];

            let ra = this.raList[i];
            let rb = this.rbList[i];


            if(!bodyA.isStatic)
            {
                bodyA.linearVelocity.x += -frictionImpulse.x * bodyA.invMass;
                bodyA.linearVelocity.y += -frictionImpulse.y * bodyA.invMass;
            }
            
            if(!bodyA.rotates)
            {
                bodyA.angularVelocity += -crossProduct(ra, frictionImpulse) * bodyA.invInertia;
            }
            

            if(!bodyB.isStatic)
            {
                bodyB.linearVelocity.x += frictionImpulse.x * bodyB.invMass;
                bodyB.linearVelocity.y += frictionImpulse.y * bodyB.invMass;
            }
            
            if(!bodyB.rotates)
            {
                bodyB.angularVelocity += crossProduct(rb, frictionImpulse) * bodyB.invInertia;
            }
            
        }

    }

    
}

function drawCircle(ctx, point, color = 'red', radius = 15, rotation) 
    {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke(); 

        const endX = point.x + Math.cos(rotation) * radius;
        const endY = point.y + Math.sin(rotation) * radius;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }



function logContactPoints(ctx, contacts) 
{
    const drawNormal = (point, normal, color = 'blue', scale = 30) => {
    const end = {
            x: point.x + normal.x * scale,
            y: point.y + normal.y * scale
        };

        // Draw the normal as a line
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Optionally draw arrowhead
        const arrowSize = 5;
        const angle = Math.atan2(end.y - point.y, end.x - point.x);

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
            end.x - arrowSize * Math.cos(angle - Math.PI / 6),
            end.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            end.x - arrowSize * Math.cos(angle + Math.PI / 6),
            end.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.lineTo(end.x, end.y);
        ctx.fillStyle = color;
        ctx.fill();
    };

    if (ctx && contacts.contactCount >= 1) {
        drawCircle(ctx, contacts.contact1, 'yellow', 10, 0);
        drawNormal(contacts.contact1, contacts.normal, 'black');
    }

    if (ctx && contacts.contactCount === 2) {
        drawCircle(ctx, contacts.contact2, 'yellow', 10, 0);
        drawNormal(contacts.contact2, contacts.normal, 'black');
    }
}
