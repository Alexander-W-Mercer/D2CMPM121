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

const ctx = canvas.getContext("2d")!;
let isDrawing = false;

interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}

const commandList: Drawable[] = [];
let segmentsDrawn = 0;
const undoHolder: Drawable[] = [];

let toolCommand: Drawable | null = null;

class LineSegment implements Drawable {
  startingP: number[];
  points: number[][];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.startingP = [x, y];
    segmentsDrawn++;
    this.points = [];
    this.thickness = thickness;
  }

  drag(x: number, y: number): void {
    this.points.push([x, y]);
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath(); // Start a new path
    ctx.lineCap = "round";

    // Move to the first point without drawing
    ctx.moveTo(
      this.startingP[0]!,
      this.startingP[1]!,
    );

    for (let i = 0; i < this.points.length; i++) {
      ctx.lineTo(
        this.points[i]![0]!,
        this.points[i]![1]!,
      );
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;

    ctx.stroke(); // Render the line
  }
}

class DrawToolPreview implements Drawable {
  constructor(public x: number, public y: number, public radius: number) {}

  drag(): void {
    console.log("Do nothing - preview only");
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath(); // Start a new path
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); // Create a full circle arc
    ctx.fill(); // Fill the circle with the fillStyle
  }
}

// Force drawing buffer size to match display === The fact that I have to do this is really annoying.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function drawingChanged() {
  canvas.dispatchEvent(new Event("drawingChanged"));
}

canvas.addEventListener("drawingChanged", onDisplayNeedsRefresh);
canvas.addEventListener("toolMoved", onDisplayNeedsRefresh);

function onDisplayNeedsRefresh() {
  if (commandList) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= commandList.length - 1; i++) {
      commandList[i]!.display(ctx);
    }
  }
  if (toolCommand) {
    toolCommand.display(ctx);
  }
}

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  commandList.push(
    new LineSegment(
      e.clientX - rect.left - 10,
      e.clientY - rect.top - 10,
      +slider.value,
    ),
  );
});

canvas.addEventListener("mousemove", (e) => {
  toolCommand = new DrawToolPreview(
    e.clientX - canvas.getBoundingClientRect().left - 10,
    e.clientY - canvas.getBoundingClientRect().top - 10,
    +slider.value / 2,
  );
  canvas.dispatchEvent(new Event("toolMoved"));

  if (isDrawing) {
    const rect = canvas.getBoundingClientRect();

    console.log(commandList);
    commandList[commandList.length - 1]!.drag(
      e.clientX - rect.left - 10,
      e.clientY - rect.top - 10,
    ); //draw connecting line

    drawingChanged();
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing == true) {
    isDrawing = false;
  }
});

canvas.addEventListener("mouseleave", () => {
  toolCommand = null;
  canvas.dispatchEvent(new Event("toolMoved"));

  if (isDrawing == true) {
    isDrawing = false;
  }
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commandList.length = 0;
  segmentsDrawn = 0;
  undoHolder.length = 0;
});

undoButton.addEventListener("click", () => {
  if (commandList[0]) {
    undoHolder.push(commandList.pop()!);
    segmentsDrawn--;
    drawingChanged();
  } else {
    console.log("Nothing left to undo");
  }
});

redoButton.addEventListener("click", () => {
  if (undoHolder[0]) {
    commandList.push(undoHolder.pop()!);
    segmentsDrawn++;
    drawingChanged();
  } else {
    console.log("Nothing left to redo");
  }
});
