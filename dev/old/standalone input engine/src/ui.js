export class UI_Element
{
    constructor({image = null, position = {x: 0, y:0}, size = {w: 10, h: 10}})
    {
        this.image = image;
        this.position = position;
        this.size = size;
    }

    isMouseOver(mousePos)
    {
        return mousePos.x >= this.position.x &&
               mousePos.x <= this.position.x + this.size.w &&
               mousePos.y >= this.position.y &&
               mousePos.y <= this.position.y + this.size.h;
    }

    isClicked(mousePos, clicked)
    {
        const clickedState = (typeof clicked === 'function') ? clicked() : clicked;
        return this.isMouseOver(mousePos) && clickedState;
    }
}