import * as physics from "../../lib/physengine.js";

export class Levels
{
    static currentLevel = 0;

    constructor({player, entities = [], bodies = [],gravity = {x:0, y:150}, tileSize = {w:50, h:50}})
    {
        this.player = player;
        this.entities = [];
        this.bodies = [];
        this.gravity = gravity;

        this.tileSize = tileSize;
        Levels.currentLevel++;

        this.tileMap = [];

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

