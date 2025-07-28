import { createBodyBox, createBodyCircle } from "../src/rigidbody.js";
export class TestPlayer {
  constructor(body, physWorld) {
    this.body = body;
    this.physWorld = physWorld;
    this.spawnCooldown = 0;
  }

  move(timeStep, keysPressed, mousePos, mouseClicked) {
    const speed = 30;
    const rotSpeed = 30;

    let speedX = 0, speedY = 0, rotation = 0;

    if (keysPressed['w']) speedY = -speed;
    if (keysPressed['s']) speedY = speed;
    if (keysPressed['a']) speedX = -speed;
    if (keysPressed['d']) speedX = speed;

    if (keysPressed['q']) rotation = -rotSpeed;
    if (keysPressed['e']) rotation = rotSpeed;

    this.body.addForce({x:speedX,  y:speedY});
    //this.body.setLinearVelocity({x: speedX, y: speedY}); //more snappier
    
    this.body.addTorque(rotation);

    if (mouseClicked && this.spawnCooldown <= 0) {
      this.spawnBox(mousePos);
      this.spawnCooldown = 0.3;
    }

    this.spawnCooldown -= timeStep;
  }

  spawnBox(position) 
  {
    const newBody = createBodyBox({
      position: { x: position.x, y: position.y },
      size: { w: 20, h: 20 },
      density: 1,
      restitution: 0.5,
      linearDamping: { x: 0, y: 0 },
      angularDamping: 0,
      isStatic: false,
      staticFriction:0.6,
      dynamicFriction:0.4
    });

    this.physWorld.bodies.push(newBody);
  }

  spawnCircle(position) 
  {
    const newBody = createBodyCircle({
      position: { x: position.x, y: position.y },
      radius: 20,
      density: 1,
      restitution: 0.5,
      linearDamping: { x: 0, y: 0 },
      angularDamping: 0,
      isStatic: false,
      staticFriction: 0.9,
      dynamicFriction: 0.7
    });

    this.physWorld.bodies.push(newBody);
  }
}
