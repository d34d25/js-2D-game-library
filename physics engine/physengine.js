// src/aabb.js
var AABB = class {
  constructor(minX = 0, minY = 0, maxX = 10, maxY = 10) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }
};

// src/maths.js
var EPSILON = 5e-4;
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
}
function crossProduct(a, b) {
  return a.x * b.y - a.y * b.x;
}
function addVectors(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}
function subtractVectors(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}
function multiplyVectors(a, b) {
  return {
    x: a.x * b.x,
    y: a.y * b.y
  };
}
function scaleVector(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar };
}
function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
function normalize(v) {
  const length = magnitude(v);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / length, y: v.y / length };
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function almostEqual(a, b) {
  return Math.abs(a - b) < EPSILON;
}
function almostEqualVector(va, vb) {
  return distanceSquared(va, vb) < EPSILON * EPSILON;
}
function distanceSquared(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return dx * dx + dy * dy;
}
function lengthSquared(v) {
  return v.x * v.x + v.y * v.y;
}
function distance(v1, v2) {
  let dx = v1.x - v2.x;
  let dy = v1.y - v2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// src/rigidbody.js
var Rigidbody = class {
  static updatedBodiesCount = 0;
  constructor(position, density, restitution, isStatic, rotates) {
    this.position = position;
    this.angle = 0;
    this.linearVelocity = { x: 0, y: 0 };
    this.angularVelocity = 0;
    this.linearDamping = { x: 0, y: 0 };
    this.angularDamping = 0;
    this.staticFriction = 0.6;
    this.dynamicFriction = 0.4;
    this.mass = 1;
    this.force = { x: 0, y: 0 };
    this.torque = 0;
    this.restitution = restitution;
    this.inertia = Infinity;
    this.density = density;
    this.size = { w: 1, h: 1 };
    this.radius = 1;
    this.vertices = [];
    this.isStatic = isStatic;
    this.rotates = rotates;
    this.affectedByGravity = true;
    this.type = "";
    this.types = ["box", "triangle", "circle"];
    this.aabb = new AABB();
    this.FORCE_MULTIPLIER = 7250;
    this.TORQUE_MULTIPLIER = 2e4;
  }
  get isBox() {
    return this.type === this.types[0];
  }
  get isTriangle() {
    return this.type === this.types[1];
  }
  get isCircle() {
    return this.type === this.types[2];
  }
  get invMass() {
    if (this.mass === Infinity || this.mass === 0) return 0;
    return 1 / this.mass;
  }
  get invInertia() {
    return this.inertia === Infinity || this.inertia === 0 ? 0 : 1 / this.inertia;
  }
  get transformedVertices() {
    let cos = Math.cos(this.angle);
    let sin = Math.sin(this.angle);
    let pos = this.position;
    return this.vertices.map(({ x, y }) => {
      return {
        x: pos.x + x * cos - y * sin,
        y: pos.y + x * sin + y * cos
      };
    });
  }
  get hasInfiniteMass() {
    return this.mass === Infinity;
  }
  move(amount) {
    this.position.x += amount.x;
    this.position.y += amount.y;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
  }
  setPosition(amount) {
    this.position.x = amount.x;
    this.position.y = amount.y;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
    calculateAABB(this);
  }
  rotate(amount) {
    this.angle += amount;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
  }
  setAngle(amount) {
    this.angle = amount;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
    calculateAABB(this);
  }
  addForce(amount) {
    this.force = { x: amount.x * this.FORCE_MULTIPLIER, y: amount.y * this.FORCE_MULTIPLIER };
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
  }
  addTorque(amount) {
    this.torque = amount * this.TORQUE_MULTIPLIER;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
  }
  setLinearVelocity(amount) {
    this.linearVelocity = amount;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
  }
  setAngularVelocity(amount) {
    this.angularVelocity = amount;
    this.needsUpdate = true;
    this.aabbNeedsUpdate = true;
  }
  createBox() {
    let halfW = this.size.w / 2;
    let halfH = this.size.h / 2;
    this.vertices = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH }
    ];
    this.type = this.types[0];
  }
  createTriangle() {
    let halfW = this.size.w / 2;
    let h = this.size.h;
    this.vertices = [
      { x: -halfW, y: 0 },
      { x: halfW, y: 0 },
      { x: 0, y: -h }
    ];
    this.type = this.types[1];
  }
  createCircle() {
    this.type = this.types[2];
  }
  updateBody(time, gravity = { x: 0, y: 9.8 }) {
    if (this.isStatic) return;
    let acceleration = { x: 0, y: 0 };
    let angularAcceleration = 0;
    acceleration.x += this.force.x / this.mass;
    acceleration.y += this.force.y / this.mass;
    if (this.affectedByGravity) {
      acceleration.x += gravity.x;
      acceleration.y += gravity.y;
    }
    this.linearVelocity.x += acceleration.x * time;
    this.linearVelocity.y += acceleration.y * time;
    this.linearVelocity.x *= Math.pow(1 - this.linearDamping.x, time);
    this.linearVelocity.y *= Math.pow(1 - this.linearDamping.y, time);
    this.position.x += this.linearVelocity.x * time;
    this.position.y += this.linearVelocity.y * time;
    angularAcceleration += this.torque / this.inertia;
    this.angularVelocity += angularAcceleration * time;
    this.angle += this.angularVelocity * time;
    this.angularVelocity *= Math.pow(1 - this.angularDamping, time);
    calculateAABB(this);
    this.force.x = 0;
    this.force.y = 0;
  }
};
function calculateAABB(body) {
  const aabb = body.aabb;
  if (body.isCircle) {
    aabb.minX = body.position.x - body.radius;
    aabb.maxX = body.position.x + body.radius;
    aabb.minY = body.position.y - body.radius;
    aabb.maxY = body.position.y + body.radius;
  } else {
    const vertices = body.transformedVertices;
    aabb.minX = Infinity;
    aabb.maxX = -Infinity;
    aabb.minY = Infinity;
    aabb.maxY = -Infinity;
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      if (v.x < aabb.minX) aabb.minX = v.x;
      if (v.x > aabb.maxX) aabb.maxX = v.x;
      if (v.y < aabb.minY) aabb.minY = v.y;
      if (v.y > aabb.maxY) aabb.maxY = v.y;
    }
  }
}
function createBodyBox({
  position = { x: 0, y: 0 },
  size = { w: 10, h: 10 },
  density = 1,
  restitution = 0.5,
  linearDamping = { x: 0, y: 0 },
  angularDamping = 0,
  isStatic = false,
  noRotation = false,
  affectedByGravity = true,
  dynamicFriction = 0.4,
  staticFriction = 0.6
} = {}) {
  const body = new Rigidbody(position, density, restitution, isStatic, noRotation);
  body.size = size;
  const area = body.size.w * body.size.h;
  body.createBox();
  body.mass = Infinity;
  body.inertia = Infinity;
  body.linearDamping = linearDamping;
  body.angularDamping = angularDamping;
  body.staticFriction = staticFriction;
  body.dynamicFriction = dynamicFriction;
  body.affectedByGravity = affectedByGravity;
  calculateAABB(body);
  if (!body.isStatic) {
    body.mass = area * body.density;
    body.inertia = 1 / 12 * body.mass * (body.size.w * body.size.w + body.size.h * body.size.h);
  }
  body.needsUpdate = true;
  return body;
}
function createBodyTriangle({
  position = { x: 0, y: 0 },
  size = { w: 10, h: 10 },
  density = 1,
  restitution = 0.5,
  linearDamping = { x: 0, y: 0 },
  angularDamping = 0,
  isStatic = false,
  noRotation = false,
  affectedByGravity = true,
  dynamicFriction = 0.4,
  staticFriction = 0.6
} = {}) {
  const body = new Rigidbody(position, density, restitution, isStatic, noRotation);
  body.size = size;
  body.createTriangle();
  body.mass = Infinity;
  body.inertia = Infinity;
  const base = body.size.w;
  const height = body.size.h;
  body.linearDamping = linearDamping;
  body.angularDamping = angularDamping;
  body.staticFriction = staticFriction;
  body.dynamicFriction = dynamicFriction;
  body.affectedByGravity = affectedByGravity;
  calculateAABB(body);
  if (!body.isStatic) {
    const area = 0.5 * body.size.w * body.size.h;
    body.mass = area * density;
    body.inertia = body.mass * (base * base + height * height) / 36;
  }
  body.needsUpdate = true;
  return body;
}
function createBodyCircle({
  position = { x: 0, y: 0 },
  radius = 10,
  density = 1,
  restitution = 0.5,
  linearDamping = { x: 0, y: 0 },
  angularDamping = 0,
  isStatic = false,
  noRotation = false,
  affectedByGravity = true,
  dynamicFriction = 0.4,
  staticFriction = 0.6
} = {}) {
  const body = new Rigidbody(position, density, restitution, isStatic, noRotation);
  body.radius = radius;
  body.createCircle();
  body.mass = Infinity;
  body.inertia = Infinity;
  body.linearDamping = linearDamping;
  body.angularDamping = angularDamping;
  if (dynamicFriction > staticFriction) {
    console.warn("Static friction should be higher than dynamic friction");
  }
  body.staticFriction = staticFriction;
  body.dynamicFriction = dynamicFriction;
  body.affectedByGravity = affectedByGravity;
  calculateAABB(body);
  if (!body.isStatic) {
    const area = Math.PI * body.radius * body.radius;
    body.mass = area * body.density;
    body.inertia = 0.5 * body.mass * body.radius * body.radius;
  }
  body.needsUpdate = true;
  return body;
}

