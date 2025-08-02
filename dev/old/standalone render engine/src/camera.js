export class Camera
{
    constructor({position = {x: 0, y: 0}, scale = 1, rotation = 0})
    {
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
    }

    drawWithCamera({ ctx, canvas, drawScene})
    {
        ctx.save();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.translate(canvas.width / 2, canvas.height / 2);

        ctx.rotate(this.rotation);

        ctx.scale(this.scale, this.scale);

        ctx.translate(-this.position.x - canvas.width / 2 / this.scale, -this.position.y - canvas.height / 2 / this.scale);

        drawScene();

        ctx.restore();
    }
}