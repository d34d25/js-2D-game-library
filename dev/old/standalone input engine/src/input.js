export class Input
{
    constructor(canvas)
    {
        this.canvas = canvas;

        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.mousePressed = false;
        this.mouseReleased = false;

        this.buttonsDown = new Set();
        this.buttonsPressed = new Set();
        this.buttonsReleased = new Set();

        // Keyboard state
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.keysReleased = new Set();

        // Bind handlers
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

        // Attach listeners
        this.canvas.addEventListener("mousemove", this._onMouseMove);
        this.canvas.addEventListener("mousedown", this._onMouseDown);
        this.canvas.addEventListener("mouseup", this._onMouseUp);
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);


        this.canvas.addEventListener('contextmenu', (event) =>
        {
            event.preventDefault();
        });

        this._onMouseDownPreventMiddle = (event) =>
        {
            if (event.button === 1)
            {
                event.preventDefault();
            }
        };
        this.canvas.addEventListener('mousedown', this._onMouseDownPreventMiddle);

    }

    _onMouseMove(event)
    {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    _onMouseDown(event)
    {
        if (!this.buttonsDown.has(event.button))
        {
            this.buttonsPressed.add(event.button);
        }
        this.buttonsDown.add(event.button);
    }

    _onMouseUp(event)
    {
        if (this.buttonsDown.has(event.button))
        {
            this.buttonsReleased.add(event.button);
        }
        this.buttonsDown.delete(event.button);
    }

    _onKeyDown(event)
    {
        if (!this.keysDown.has(event.code))
        {
        this.keysPressed.add(event.code);
        }
        this.keysDown.add(event.code);
    }

    _onKeyUp(event)
    {
        if (this.keysDown.has(event.code))
        {
        this.keysReleased.add(event.code);
        }
        this.keysDown.delete(event.code);
    }

    update()
    {
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.buttonsPressed.clear();
        this.buttonsReleased.clear();
    }

    isKeyDown(keyCode)
    {
        return this.keysDown.has(keyCode);
    }

    isKeyPressed(keyCode)
    {
        return this.keysPressed.has(keyCode);
    }

    isKeyReleased(keyCode)
    {
        return this.keysReleased.has(keyCode);
    }

    isMouseDown(button = 0)
    {
        return this.buttonsDown.has(button);
    }

    isMousePressed(button = 0)
    {
        return this.buttonsPressed.has(button);
    }

    isMouseReleased(button = 0)
    {
        return this.buttonsReleased.has(button);
    }

    getMousePosition()
    {
        return { x: this.mouseX, y: this.mouseY };
    }

    dispose()
    {
        this.canvas.removeEventListener("mousemove", this._onMouseMove);
        this.canvas.removeEventListener("mousedown", this._onMouseDown);
        this.canvas.removeEventListener("mouseup", this._onMouseUp);
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }
}
