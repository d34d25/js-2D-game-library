export function loadImageLazy(src) 
{
  const img = new Image();
  let loaded = false;
  const listeners = [];

  img.onload = () => {
    loaded = true;
    listeners.forEach(fn => fn());
  };
  img.src = src;

  return {
    img,
    get loaded() {
      return loaded;
    },
    onLoad(callback) {
      if (loaded) {
        callback();
      } else {
        listeners.push(callback);
      }
    },
    draw({ctx, x = 0, y = 0, scaleX = 1, scaleY = 1, rotationRadians = 0, alpha = 1, flipHorizontally = false, flipVertically = false}) {
        if (loaded) 
        {
            ctx.globalAlpha = alpha;
            ctx.imageSmoothingEnabled = false;

            const flipScaleX = flipHorizontally ? -1 : 1;
            const flipScaleY = flipVertically ? -1 : 1;

            const width = img.width * scaleX;
            const height = img.height * scaleY;

            ctx.save();
            ctx.translate(x + width / 2, y + height / 2);

            ctx.rotate(rotationRadians);
            ctx.scale(flipScaleX, flipScaleY);

            ctx.drawImage(img, -width / 2, -height / 2, width, height);

            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

  };
}

export function cropImage(img, frameWidth, frameHeight) 
{
    if (!img.loaded) 
    {
        console.warn("Image not loaded yet!");
        return [];
    }

    const sprites = [];
    const sheetWidth = img.img.width;
    const sheetHeight = img.img.height;

    const cols = Math.ceil(sheetWidth / frameWidth);
    const rows = Math.ceil(sheetHeight / frameHeight);



    for (let y = 0; y < rows; y++) 
    {
        for (let x = 0; x < cols; x++) 
        {
            sprites.push({
                sx: x * frameWidth,
                sy: y * frameHeight,
                sWidth: frameWidth,
                sHeight: frameHeight,

                draw({ctx, dx = 0, dy = 0, scaleX = 1, scaleY = 1, rotationRadians = 0, alpha = 1, flipHorizontally = false, flipVertically = false}) 
                {
                    if (!img.loaded) return;

                    ctx.globalAlpha = alpha;
                    ctx.imageSmoothingEnabled = false;

                    const flipScaleX = flipHorizontally ? -1 : 1;
                    const flipScaleY = flipVertically ? -1 : 1;

                    const width = this.sWidth * scaleX;
                    const height = this.sHeight * scaleY;

                    ctx.save();
                    ctx.translate(dx + width / 2, dy + height / 2);
                    ctx.rotate(rotationRadians);
                    ctx.scale(flipScaleX, flipScaleY);
                    ctx.drawImage(
                        img.img,
                        this.sx,
                        this.sy,
                        this.sWidth,
                        this.sHeight,
                        -width / 2,
                        -height / 2,
                        width,
                        height
                    );
                    ctx.restore();
                    ctx.globalAlpha = 1;
                }
            });
        }
    }

    return sprites;
}

export function playAnimation({
  spriteArray = [],
  startFrame = 0,
  endFrame = 1,
  animationSpeed = 1,
  elapsedTime = 0
}) {
  if (spriteArray.length === 0) return null;

  const totalFrames = endFrame - startFrame + 1;
  const frameDuration = 1 / animationSpeed;

  const frameIndex = startFrame + Math.floor(elapsedTime / frameDuration) % totalFrames;

  return spriteArray[frameIndex];
}
