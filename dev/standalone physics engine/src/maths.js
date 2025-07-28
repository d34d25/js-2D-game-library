const EPSILON = 0.0005 ;

export function dotProduct(a, b)
{
    return a.x * b.x + a.y * b.y;
}

export function crossProduct(a, b) 
{
    return a.x * b.y - a.y * b.x;
}

export function addVectors(v1, v2) 
{
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function subtractVectors(v1, v2) 
{
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function multiplyVectors(a, b) 
{
    return {
        x: a.x * b.x,
        y: a.y * b.y
    };
}

export function scaleVector(v, scalar) 
{
    return { x: v.x * scalar, y: v.y * scalar };
}

export function magnitude(v) 
{
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v) 
{
    const length = magnitude(v);
    if (length === 0) 
    {
        return { x: 0, y: 0 };
    }
    return { x: v.x / length, y: v.y / length };
}

export function clamp(value, min, max) 
{
  return Math.min(Math.max(value, min), max);
}

export function almostEqual(a,b)
{
    return Math.abs(a-b) < EPSILON;
}

export function almostEqualVector(va, vb)
{
    return distanceSquared(va,vb) < EPSILON * EPSILON;
}

export function distanceSquared(a, b)
{
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return dx * dx + dy * dy;
}

export function lengthSquared(v)
{
    return v.x * v.x + v.y * v.y;
}

export function distance(v1, v2) 
{
    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
