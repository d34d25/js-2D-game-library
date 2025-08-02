export class CircularLigth
{
    constructor({position = {x:0, y:0}, radius = 10, intensity = 1, color = { r: 255, g: 200, b: 100, a:0.2 }  })
    {
        this.position = position;
        this.radius = radius;
        this.intensity = intensity;
        this.color = color;
    }
}

export class ConeLight {
    constructor({position = { x: 0, y: 0 },angle = 0,spread = 6,length = 100,intensity = 1,color = { r: 255, g: 200, b: 100, a: 0.2 }}) 
    {
      this.position = position;
      this.angle = angle;
      this.spread = Math.PI/spread;
      this.length = length;
      this.intensity = intensity;
      this.color = color;
    }
}

export function setDarkOverlayUnified({ ctx, width = 800, height = 600, color = 'rgba(0, 0, 0, 1)', lights = [], hasColor = true, x = -200, y = -200 }) 
{
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');

  offCtx.fillStyle = color;
  offCtx.fillRect(0, 0, width, height);
  offCtx.globalCompositeOperation = 'destination-out';

  lights.forEach(light => {
    const { position, intensity, color } = light;
    const { x: lx, y: ly } = position;

    const shiftedX = lx - x;
    const shiftedY = ly - y;

    if ('radius' in light) {
      // === Circular Light ===
      const { radius } = light;

      if (hasColor) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(lx, ly, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const gradient = offCtx.createRadialGradient(shiftedX, shiftedY, 0, shiftedX, shiftedY, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.arc(shiftedX, shiftedY, radius, 0, Math.PI * 2);
      offCtx.fill();

    } else if ('angle' in light && 'spread' in light && 'length' in light) {
      // === Cone Light ===
      const { angle, spread, length } = light;

      const x1 = shiftedX + Math.cos(angle - spread / 2) * length;
      const y1 = shiftedY + Math.sin(angle - spread / 2) * length;
      const x2 = shiftedX + Math.cos(angle + spread / 2) * length;
      const y2 = shiftedY + Math.sin(angle + spread / 2) * length;

      const gradient = offCtx.createLinearGradient(
        shiftedX,
        shiftedY,
        shiftedX + Math.cos(angle) * length,
        shiftedY + Math.sin(angle) * length
      );
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.moveTo(shiftedX, shiftedY);
      offCtx.lineTo(x1, y1);
      offCtx.lineTo(x2, y2);
      offCtx.closePath();
      offCtx.fill();

      if (hasColor) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.cos(angle - spread / 2) * length, ly + Math.sin(angle - spread / 2) * length);
        ctx.lineTo(lx + Math.cos(angle + spread / 2) * length, ly + Math.sin(angle + spread / 2) * length);
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(offscreen, x, y);
}
