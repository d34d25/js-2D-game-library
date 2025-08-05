export function drawAABBOutline(ctx, aabb, color = 'red', lineWidth = 1) 
{
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    const width = aabb.maxX - aabb.minX;
    const height = aabb.maxY - aabb.minY;
    ctx.strokeRect(aabb.minX, aabb.minY, width, height);
}

export const drawFPS = (function () 
{
  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 0;
  const fpsDiv = Object.assign(document.createElement('div'), {
    style: 'position:fixed;top:10px;left:10px;background:#000;color:#0f0;padding:4px;font:12px monospace;z-index:9999',
  });
  document.body.appendChild(fpsDiv);

  return function () {
    const now = performance.now();
    frameCount++;
    if (now - lastTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = now;
    }
    fpsDiv.textContent = 'FPS: ' + fps;
  };
})();
