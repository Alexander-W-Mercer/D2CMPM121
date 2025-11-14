import "./style.css";

const h1 = document.createElement("h1");
h1.textContent = "Sticker Sketchpad";

const canvas = document.createElement("canvas");
canvas.style.width = "256px";
canvas.style.height = "256px";
canvas.id = "sketch_canvas";
canvas.style.display = "block";

const clearButton = document.createElement("button");
clearButton.id = "clear";
clearButton.textContent = "Clear";

const undoButton = document.createElement("button");
undoButton.id = "undo";
undoButton.textContent = "Undo";

const redoButton = document.createElement("button");
redoButton.id = "redo";
redoButton.textContent = "Redo";

//--------------------
// Create slider container
const container = document.createElement("div");
container.style.margin = "20px";

// Create label
const label = document.createElement("label");
label.textContent = "Brush Size: ";
label.htmlFor = "size-slider";

// Create span to show value
const valueDisplay = document.createElement("span");
valueDisplay.id = "value-display";
valueDisplay.textContent = "5";

// Create the slider input
const slider = document.createElement("input");
slider.type = "range";
slider.id = "size-slider";
slider.min = "1";
slider.max = "50";
slider.value = "5";
slider.step = "1";
slider.style.width = "200px";

// Update display when slider changes
slider.addEventListener("input", () => {
  valueDisplay.textContent = slider.value;
});

// Append everything to the container
container.appendChild(label);
container.appendChild(valueDisplay);
container.appendChild(document.createTextNode("px"));
container.appendChild(document.createElement("br"));
container.appendChild(slider);

//--------------------

document.body.append(h1);
document.body.append(canvas);
document.body.appendChild(container);
document.body.append(clearButton);
document.body.append(undoButton);
document.body.append(redoButton);

const ctx = canvas.getContext("2d");
let isDrawing = false;

const drawnPoints: number[][][] = [];
let segmentsDrawn = 0;
const undoHolder: number[][][] = [];

//interface drawnLines {
//  points: number[][];
//}

// Force drawing buffer size to match display === The fact that I have to do this is really annoying.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function drawingChanged() {
  if (ctx && drawnPoints) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= segmentsDrawn - 1; i++) {
      ctx.beginPath(); // Start a new path

      // Move to the first point without drawing
      if (drawnPoints.length > 0) {
        ctx.moveTo(
          drawnPoints[i]![0]![0]!,
          drawnPoints[i]![0]![1]!,
        );
      }

      // Iterate through the remaining points and draw lines to them
      for (let j = 0; j < drawnPoints[i]!.length; j++) {
        ctx.lineTo(
          drawnPoints[i]![j]![0]!,
          drawnPoints[i]![j]![1]!,
        );
      }

      ctx.strokeStyle = "black";
      ctx.lineWidth = +slider.value;

      ctx.stroke(); // Render the line
    }
  }
}

if (ctx) {
  canvas.addEventListener("mousedown", (e) => {
    if (!drawnPoints[segmentsDrawn]) {
      drawnPoints.push([]);
    }
    isDrawing = true;
    segmentsDrawn++;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 10; // magic number 10 is just to get it to the mouse pointer tip
    const y = e.clientY - rect.top - 10;
    drawnPoints[segmentsDrawn - 1]!.push([x, y]);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 10; // magic number 10 is just to get it to the mouse pointer tip
      const y = e.clientY - rect.top - 10;

      drawnPoints[segmentsDrawn - 1]!.push([x, y]);

      drawingChanged();
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (isDrawing == true) {
      isDrawing = false;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (isDrawing == true) {
      isDrawing = false;
    }
  });

  clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnPoints.length = 0;
    segmentsDrawn = 0;
    undoHolder.length = 0;
  });

  undoButton.addEventListener("click", () => {
    if (drawnPoints[0]) {
      undoHolder.push(drawnPoints.pop()!);
      segmentsDrawn--;
      drawingChanged();
    } else {
      console.log("Nothing left to undo");
    }
  });

  redoButton.addEventListener("click", () => {
    if (undoHolder[0]) {
      drawnPoints.push(undoHolder.pop()!);
      segmentsDrawn++;
      drawingChanged();
    } else {
      console.log("Nothing left to redo");
    }
  });

  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, 150, 100);
}