// src/collisions.js
function SAT(bodyA, bodyB) {
  let depth = Infinity;
  let normal = { x: 0, y: 0 };
  let axis = { x: 0, y: 0 };
  let worldVerticesA = bodyA.transformedVertices;
  let worldVerticesB = bodyB.transformedVertices;
  for (let i = 0; i < worldVerticesA.length; i++) {
    let va = worldVerticesA[i];
    let vb = worldVerticesA[(i + 1) % worldVerticesA.length];
    let edge = subtractVectors(vb, va);
    axis.x = -edge.y;
    axis.y = edge.x;
    axis = normalize(axis);
    let projectedVertexA = projectVertices(worldVerticesA, axis);
    let projectedVertexB = projectVertices(worldVerticesB, axis);
    let minA = projectedVertexA.min;
    let maxA = projectedVertexA.max;
    let minB = projectedVertexB.min;
    let maxB = projectedVertexB.max;
    if (minA >= maxB || minB >= maxA) {
      return { collision: false };
    }
    let axisDepth = Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal.x = axis.x;
      normal.y = axis.y;
    }
  }
  for (let i = 0; i < worldVerticesB.length; i++) {
    let va = worldVerticesB[i];
    let vb = worldVerticesB[(i + 1) % worldVerticesB.length];
    let edge = subtractVectors(vb, va);
    axis.x = -edge.y;
    axis.y = edge.x;
    axis = normalize(axis);
    let projectedVertexA = projectVertices(worldVerticesA, axis);
    let projectedVertexB = projectVertices(worldVerticesB, axis);
    let minA = projectedVertexA.min;
    let maxA = projectedVertexA.max;
    let minB = projectedVertexB.min;
    let maxB = projectedVertexB.max;
    if (minA >= maxB || minB >= maxA) {
      return { collision: false };
    }
    let axisDepth = Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal.x = axis.x;
      normal.y = axis.y;
    }
  }
  let centerA = bodyA.position;
  let centerB = bodyB.position;
  let direction = subtractVectors(centerB, centerA);
  if (dotProduct(direction, normal) < 0) {
    normal.x = -normal.x;
    normal.y = -normal.y;
  }
  return { collision: true, normal, depth };
}
function circleVsPolygon(bodyA, bodyB) {
  let circleCenter = bodyA.position;
  let circleRadius = bodyA.radius;
  let vertices = bodyB.transformedVertices;
  let polygonCenter = bodyB.position;
  let normal = { x: 0, y: 0 };
  let depth = Infinity;
  let axis = { x: 0, y: 0 };
  let axisDepth = 0;
  let minA, maxA, minB, maxB;
  for (let i = 0; i < vertices.length; i++) {
    let va = vertices[i];
    let vb = vertices[(i + 1) % vertices.length];
    let edge = subtractVectors(vb, va);
    axis.x = -edge.y;
    axis.y = edge.x;
    axis = normalize(axis);
    let projectedVertex2 = projectVertices(vertices, axis);
    let projectedCircle2 = projectCircle(circleCenter, circleRadius, axis);
    minA = projectedVertex2.min;
    maxA = projectedVertex2.max;
    minB = projectedCircle2.min;
    maxB = projectedCircle2.max;
    if (minA >= maxB || minB >= maxA) {
      return { collision: false };
    }
    axisDepth = Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal.x = axis.x;
      normal.y = axis.y;
    }
  }
  let cpIndex = closestPointOnPolygon(circleCenter, vertices);
  let cp = vertices[cpIndex];
  axis = subtractVectors(cp, circleCenter);
  axis = normalize(axis);
  let projectedVertex = projectVertices(vertices, axis);
  let projectedCircle = projectCircle(circleCenter, circleRadius, axis);
  minA = projectedVertex.min;
  maxA = projectedVertex.max;
  minB = projectedCircle.min;
  maxB = projectedCircle.max;
  if (minA >= maxB || minB >= maxA) {
    return { collision: false };
  }
  axisDepth = Math.min(maxB - minA, maxA - minB);
  if (axisDepth < depth) {
    depth = axisDepth;
    normal.x = axis.x;
    normal.y = axis.y;
  }
  let direction = subtractVectors(polygonCenter, circleCenter);
  if (dotProduct(direction, normal) > 0) {
    normal.x = -normal.x;
    normal.y = -normal.y;
  }
  return { collision: true, normal, depth };
}
function circleVsCircle(bodyA, bodyB) {
  let normal = { x: 0, y: 0 };
  let depth = Infinity;
  let centerA = bodyA.position;
  let centerB = bodyB.position;
  let radiusA = bodyA.radius;
  let radiusB = bodyB.radius;
  let dist = distance(centerB, centerA);
  let radii = radiusA + radiusB;
  if (dist >= radii) {
    return { collision: false };
  }
  normal = subtractVectors(centerB, centerA);
  normal = normalize(normal);
  depth = radii - dist;
  return { collision: true, normal, depth };
}
function AABBvsAABB(bodyA, bodyB) {
  const a = bodyA.aabb;
  const b = bodyB.aabb;
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}
function findContactPoints(bodyA, bodyB) {
  let contactInfo = null;
  if (!bodyA.isCircle && !bodyB.isCircle) {
    contactInfo = contactPointsPolygon(bodyA, bodyB);
  } else if (bodyA.isCircle && bodyB.isCircle) {
    contactInfo = contactPointsCircle(bodyA, bodyB);
  } else if (!bodyA.isCircle && bodyB.isCircle) {
    contactInfo = contactPointsPolygonCircle(bodyA, bodyB);
  } else if (!bodyB.isCircle && bodyA.isCircle) {
    contactInfo = contactPointsPolygonCircle(bodyB, bodyA);
  } else {
    console.error("one of the polygons has an unsupported shape");
  }
  return contactInfo;
}
function contactPointsPolygon(bodyA, bodyB) {
  let contact1 = null;
  let contact2 = null;
  let contactCount = 0;
  let verticesA = bodyA.transformedVertices;
  let verticesB = bodyB.transformedVertices;
  let minDistSq = Infinity;
  for (let i = 0; i < verticesA.length; i++) {
    let p = verticesA[i];
    for (let j = 0; j < verticesB.length; j++) {
      let va = verticesB[j];
      let vb = verticesB[(j + 1) % verticesB.length];
      let pointSegDist = pointSegmentDistance(p, va, vb);
      let distSq = pointSegDist.distanceSqrd;
      let cp = pointSegDist.closestPoint;
      if (almostEqual(distSq, minDistSq)) {
        if (!almostEqualVector(cp, contact1)) {
          contact2 = cp;
          contactCount = 2;
        }
      } else if (distSq < minDistSq) {
        minDistSq = distSq;
        contactCount = 1;
        contact1 = cp;
      }
    }
  }
  for (let i = 0; i < verticesB.length; i++) {
    let p = verticesB[i];
    for (let j = 0; j < verticesA.length; j++) {
      let va = verticesA[j];
      let vb = verticesA[(j + 1) % verticesA.length];
      let pointSegDist = pointSegmentDistance(p, va, vb);
      let distSq = pointSegDist.distanceSqrd;
      let cp = pointSegDist.closestPoint;
      if (almostEqual(distSq, minDistSq)) {
        if (!almostEqualVector(cp, contact1)) {
          contact2 = cp;
          contactCount = 2;
        }
      } else if (distSq < minDistSq) {
        minDistSq = distSq;
        contactCount = 1;
        contact1 = cp;
      }
    }
  }
  return {
    contact1,
    contact2,
    contactCount
  };
}
function contactPointsPolygonCircle(bodyA, bodyB) {
  let cp = null;
  let vertices = bodyA.transformedVertices;
  let circleCenter = bodyB.position;
  let minDistSq = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    let va = vertices[i];
    let vb = vertices[(i + 1) % vertices.length];
    let pointSegDist = pointSegmentDistance(circleCenter, va, vb);
    if (pointSegDist.distanceSqrd < minDistSq) {
      minDistSq = pointSegDist.distanceSqrd;
      cp = pointSegDist.closestPoint;
    }
  }
  return { contact1: cp, contactCount: 1 };
}
function contactPointsCircle(bodyA, bodyB) {
  let centerA = bodyA.position;
  let centerB = bodyB.position;
  let radiusA = bodyA.radius;
  let ab = subtractVectors(centerB, centerA);
  let direction = normalize(ab);
  let cp = addVectors(centerA, scaleVector(direction, radiusA));
  return { contact1: cp, contactCount: 1 };
}
function projectVertices(vertices, axis) {
  let min = Infinity;
  let max = -Infinity;
  const length = Math.hypot(axis.x, axis.y);
  const normalizedAxis = { x: axis.x / length, y: axis.y / length };
  for (let i = 0; i < vertices.length; i++) {
    const projection = dotProduct(vertices[i], normalizedAxis);
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }
  return { min, max };
}
function projectCircle(center, radius, axis) {
  let min = 1;
  let max = -1;
  let dir = normalize(axis);
  let dirAndRadius = scaleVector(dir, radius);
  let p1 = addVectors(center, dirAndRadius);
  let p2 = subtractVectors(center, dirAndRadius);
  min = dotProduct(p1, axis);
  max = dotProduct(p2, axis);
  if (min > max) {
    let temp = max;
    max = min;
    min = temp;
  }
  return { min, max };
}
function closestPointOnPolygon(circleCenter, vertices) {
  let result = -1;
  let minDist = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    let currentVertex = vertices[i];
    let dist = distance(currentVertex, circleCenter);
    if (dist < minDist) {
      minDist = dist;
      result = i;
    }
  }
  return result;
}
function pointSegmentDistance(p, a, b) {
  let ab = { x: b.x - a.x, y: b.y - a.y };
  let ap = { x: p.x - a.x, y: p.y - a.y };
  let proj = dotProduct(ab, ap);
  let abLenSq = lengthSquared(ab);
  let d = proj / abLenSq;
  let cp = { x: 0, y: 0 };
  if (d <= 0) {
    cp.x = a.x;
    cp.y = a.y;
  } else if (d >= 1) {
    cp.x = b.x;
    cp.y = b.y;
  } else {
    cp = addVectors(a, scaleVector(ab, d));
  }
  let distanceSqrd = distanceSquared(p, cp);
  return {
    distanceSqrd,
    closestPoint: cp
  };
}
function areContactsAligned(contact1, contact2, normal) {
  if (!contact1 || !contact2) return false;
  let edge = subtractVectors(contact2, contact1);
  let edgeLength = lengthSquared(edge);
  if (edgeLength < 1e-6) return true;
  let edgeNorm = normalize(edge);
  let normalDot = Math.abs(dotProduct(edgeNorm, normal));
  return normalDot < 0.1;
}

