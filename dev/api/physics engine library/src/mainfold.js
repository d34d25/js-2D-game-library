export class Mainfold
{
    constructor(bodyA, bodyB, normal, depth, contact1, contact2, contactCount)
    {   
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.normal = normal;
        this.depth = depth;
        this.contact1 = contact1;
        this.contact2 = contact2;
        this.contactCount = contactCount;
    }
}