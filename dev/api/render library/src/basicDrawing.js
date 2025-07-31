export function drawPolygon({ctx, vertices, fillStyle = 'blue', alpha = 1})
{
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'black'
    if (vertices.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) 
    {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.stroke();   
    ctx.globalAlpha = 1;
}

export function drawCircle({ctx, point = {x:0, y:0}, color = 'pink', radius = 15, rotation = 0, rotationIndicator = false, alpha = 1})
{
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'black'
    ctx.save();

    ctx.translate(point.x, point.y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    if(rotationIndicator)
    {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius, 0);;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
}

export function drawPolygonOutline({ ctx, vertices, strokeStyle = 'blue', lineWidth = 2, alpha = 1 }) 
{
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'black'
    if (!vertices || vertices.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) 
    {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

export function drawCircleOutline({ctx,point = { x: 0, y: 0 },color = 'pink',radius = 15,rotation = 0,rotationIndicator = false, alpha = 1}) 
  {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'black'
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (rotationIndicator) 
    {
        const indicatorLength = radius * 0.7;
        const endX = point.x + Math.cos(rotation) * indicatorLength;
        const endY = point.y + Math.sin(rotation) * indicatorLength;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}


export function drawRectangle({ctx, x = 0, y = 0, width = 10, height = 10, color = 'black', rotation = 0 ,alpha = 1}) 
{
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.save();

    ctx.translate(x + width/2, y + height / 2);
    ctx.rotate(rotation)

    ctx.fillRect(-width/2, -height/2, width, height);

    ctx.restore()
    ctx.globalAlpha = 1;
}

export function drawTriangle({ ctx, x = 0, y = 0, width = 100, height = 100, color = 'green', rotation = 0 }) 
{
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.translate(-cx, -cy);

  const x1 = x + width / 2, y1 = y;
  const x2 = x, y2 = y + height;
  const x3 = x + width, y3 = y + height;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}


export function drawGradientCircle({ ctx, x = 0, y = 0, radius = 50, innerColor = 'rgba(255, 255, 255, 1)', outerColor = 'rgba(51, 255, 0, 0)' }) 
{
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(1, outerColor);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}


export function drawGradientTriangle({ ctx, x = 0, y = 0, width = 100, height = 100, topColor = 'rgba(255, 255, 255, 1)', baseColor = 'rgba(229, 255, 0, 0)', rotation = 0 })
{
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.translate(-cx, -cy);

  const x1 = x + width / 2, y1 = y;
  const x2 = x, y2 = y + height;
  const x3 = x + width, y3 = y + height;

  const baseCenterX = (x2 + x3) / 2;
  const baseCenterY = (y2 + y3) / 2;

  const gradient = ctx.createLinearGradient(x1, y1, baseCenterX, baseCenterY);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, baseColor);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

