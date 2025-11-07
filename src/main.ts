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
if (ctx) {
  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, 150, 100);
}
