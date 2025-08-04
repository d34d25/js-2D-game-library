let objects = []; // to store added objects
let camera = {
  x: 0,
  y: 0
};

// Global vars for dragging camera
let cameraOffset = { x: 0, y: 0 };
let draggingCamera = false;
let dragStart = { x: 0, y: 0 };
let dragOffset = {x: 0, y:0};
let draggingObject = null;

document.getElementById("add-light-btn").addEventListener("click", () => {
  const container = document.getElementById("lights-container");

  const lightIndex = container.children.length;

  const lightDiv = document.createElement("div");
  lightDiv.className = "light-block";
  lightDiv.innerHTML = `
    <hr />
    <strong>Light ${lightIndex + 1}</strong><br />
    Angle (radians): <input type="number" name="light-angle" step="0.01" value="0" /><br />
    Radius: <input type="number" name="light-radius" step="1" value="100" /><br />
    Spread: <input type="number" name="light-spread" step="1" value="0.78" /><br />
    Length: <input type="number" name="light-length" step="1" value="100" /><br />
    Intensity: <input type="number" name="light-intensity" step="0.1" value="1" /><br />
    Color: <input type="color" name="light-color" value="#ffffff" /><br />
    Alpha: <input type="number" name="light-alpha" step="0.1" min="0" max="1" value="1" /><br />
    <label><input type="checkbox" name="light-isCircular" checked /> Is Circular</label><br />
    <label><input type="checkbox" name="light-isCone" /> Is Cone</label><br />
    <button type="button" class="remove-light-btn">Remove Light</button>
  `;

  container.appendChild(lightDiv);

  const removeBtn = lightDiv.querySelector(".remove-light-btn");
  removeBtn.addEventListener("click", () => {
    lightDiv.remove();
  });
});


//add object

let selectedPosition = { x: 10, y: 10 }; // temporary, set from canvas later

document.getElementById("add-object-btn").addEventListener("click", () => {
  const form = document.getElementById("level-form");

  const obj = {
    type: form.elements["type"].value,  // <-- add this line to capture type
    position: { ...selectedPosition },
    size: {
        w: parseFloat(form.elements["width"].value) || 0,
        h: parseFloat(form.elements["height"].value) || 0,
    },
    density: parseFloat(form.elements["density"].value) || 0,
    bounciness: parseFloat(form.elements["bounciness"].value) || 0,
    linearDamping: {
        x: parseFloat(form.elements["linearDampingX"].value) || 0,
        y: parseFloat(form.elements["linearDampingY"].value) || 0,
    },
    angularDamping: parseFloat(form.elements["angularDamping"].value) || 0,
    staticFriction: parseFloat(form.elements["staticFriction"].value) || 0,
    dynamicFriction: parseFloat(form.elements["dynamicFriction"].value) || 0,
    isStatic: form.elements["isStatic"].checked,
    hasRotations: form.elements["hasRotations"].checked,
    angle: parseFloat(form.elements["angle"].value) || 0,
    radius: parseFloat(form.elements["radius"].value) || 0,
    hasGravity: form.elements["hasGravity"].checked,
    color: hexToRgb(form.elements["color"].value || "#000000"),
    alpha: parseFloat(form.elements["alpha"].value) || 1,
    lights: [],
    isEntity: form.elements["isEntity"].checked,
    hasBody: form.elements["hasBody"].checked,
    isPlayer: form.elements["isPlayer"].checked
    };


  const lightBlocks = document.querySelectorAll("#lights-container .light-block");
  lightBlocks.forEach(lightEl => {
    const inputs = lightEl.querySelectorAll("input");
    const light = {
      angle: parseFloat(inputs[0].value) || 0,
      radius: parseFloat(inputs[1].value) || 0,
      spread: parseFloat(inputs[2].value) || 0,
      length: parseFloat(inputs[3].value) || 0,
      intensity: parseFloat(inputs[4].value) || 0,
      color: hexToRgb(inputs[5].value || "#ffffff"),
      alpha: parseFloat(inputs[6].value) || 1,
      isCircular: inputs[7].checked,
      isCone: inputs[8].checked
    };
    obj.lights.push(light);
  });

  // Store or process object
  objects.push(obj);
  console.log("Added object:", obj);

  drawObjects();
});


