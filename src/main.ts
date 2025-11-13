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

document.body.append(h1);
document.body.append(canvas);
document.body.append(clearButton);

const ctx = canvas.getContext("2d");
let isDrawing = false;

const drawnPoints: number[][] = [];

// Force drawing buffer size to match display === The fact that I have to do this is really annoying.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function drawingChanged() {
  if (ctx && drawnPoints) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath(); // Start a new path

    // Move to the first point without drawing
    if (drawnPoints.length > 0) {
      ctx.moveTo(drawnPoints[0]![0]!, drawnPoints[0]![1]!);
    }

    // Iterate through the remaining points and draw lines to them
    for (let i = 1; i < drawnPoints.length; i++) {
      ctx.lineTo(drawnPoints[i]![0]!, drawnPoints[i]![1]!);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.stroke(); // Render the line
  }
}

if (ctx) {
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 10; // magic number 10 is just to get it to the mouse pointer tip
    const y = e.clientY - rect.top - 10;
    drawnPoints.push([x, y]);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 10; // magic number 10 is just to get it to the mouse pointer tip
      const y = e.clientY - rect.top - 10;
      drawnPoints.push([x, y]);

      console.log(drawnPoints);

      drawingChanged();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    drawnPoints.push([-1, -1]);
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnPoints.length = 0;
    drawnPoints.push([-1, -1]);
  });

  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, 150, 100);
}
