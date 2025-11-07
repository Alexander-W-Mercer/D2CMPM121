import "./style.css";

const h1 = document.createElement("h1");
h1.textContent = "Sticker Sketchpad";

const canvas = document.createElement("canvas");
canvas.style.width = "256px";
canvas.style.height = "256px";
canvas.id = "sketch_canvas";
canvas.style.display = "block";

const undoButton = document.createElement("button");
undoButton.id = "undo";
undoButton.textContent = "Undo";

document.body.append(h1);
document.body.append(canvas);
document.body.append(undoButton);

const ctx = canvas.getContext("2d");
if (ctx) {
  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, 150, 100);
}
