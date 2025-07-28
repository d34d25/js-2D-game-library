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

export function setDarkOverlayUnified({ ctx, x = 0, y = 0, width = 800, height = 600, color = 'rgba(0, 0, 0, 1)', lights = [], hasColor = true }) 
{
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');

  offCtx.fillStyle = color;
  offCtx.fillRect(x, y, width, height);
  offCtx.globalCompositeOperation = 'destination-out';

  lights.forEach(light => {
    const { position, intensity, color } = light;
    const { x: lx, y: ly } = position;

    if ('radius' in light) {
      // === Circular Light ===
      const { radius } = light;

      if (hasColor) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(lx, ly, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const gradient = offCtx.createRadialGradient(lx, ly, 0, lx, ly, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.arc(lx, ly, radius, 0, Math.PI * 2);
      offCtx.fill();

    } else if ('angle' in light && 'spread' in light && 'length' in light) {
      // === Cone Light ===
      const { angle, spread, length } = light;

      const gradient = offCtx.createLinearGradient(
        lx,
        ly,
        lx + Math.cos(angle) * length,
        ly + Math.sin(angle) * length
      );
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.moveTo(lx, ly);
      offCtx.lineTo(
        lx + Math.cos(angle - spread / 2) * length,
        ly + Math.sin(angle - spread / 2) * length
      );
      offCtx.lineTo(
        lx + Math.cos(angle + spread / 2) * length,
        ly + Math.sin(angle + spread / 2) * length
      );
      offCtx.closePath();
      offCtx.fill();

      if (hasColor) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(
          lx + Math.cos(angle - spread / 2) * length,
          ly + Math.sin(angle - spread / 2) * length
        );
        ctx.lineTo(
          lx + Math.cos(angle + spread / 2) * length,
          ly + Math.sin(angle + spread / 2) * length
        );
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(offscreen, x, y);
}