// src/mainfold.js
var Mainfold = class {
  constructor(bodyA, bodyB, normal, depth, contact1, contact2, contactCount) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.normal = normal;
    this.depth = depth;
    this.contact1 = contact1;
    this.contact2 = contact2;
    this.contactCount = contactCount;
  }
};

// src/physics.js
var PhysWorld = class {
  constructor(bodies = [], gravity = { x: 0, y: 0 }) {
    this.bodies = bodies;
    this.gravity = gravity;
    this.contacts = [];
    this.raList = [];
    this.rbList = [];
    this.impulseList = [];
    this.frictionImpulseList = [];
    this.jList = [];
  }
  step({ dt, useRotations = false, iterations = 10 }) {
    for (let i = 0; i < iterations; i++) {
      for (let body of this.bodies) {
        body.updateBody(dt, this.gravity);
      }
      const n = this.bodies.length;
      for (let i2 = 0; i2 < n; i2++) {
        for (let j = i2 + 1; j < n; j++) {
          const bodyA = this.bodies[i2];
          const bodyB = this.bodies[j];
          if (!AABBvsAABB(bodyA, bodyB)) continue;
          if (bodyA.isStatic && bodyB.isStatic) continue;
          this.collisionStep(bodyA, bodyB, useRotations);
        }
      }
    }
  }
  collisionStep(bodyA, bodyB, useRotations) {
    let result = this.resolveCollisions(bodyA, bodyB);
    if (result.collision) {
      this.separateBodies(bodyA, bodyB, result);
      let contacts = findContactPoints(bodyA, bodyB);
      let manifold = new Mainfold(
        bodyA,
        bodyB,
        result.normal,
        result.depth,
        contacts.contact1,
        contacts.contact2,
        contacts.contactCount
      );
      if (useRotations) {
        this.resolveCollisionsRotationalAndFriction(manifold);
      } else {
        this.resolveCollisionsBasicWithFriction(manifold);
      }
    }
  }
  separateBodies(bodyA, bodyB, result) {
    if (bodyA.hasInfiniteMass || bodyA.isStatic) {
      bodyB.move({ x: result.normal.x * result.depth, y: result.normal.y * result.depth });
    } else if (bodyB.hasInfiniteMass || bodyB.isStatic) {
      bodyA.move({ x: -result.normal.x * result.depth, y: -result.normal.y * result.depth });
    } else {
      bodyA.move({ x: -result.normal.x * result.depth / 2, y: -result.normal.y * result.depth / 2 });
      bodyB.move({ x: result.normal.x * result.depth / 2, y: result.normal.y * result.depth / 2 });
    }
  }
  resolveCollisions(bodyA, bodyB) {
    if (bodyA.isStatic && bodyB.isStatic) return;
    let result = null;
    if (!bodyA.isCircle && !bodyB.isCircle) {
      result = SAT(bodyA, bodyB);
    } else if (bodyA.isCircle && bodyB.isCircle) {
      result = circleVsCircle(bodyA, bodyB);
    } else if (!bodyA.isCircle && bodyB.isCircle) {
      result = circleVsPolygon(bodyB, bodyA);
    } else if (!bodyB.isCircle && bodyA.isCircle) {
      result = circleVsPolygon(bodyA, bodyB);
    } else {
      console.error("one of the polygons has an unsupported shape");
    }
    return result;
  }
  resolveCollisionsBasic(manifold) {
    const bodyA = manifold.bodyA;
    const bodyB = manifold.bodyB;
    const normal = manifold.normal;
    let relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);
    if (dotProduct(relativeVel, normal) > 0) return;
    let e = 0;
    if (bodyA.mass === Infinity || bodyA.isStatic) {
      e = bodyB.restitution;
    } else if (bodyB.mass === Infinity || bodyB.isStatic) {
      e = bodyA.restitution;
    } else {
      e = Math.min(bodyA.restitution, bodyB.restitution);
    }
    let j = -(1 + e) * dotProduct(relativeVel, normal);
    j /= bodyA.invMass + bodyB.invMass;
    if (!bodyA.isStatic) {
      bodyA.linearVelocity.x -= j * bodyA.invMass * normal.x;
      bodyA.linearVelocity.y -= j * bodyA.invMass * normal.y;
    }
    if (!bodyB.isStatic) {
      bodyB.linearVelocity.x += j * bodyB.invMass * normal.x;
      bodyB.linearVelocity.y += j * bodyB.invMass * normal.y;
    }
  }
  resolveCollisionsBasicWithFriction(manifold) {
    const bodyA = manifold.bodyA;
    const bodyB = manifold.bodyB;
    const normal = manifold.normal;
    let relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);
    let sf = Math.sqrt(bodyA.staticFriction * bodyB.staticFriction);
    let df = Math.sqrt(bodyA.dynamicFriction * bodyB.dynamicFriction);
    if (dotProduct(relativeVel, normal) > 0) return;
    let e = 0;
    if (bodyA.mass === Infinity || bodyA.isStatic) {
      e = bodyB.restitution;
    } else if (bodyB.mass === Infinity || bodyB.isStatic) {
      e = bodyA.restitution;
    } else {
      e = Math.min(bodyA.restitution, bodyB.restitution);
    }
    let j;
    j = -(1 + e) * dotProduct(relativeVel, normal);
    j /= bodyA.invMass + bodyB.invMass;
    if (!bodyA.isStatic) {
      bodyA.linearVelocity.x -= j * bodyA.invMass * normal.x;
      bodyA.linearVelocity.y -= j * bodyA.invMass * normal.y;
    }
    if (!bodyB.isStatic) {
      bodyB.linearVelocity.x += j * bodyB.invMass * normal.x;
      bodyB.linearVelocity.y += j * bodyB.invMass * normal.y;
    }
    relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);
    const velAlongNormal = dotProduct(relativeVel, normal);
    let tangent = subtractVectors(relativeVel, scaleVector(normal, velAlongNormal));
    if (almostEqualVector(tangent, { x: 0, y: 0 })) return;
    tangent = normalize(tangent);
    let jt = -dotProduct(relativeVel, tangent);
    jt /= bodyA.invMass + bodyB.invMass;
    let frictionImpulse;
    if (Math.abs(jt) < j * sf) {
      frictionImpulse = scaleVector(tangent, jt);
    } else {
      frictionImpulse = scaleVector(tangent, -j * df);
    }
    if (!bodyA.isStatic) {
      bodyA.linearVelocity = subtractVectors(bodyA.linearVelocity, scaleVector(frictionImpulse, bodyA.invMass));
    }
    if (!bodyB.isStatic) {
      bodyB.linearVelocity = addVectors(bodyB.linearVelocity, scaleVector(frictionImpulse, bodyB.invMass));
    }
  }
  resolveCollisionsRotational(manifold) {
    const bodyA = manifold.bodyA;
    const bodyB = manifold.bodyB;
    const normal = manifold.normal;
    const contact1 = manifold.contact1;
    const contact2 = manifold.contact2;
    const contactCount = manifold.contactCount;
    let e = 0;
    if (bodyA.mass === Infinity || bodyA.isStatic) {
      e = bodyB.restitution;
    } else if (bodyB.mass === Infinity || bodyB.isStatic) {
      e = bodyA.restitution;
    } else {
      e = Math.min(bodyA.restitution, bodyB.restitution);
    }
    let contactList = [contact1, contact2];
    for (let i = 0; i < contactCount; i++) {
      this.impulseList[i] = { x: 0, y: 0 };
      this.raList[i] = { x: 0, y: 0 };
      this.rbList[i] = { x: 0, y: 0 };
    }
    for (let i = 0; i < contactCount; i++) {
      let ra = { x: 0, y: 0 };
      let rb = { x: 0, y: 0 };
      ra = subtractVectors(contactList[i], bodyA.position);
      rb = subtractVectors(contactList[i], bodyB.position);
      this.raList[i] = ra;
      this.rbList[i] = rb;
      let raPerp = { x: -ra.y, y: ra.x };
      let rbPerp = { x: -rb.y, y: rb.x };
      let angularLinearVelA = scaleVector(raPerp, bodyA.angularVelocity);
      let angularLinearVelB = scaleVector(rbPerp, bodyB.angularVelocity);
      let relativeVel = subtractVectors(
        addVectors(bodyB.linearVelocity, angularLinearVelB),
        addVectors(bodyA.linearVelocity, angularLinearVelA)
      );
      let contactVelocityMag = dotProduct(relativeVel, normal);
      if (contactVelocityMag > 0) continue;
      let raPerpDotN = dotProduct(raPerp, normal);
      let rbPerpDotN = dotProduct(rbPerp, normal);
      let denominator = bodyA.invMass + bodyB.invMass + raPerpDotN * raPerpDotN * bodyA.invInertia + rbPerpDotN * rbPerpDotN * bodyB.invInertia;
      let j;
      if (contactCount === 2 && areContactsAligned(contact1, contact2, normal)) {
        relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);
        j = -(1 + e) * dotProduct(relativeVel, normal);
        j /= bodyA.invMass + bodyB.invMass;
        j /= contactCount;
      } else {
        j = -(1 + e) * contactVelocityMag;
        j /= denominator;
        j /= contactCount;
      }
      let impulse = { x: 0, y: 0 };
      impulse.x = j * normal.x;
      impulse.y = j * normal.y;
      this.impulseList[i] = impulse;
    }
    for (let i = 0; i < contactCount; i++) {
      let impulse = this.impulseList[i];
      let ra = this.raList[i];
      let rb = this.rbList[i];
      if (!bodyA.isStatic) {
        bodyA.linearVelocity.x += -impulse.x * bodyA.invMass;
        bodyA.linearVelocity.y += -impulse.y * bodyA.invMass;
      }
      if (!bodyA.rotates) {
        bodyA.angularVelocity += -crossProduct(ra, impulse) * bodyA.invInertia;
      }
      if (!bodyB.isStatic) {
        bodyB.linearVelocity.x += impulse.x * bodyB.invMass;
        bodyB.linearVelocity.y += impulse.y * bodyB.invMass;
      }
      if (!bodyB.rotates) {
        bodyB.angularVelocity += crossProduct(rb, impulse) * bodyB.invInertia;
      }
    }
  }
  resolveCollisionsRotationalAndFriction(manifold) {
    const bodyA = manifold.bodyA;
    const bodyB = manifold.bodyB;
    const normal = manifold.normal;
    const contact1 = manifold.contact1;
    const contact2 = manifold.contact2;
    const contactCount = manifold.contactCount;
    let e = 0;
    if (bodyA.mass === Infinity || bodyA.isStatic) {
      e = bodyB.restitution;
    } else if (bodyB.mass === Infinity || bodyB.isStatic) {
      e = bodyA.restitution;
    } else {
      e = Math.min(bodyA.restitution, bodyB.restitution);
    }
    let sf = Math.sqrt(bodyA.staticFriction * bodyB.staticFriction);
    let df = Math.sqrt(bodyA.dynamicFriction * bodyB.dynamicFriction);
    let contactList = [contact1, contact2];
    for (let i = 0; i < contactCount; i++) {
      this.impulseList[i] = { x: 0, y: 0 };
      this.frictionImpulseList[i] = { x: 0, y: 0 };
      this.jList[i] = 0;
      this.raList[i] = { x: 0, y: 0 };
      this.rbList[i] = { x: 0, y: 0 };
    }
    for (let i = 0; i < contactCount; i++) {
      let ra = { x: 0, y: 0 };
      let rb = { x: 0, y: 0 };
      ra = subtractVectors(contactList[i], bodyA.position);
      rb = subtractVectors(contactList[i], bodyB.position);
      this.raList[i] = ra;
      this.rbList[i] = rb;
      let raPerp = { x: -ra.y, y: ra.x };
      let rbPerp = { x: -rb.y, y: rb.x };
      let angularLinearVelA = scaleVector(raPerp, bodyA.angularVelocity);
      let angularLinearVelB = scaleVector(rbPerp, bodyB.angularVelocity);
      let relativeVel = subtractVectors(
        addVectors(bodyB.linearVelocity, angularLinearVelB),
        addVectors(bodyA.linearVelocity, angularLinearVelA)
      );
      let contactVelocityMag = dotProduct(relativeVel, normal);
      if (contactVelocityMag > 0) continue;
      let raPerpDotN = dotProduct(raPerp, normal);
      let rbPerpDotN = dotProduct(rbPerp, normal);
      let denominator = bodyA.invMass + bodyB.invMass + raPerpDotN * raPerpDotN * bodyA.invInertia + rbPerpDotN * rbPerpDotN * bodyB.invInertia;
      let j;
      if (contactCount === 2 && areContactsAligned(contact1, contact2, normal)) {
        relativeVel = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);
        j = -(1 + e) * dotProduct(relativeVel, normal);
        j /= bodyA.invMass + bodyB.invMass;
        j /= contactCount;
      } else {
        j = -(1 + e) * contactVelocityMag;
        j /= denominator;
        j /= contactCount;
      }
      this.jList[i] = j;
      let impulse = { x: 0, y: 0 };
      impulse.x = j * normal.x;
      impulse.y = j * normal.y;
      this.impulseList[i] = impulse;
    }
    for (let i = 0; i < contactCount; i++) {
      let impulse = this.impulseList[i];
      let ra = this.raList[i];
      let rb = this.rbList[i];
      if (!bodyA.isStatic) {
        bodyA.linearVelocity.x += -impulse.x * bodyA.invMass;
        bodyA.linearVelocity.y += -impulse.y * bodyA.invMass;
      }
      if (!bodyA.rotates) {
        bodyA.angularVelocity += -crossProduct(ra, impulse) * bodyA.invInertia;
      }
      if (!bodyB.isStatic) {
        bodyB.linearVelocity.x += impulse.x * bodyB.invMass;
        bodyB.linearVelocity.y += impulse.y * bodyB.invMass;
      }
      if (!bodyB.rotates) {
        bodyB.angularVelocity += crossProduct(rb, impulse) * bodyB.invInertia;
      }
    }
    for (let i = 0; i < contactCount; i++) {
      let ra = { x: 0, y: 0 };
      let rb = { x: 0, y: 0 };
      ra = subtractVectors(contactList[i], bodyA.position);
      rb = subtractVectors(contactList[i], bodyB.position);
      this.raList[i] = ra;
      this.rbList[i] = rb;
      let raPerp = { x: -ra.y, y: ra.x };
      let rbPerp = { x: -rb.y, y: rb.x };
      let angularLinearVelA = scaleVector(raPerp, bodyA.angularVelocity);
      let angularLinearVelB = scaleVector(rbPerp, bodyB.angularVelocity);
      let relativeVel = subtractVectors(
        addVectors(bodyB.linearVelocity, angularLinearVelB),
        addVectors(bodyA.linearVelocity, angularLinearVelA)
      );
      let dot = dotProduct(relativeVel, normal);
      let tangent = subtractVectors(relativeVel, scaleVector(normal, dot));
      if (almostEqualVector(tangent, { x: 0, y: 0 })) {
        continue;
      } else {
        tangent = normalize(tangent);
      }
      let raPerpDotT = dotProduct(raPerp, tangent);
      let rbPerpDotT = dotProduct(rbPerp, tangent);
      let denominator = bodyA.invMass + bodyB.invMass + raPerpDotT * raPerpDotT * bodyA.invInertia + rbPerpDotT * rbPerpDotT * bodyB.invInertia;
      let j = this.jList[i];
      let jt = 0;
      jt = -dotProduct(relativeVel, tangent);
      jt /= denominator;
      jt /= contactCount;
      let frictionImpulse = { x: 0, y: 0 };
      if (Math.abs(jt) <= j * sf) {
        frictionImpulse.x = jt * tangent.x;
        frictionImpulse.y = jt * tangent.y;
      } else {
        frictionImpulse.x = -j * tangent.x * df;
        frictionImpulse.y = -j * tangent.y * df;
      }
      this.frictionImpulseList[i] = frictionImpulse;
    }
    for (let i = 0; i < contactCount; i++) {
      let frictionImpulse = this.frictionImpulseList[i];
      let ra = this.raList[i];
      let rb = this.rbList[i];
      if (!bodyA.isStatic) {
        bodyA.linearVelocity.x += -frictionImpulse.x * bodyA.invMass;
        bodyA.linearVelocity.y += -frictionImpulse.y * bodyA.invMass;
      }
      if (!bodyA.rotates) {
        bodyA.angularVelocity += -crossProduct(ra, frictionImpulse) * bodyA.invInertia;
      }
      if (!bodyB.isStatic) {
        bodyB.linearVelocity.x += frictionImpulse.x * bodyB.invMass;
        bodyB.linearVelocity.y += frictionImpulse.y * bodyB.invMass;
      }
      if (!bodyB.rotates) {
        bodyB.angularVelocity += crossProduct(rb, frictionImpulse) * bodyB.invInertia;
      }
    }
  }
};
export {
  AABB,
  AABBvsAABB,
  PhysWorld,
  Rigidbody,
  SAT,
  addVectors,
  almostEqual,
  almostEqualVector,
  circleVsCircle,
  circleVsPolygon,
  clamp,
  createBodyBox,
  createBodyCircle,
  createBodyTriangle,
  crossProduct,
  distance,
  distanceSquared,
  dotProduct,
  lengthSquared,
  magnitude,
  multiplyVectors,
  normalize,
  scaleVector,
  subtractVectors
};
