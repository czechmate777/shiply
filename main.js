var thrustThrowAngle = 0.28;

var keys = {
    left: false,
    right: false,
}

var Engine = Matter.Engine,
    Render = Matter.Render,
    Bounds = Matter.Bounds,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies;
    Vector = Matter.Vector;

// create engine
var engine = Engine.create({ timing: { timeScale: 0.5 } }),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        // showAxes: true,
        // showCollisions: true,
        showConvexHulls: true,
        wireframes: false,
        pixelRatio: window.devicePixelRatio
    }
});

Render.run(render);

// create runner
var runner = Runner.create({
    isFixed: true
});
// Runner.run(runner, engine);

// lock the frame rate to 60fps
const fps = 60;
const interval = 1000 / fps;
let then = Date.now();
let elapsed = 0;

function update() {
  // calculate elapsed time since last loop
  const now = Date.now();
  const delta = now - then;
  elapsed += delta;

  // update simulation if enough time has passed
  if (elapsed > interval) {
    // update simulation
    elapsed -= interval;
    Runner.tick(runner, engine, elapsed);
  }

  // request next frame
  then = now;
  requestAnimationFrame(update);
}

// start the animation loop
requestAnimationFrame(update);

// add bodies
var shipBody = Bodies.rectangle(350, 200, 15, 35, { density: 0.01, render: { fillStyle: '#eeeeee' }});
var shipThruster = Bodies.rectangle(350, 220, 15, 5, { density: 0.01, render: { fillStyle: '#ee0202' }});
var ship = Body.create({
    parts: [shipBody, shipThruster]
})


Composite.add(world, ship);

var bodyA = Bodies.rectangle(100, 300, 50, 50, { isStatic: true, render: { fillStyle: '#060a19' } }),
    bodyB = Bodies.rectangle(200, 200, 50, 50),
    bodyC = Bodies.rectangle(300, 200, 50, 50),
    bodyD = Bodies.rectangle(400, 200, 50, 50),
    bodyE = Bodies.rectangle(550, 200, 50, 50),
    bodyF = Bodies.rectangle(700, 200, 50, 50),
    bodyG = Bodies.circle(400, 100, 25, { render: { fillStyle: '#060a19' } });

// add compound body
var partA = Bodies.rectangle(600, 200, 120 * 0.8, 50 * 0.8, { render: { fillStyle: '#060a19' } }),
    partB = Bodies.rectangle(660, 200, 50 * 0.8, 190 * 0.8, { render: { fillStyle: '#060a19' } }),
    compound = Body.create({
        parts: [partA, partB],
        isStatic: true
    });

Body.setPosition(compound, { x: 600, y: 300 });

Composite.add(world, [bodyA, bodyB, bodyC, bodyD, bodyE, bodyF, bodyG, compound]);

Composite.add(world, [
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

Events.on(engine, 'beforeUpdate', function (event) {
    var forceVector = Vector.create(0, -0.008);
    Vector.rotate(forceVector, ship.angle, forceVector);
    if (keys.left) {
        Body.applyForce(ship, shipThruster.position, Vector.rotate(forceVector, -thrustThrowAngle));
    }
    if (keys.right) {
        Body.applyForce(ship, shipThruster.position, Vector.rotate(forceVector, thrustThrowAngle));
    }

    // Camera follow ship
    Bounds.translate(
        render.bounds,
        Vector.add(
            Vector.sub(
                ship.position,
                render.bounds.max
            ),
            Vector.div(
                Vector.sub(
                    render.bounds.max,
                    render.bounds.min
                ),
                2
            )
        )
    );
});

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: true
            }
        }
    });

Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 400, y: 600 }
});

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowLeft":
            keys.left = true;
            break;
        case "ArrowRight":
            keys.right = true;
            break;
        default:
            break;
    }
});

window.addEventListener("keyup", e => {
    switch (e.key) {
        case "ArrowLeft":
            keys.left = false;
            break;
        case "ArrowRight":
            keys.right = false;
            break;
        default:
            break;
    }
});

window.addEventListener("touchstart", e => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        if (touch.clientX < render.canvas.clientWidth/2) {
            keys.left = true;
        }
        else {
            keys.right = true;
        }
    }
});

window.addEventListener("touchend", e => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        let touch = e.changedTouches[i];
        if (touch.clientX < render.canvas.clientWidth/2) {
            keys.left = false;
        }
        else {
            keys.right = false;
        }
    }
});

window.addEventListener('resize', () => {
    render.bounds.min.y = 0;
    render.bounds.max.y = window.innerHeight/window.innerWidth*(render.bounds.max.x-render.bounds.min.x);
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    Matter.Render.setPixelRatio(render, window.devicePixelRatio);
});