function rgbToHex(color) {
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Convert hex string (#rrggbb) to RGB object
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}


function rgbToRGBA(color, alpha) {
  if (!color || color.r === undefined || color.g === undefined || color.b === undefined) {
    console.warn("Invalid color object:", color);
    return `rgba(0,0,0,${alpha})`; // fallback
  }
  return `rgba(${color.r},${color.g},${color.b},${alpha})`;
}


//drawing

const canvas = document.getElementById("level-canvas");
const ctx = canvas.getContext("2d");



// Adjust getMousePos to get canvas-relative coordinates (no change needed here)
// We'll handle cameraOffset separately.

// In drawObjects, apply cameraOffset before drawing objects:
function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Apply camera offset (pan)
  ctx.translate(cameraOffset.x, cameraOffset.y);

  objects.forEach(obj => {
    ctx.save();

    ctx.globalAlpha = obj.alpha;
    ctx.fillStyle = `rgb(${obj.color.r},${obj.color.g},${obj.color.b})`;
    ctx.strokeStyle = `rgb(${obj.color.r},${obj.color.g},${obj.color.b})`;


    ctx.translate(obj.position.x, obj.position.y);
    ctx.rotate(obj.angle);

    switch(obj.type) {
      case "box":
        ctx.fillRect(-obj.size.w/2, -obj.size.h/2, obj.size.w, obj.size.h);
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -obj.size.h / 2);
        ctx.lineTo(obj.size.w / 2, obj.size.h / 2);
        ctx.lineTo(-obj.size.w / 2, obj.size.h / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    obj.lights.forEach(light => {
      ctx.save();

      ctx.translate(0, 0);
      ctx.rotate(light.angle);

      if (light.isCircular) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, light.radius);
        const rgba = rgbToRGBA(light.color, light.alpha * light.intensity);
        grad.addColorStop(0, rgba);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, light.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (light.isCone) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, light.length);
        const rgba = rgbToRGBA(light.color, light.alpha * light.intensity);
        grad.addColorStop(0, rgba);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;

        const spreadRad = light.spread;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, light.length, -spreadRad / 2, spreadRad / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, light.radius);
        const rgba = rgbToRGBA(light.color, light.alpha * light.intensity);
        grad.addColorStop(0, rgba);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, light.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();
  });

  ctx.restore();
}


