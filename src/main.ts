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

// Force drawing buffer size to match display === The fact that I have to do this is really annoying.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

if (ctx) {
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 10; // magic number 10 is just to get it to the mouse pointer tip
    const y = e.clientY - rect.top - 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 10; // magic number 10 is just to get it to the mouse pointer tip
      const y = e.clientY - rect.top - 10;

      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, 150, 100);
}
