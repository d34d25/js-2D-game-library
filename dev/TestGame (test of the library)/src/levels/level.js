import * as physics from "../../lib/physengine.js";

export class Levels
{
    static currentLevel = 0;

    constructor({player = null, entities = [], bodies = [], gravity = {x:0, y:150}})
    {
        this.player = player;
        this.entities = entities;
        this.bodies = bodies;
        this.gravity = gravity;

        Levels.currentLevel++;

        this.physWorld = new physics.PhysWorld([], this.gravity);
        this.addBodiesToPhysWorld();
    }

    addBodiesToPhysWorld() 
    {
        this.physWorld.bodies.length = 0
        
        const uniqueBodies = new Set();

        this.bodies.forEach(body => uniqueBodies.add(body));

        this.entities.forEach(entity => {
            if (entity.body) uniqueBodies.add(entity.body);
        });

        uniqueBodies.forEach(body => this.physWorld.bodies.push(body));
    }


    update(dt)
    {

    }

    render(ctx)
    {

    }


}