// Helper: convert hex color + alpha to rgba string
function hexToRGBA(hex, alpha) {
  // Remove #
  hex = hex.replace('#', '');
  // Parse r,g,b
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r},${g},${b},${alpha})`;
}



//drag

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const screenX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const screenY = (e.clientY - rect.top) * (canvas.height / rect.height);

  const mousePos = getMousePos(canvas, e);
  draggingObject = null;
  draggingCamera = false;

  // Try to pick object
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (isPointInObject(mousePos, obj)) {
      draggingObject = obj;
      dragOffset.x = mousePos.x - obj.position.x;
      dragOffset.y = mousePos.y - obj.position.y;
      break;
    }
  }

  if (!draggingObject) {
    draggingCamera = true;
    dragStart.x = screenX;
    dragStart.y = screenY;
  }
});


canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const screenX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const screenY = (e.clientY - rect.top) * (canvas.height / rect.height);

  const mousePos = getMousePos(canvas, e);

  if (draggingObject) {
    draggingObject.position.x = mousePos.x - dragOffset.x;
    draggingObject.position.y = mousePos.y - dragOffset.y;
    drawObjects();
  } else if (draggingCamera) {
    cameraOffset.x += screenX - dragStart.x;
    cameraOffset.y += screenY - dragStart.y;
    dragStart.x = screenX;
    dragStart.y = screenY;
    drawObjects();
  }
});


canvas.addEventListener("mouseup", () => {
  draggingObject = null;
  draggingCamera = false;
});

canvas.addEventListener("mouseleave", () => {
  draggingObject = null;
  draggingCamera = false;
});



// Helper to get mouse position relative to canvas
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const canvasX = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const canvasY = (evt.clientY - rect.top) * (canvas.height / rect.height);

  // Convert to world coordinates using cameraOffset
  return {
    x: canvasX - cameraOffset.x,
    y: canvasY - cameraOffset.y
  };
}


// Check if point is inside object, considering rotation
function isPointInObject(point, obj) {
  // Translate point to object local space
  const dx = point.x - obj.position.x;
  const dy = point.y - obj.position.y;

  // Reverse rotate point by -obj.angle
  const cos = Math.cos(-obj.angle);
  const sin = Math.sin(-obj.angle);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  switch(obj.type) {
    case "box":
      return (
        localX >= -obj.size.w/2 && localX <= obj.size.w/2 &&
        localY >= -obj.size.h/2 && localY <= obj.size.h/2
      );
    case "circle":
      return localX * localX + localY * localY <= obj.radius * obj.radius;
    case "triangle":
      // Approximate point-in-triangle test
      return pointInTriangle(
        {x: localX, y: localY},
        {x: 0, y: -obj.size.h/2},
        {x: obj.size.w/2, y: obj.size.h/2},
        {x: -obj.size.w/2, y: obj.size.h/2}
      );
    default:
      return false;
  }
}

// Helper function for point-in-triangle test (using barycentric coordinates)
function pointInTriangle(p, p0, p1, p2) {
  const A = 1/2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
  const sign = A < 0 ? -1 : 1;
  const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
  const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
  return s >= 0 && t >= 0 && (s + t) <= 2 * A * sign;
}




//edit

let editMode = false;
let editingObjectIndex = null;

const editToggleBtn = document.getElementById("edit-toggle-btn");
const updateObjectBtn = document.getElementById("update-object-btn");
const form = document.getElementById("level-form");

// Toggle edit mode on/off
editToggleBtn.addEventListener("click", () => {
  editMode = !editMode;
  editToggleBtn.textContent = editMode ? "Exit Edit Mode" : "Edit Object";

  // When entering edit mode disable dragging
  draggingObject = null;
  updateObjectBtn.disabled = !editMode;

  if (!editMode) {
    // Clear selection and form when exiting edit mode
    editingObjectIndex = null;
    form.reset();
  }
});

// On canvas click in edit mode, load object data into form
canvas.addEventListener("click", (e) => {
  if (!editMode) return;

  const mousePos = getMousePos(canvas, e);

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (isPointInObject(mousePos, obj)) {
      editingObjectIndex = i;
      loadObjectToForm(obj);
      break;
    }
  }
});

// Load selected object's data into the form fields
function loadObjectToForm(obj) {
  form.elements["type"].value = obj.type || "";
  form.elements["width"].value = obj.size.w || 0;
  form.elements["height"].value = obj.size.h || 0;
  form.elements["density"].value = obj.density || 0;
  form.elements["bounciness"].value = obj.bounciness || 0;
  form.elements["linearDampingX"].value = obj.linearDamping.x || 0;
  form.elements["linearDampingY"].value = obj.linearDamping.y || 0;
  form.elements["angularDamping"].value = obj.angularDamping || 0;
  form.elements["staticFriction"].value = obj.staticFriction || 0;
  form.elements["dynamicFriction"].value = obj.dynamicFriction || 0;
  form.elements["isStatic"].checked = obj.isStatic || false;
  form.elements["hasRotations"].checked = obj.hasRotations || false;
  form.elements["isEntity"].checked = obj.isEntity || false;
  form.elements["hasBody"].checked = obj.hasBody || false;
  form.elements["isPlayer"].checked = obj.isPlayer || false;
  form.elements["angle"].value = obj.angle || 0;
  form.elements["radius"].value = obj.radius || 0;
  form.elements["hasGravity"].checked = obj.hasGravity || false;
  form.elements["color"].value = rgbToHex(obj.color || {r:0,g:0,b:0});
  form.elements["alpha"].value = obj.alpha || 1;

  // Clear lights container then add lights from object
  const lightsContainer = document.getElementById("lights-container");
  lightsContainer.innerHTML = "";  // clear existing

  obj.lights.forEach((light, index) => {
    // Create light block div like your add-light-btn code
    const lightDiv = document.createElement("div");
    lightDiv.className = "light-block";
    lightDiv.innerHTML = `
        <hr />
        <strong>Light ${index + 1}</strong><br />
        Angle (radians): <input type="number" name="light-angle" step="0.01" value="0" /><br />
        Radius: <input type="number" name="light-radius" step="1" value="100" /><br />
        Spread: <input type="number" name="light-spread" step="1" value="0.78" /><br />
        Length: <input type="number" name="light-length" step="1" value="100" /><br />
        Intensity: <input type="number" name="light-intensity" step="0.1" value="1" /><br />
        Color: <input type="color" name="light-color" value="#ffffff" /><br />
        Alpha: <input type="number" name="light-alpha" step="0.1" min="0" max="1" value="1" /><br />
        <label><input type="checkbox" name="light-isCircular" checked /> Is Circular</label><br />
        <label><input type="checkbox" name="light-isCone" /> Is Cone</label><br />
        <button type="button" class="remove-light-btn">Remove Light</button>
        `;

    lightsContainer.appendChild(lightDiv);

    const removeBtn = lightDiv.querySelector(".remove-light-btn");
    removeBtn.addEventListener("click", () => {
    lightDiv.remove();
  });
  });
}

// Update the edited object on clicking update button
updateObjectBtn.addEventListener("click", () => {
  if (editingObjectIndex === null) return;

  const obj = objects[editingObjectIndex];

  obj.type = form.elements["type"].value;
  obj.size.w = parseFloat(form.elements["width"].value) || 0;
  obj.size.h = parseFloat(form.elements["height"].value) || 0;
  obj.density = parseFloat(form.elements["density"].value) || 0;
  obj.bounciness = parseFloat(form.elements["bounciness"].value) || 0;
  obj.linearDamping.x = parseFloat(form.elements["linearDampingX"].value) || 0;
  obj.linearDamping.y = parseFloat(form.elements["linearDampingY"].value) || 0;
  obj.angularDamping = parseFloat(form.elements["angularDamping"].value) || 0;
  obj.staticFriction = parseFloat(form.elements["staticFriction"].value) || 0;
  obj.dynamicFriction = parseFloat(form.elements["dynamicFriction"].value) || 0;
  obj.isStatic = form.elements["isStatic"].checked;
  obj.hasRotations = form.elements["hasRotations"].checked;
  obj.angle = parseFloat(form.elements["angle"].value) || 0;
  obj.radius = parseFloat(form.elements["radius"].value) || 0;
  obj.hasGravity = form.elements["hasGravity"].checked;
  obj.color = hexToRgb(form.elements["color"].value || "#000000");
  obj.alpha = parseFloat(form.elements["alpha"].value) || 1;

  // Update lights from form inputs
  obj.lights = [];
  const lightBlocks = document.querySelectorAll("#lights-container .light-block");
  lightBlocks.forEach(lightEl => {
    const inputs = lightEl.querySelectorAll("input");
    const light = {
      angle: parseFloat(inputs[0].value) || 0,
      radius: parseFloat(inputs[1].value) || 0,
      spread: parseFloat(inputs[2].value) || 0,
      length: parseFloat(inputs[3].value) || 0,
      intensity: parseFloat(inputs[4].value) || 0,
      color: hexToRgb(inputs[5].value || "#ffffff"),
      alpha: parseFloat(inputs[6].value) || 1,
      isCircular: inputs[7].checked,
      isCone: inputs[8].checked
    };
    obj.lights.push(light);
  });

  drawObjects();
  alert("Object updated!");
});




//remove
let removeMode = false;
const removeObjectBtn = document.getElementById("remove-object-btn");

// Toggle remove mode on/off
removeObjectBtn.addEventListener("click", () => {
  removeMode = !removeMode;
  removeObjectBtn.textContent = removeMode ? "Exit Remove Mode" : "Remove Object";

  if (removeMode) {
    // Disable edit mode if remove mode is on
    editMode = false;
    editToggleBtn.textContent = "Edit Object";
    updateObjectBtn.disabled = true;
    editingObjectIndex = null;
    form.reset();
  }
});

// On canvas click in remove mode, remove object
canvas.addEventListener("click", (e) => {
  if (!removeMode) return;

  const mousePos = getMousePos(canvas, e);

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (isPointInObject(mousePos, obj)) {
      objects.splice(i, 1); // remove object from array
      drawObjects();
      break; // only remove one object per click
    }
  }
});



//exporting

document.getElementById("export-json-btn").addEventListener("click", () => {
  const exportDiv = document.getElementById("export-output");

  // Convert objects array to formatted JSON string
  const jsonStr = JSON.stringify(objects, null, 2);

  // Show JSON string inside the div
  exportDiv.textContent = jsonStr;
});



//importing 
document.getElementById("import-json-btn").addEventListener("click", () => {
  const input = document.getElementById("import-input").value;

  try {
    const imported = JSON.parse(input);

    // Clear and replace the contents of the existing array
    if (Array.isArray(imported)) {
      objects.length = 0;
      objects.push(...imported);
    } else if (imported.objects && Array.isArray(imported.objects)) {
      objects.length = 0;
      objects.push(...imported.objects);
    } else {
      alert("Invalid format. Expected an array or an object with an 'objects' array.");
      return;
    }

    // Reset UI
    document.getElementById("level-form").reset();
    document.getElementById("lights-container").innerHTML = "";
    editMode = false;
    editingObjectIndex = null;
    draggingObject = null;
    draggingCamera = false;

    // Redraw canvas
    drawObjects();

    alert("Level imported successfully.");
  } catch (err) {
    alert("Invalid JSON:\n" + err.message);
  }

  console.log("Objects after import:", objects);

});
