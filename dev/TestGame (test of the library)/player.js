import * as input from "./lib/simpleInput.js";
import { Camera } from "./lib/simpleRender.js";

export class Player
{
    constructor(entity, canvas)
    {
        this.entity = entity;
        this.input = new input.Input(canvas);
        this.cameraPos = {x: this.entity.position.x + this.entity.size.w /2, y:this.entity.position.y + this.entity.size.h /2};
        this.camera = new Camera({position: this.cameraPos, scale: 0.9, rotation: 0});
    }

    move()
    {
        const MAX_SPEED = 150;

        let speed = 200 * 10;
        let jump = 200 * 100;

        const INPUT = this.input;

        if(INPUT.isKeyDown('KeyA')) this.entity.body.addForce({x:-speed, y:0});
        else if(INPUT.isKeyDown('KeyD')) this.entity.body.addForce({x:speed, y:0});


        if(INPUT.isKeyPressed('Space')) this.entity.body.addForce({x:0, y: -jump});

        let vx = this.entity.body.linearVelocity.x;

        if (vx > MAX_SPEED) vx = MAX_SPEED;
        if (vx < -MAX_SPEED) vx = -MAX_SPEED;

        this.entity.body.linearVelocity.x = vx;

        INPUT.update();
    }

}



/*
this.entity.body.linearVelocity.x = -speed;
else this.entity.body.linearVelocity.x = 0;
//this.entity.body.linearVelocity.y = -jump;
*/