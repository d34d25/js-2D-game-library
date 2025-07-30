import * as input from "./lib/simpleInput.js";

export class Player
{
    constructor(entity, canvas)
    {
        this.entity = entity;
        this.input = new input.Input(canvas);
    }

    move()
    {
        const MAX_SPEED = 150;

        let speed = 500;
        let jump = 200;

        const INPUT = this.input;

        if(INPUT.isKeyDown('KeyA')) this.entity.body.addForce({x:-speed, y:0});
        else if(INPUT.isKeyDown('KeyD')) this.entity.body.addForce({x:speed, y:0});


        if(INPUT.isKeyPressed('Space')) this.entity.body.linearVelocity.y = -jump;

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
*/