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
clearButton.className = "fancy-button"; // applies the style

const undoButton = document.createElement("button");
undoButton.id = "undo";
undoButton.textContent = "Undo";
undoButton.className = "fancy-button"; // applies the style

const redoButton = document.createElement("button");
redoButton.id = "redo";
redoButton.textContent = "Redo";
redoButton.className = "fancy-button"; // applies the style

const exportButton = document.createElement("button");
exportButton.id = "export";
exportButton.textContent = "Export";
exportButton.className = "fancy-button"; // applies the style

const customStickerButton = document.createElement("button");
customStickerButton.id = "customSticker";
customStickerButton.textContent = "Custom Sticker";
customStickerButton.className = "fancy-button"; // applies the style

//--------------------
// Create sizeSlider container
const container = document.createElement("div");
container.style.margin = "20px";

// Create label
const sizeLabel = document.createElement("label");
sizeLabel.textContent = "Brush Size: ";
sizeLabel.htmlFor = "size-sizeSlider";

// Create lable for rotation slider
const angleLabel = document.createElement("label");
angleLabel.textContent = "Rotation: ";
angleLabel.htmlFor = "angle-angleSlider";

// Create span to show value
const sizeDisplay = document.createElement("span");
sizeDisplay.id = "value-display";
sizeDisplay.textContent = "5";

// Create span to show value
const rotateDisplay = document.createElement("span");
rotateDisplay.id = "rotate-display";
rotateDisplay.textContent = "0";

// Create the sizeSlider input
const sizeSlider = document.createElement("input");
sizeSlider.type = "range";
sizeSlider.id = "size-sizeSlider";
sizeSlider.min = "1";
sizeSlider.max = "50";
sizeSlider.value = "5";
sizeSlider.step = "1";
sizeSlider.style.width = "200px";

// Create the sizeSlider input
const angleSlider = document.createElement("input");
angleSlider.type = "range";
angleSlider.id = "angle-angleSlider";
angleSlider.min = "0";
angleSlider.max = "360";
angleSlider.value = "0";
angleSlider.step = "0";
angleSlider.style.width = "360px";

// Update display when sizeSlider changes
sizeSlider.addEventListener("input", () => {
  sizeDisplay.textContent = sizeSlider.value;
});

angleSlider.addEventListener("input", () => {
  rotateDisplay.textContent = angleSlider.value;
});

// Append everything to the container
container.appendChild(sizeLabel);
container.appendChild(sizeDisplay);
container.appendChild(document.createTextNode("px"));
container.appendChild(document.createElement("br"));
container.appendChild(sizeSlider);
container.appendChild(document.createElement("br"));
container.appendChild(angleLabel);
container.appendChild(rotateDisplay);
container.appendChild(document.createTextNode("°"));
container.appendChild(document.createElement("br"));
container.appendChild(angleSlider);

//--------------------

document.body.append(h1);
document.body.append(canvas);
document.body.appendChild(container);
document.body.append(clearButton);
document.body.append(undoButton);
document.body.append(redoButton);
document.body.append(customStickerButton);
document.body.append(exportButton);

canvas.style.cursor = "crosshair";

const stickerRow = document.createElement("div");
document.body.appendChild(stickerRow);

interface Sticker {
  id: string;
  name: string;
}

const stickers: Sticker[] = [
  {
    id: "joytears",
    name: "😂",
  },
  {
    id: "heart",
    name: "❤️",
  },
  {
    id: "rollinglaugh",
    name: "🤣",
  },
  {
    id: "crying",
    name: "😭",
  },
  {
    id: "thumb",
    name: "👍",
  },
  {
    id: "skull",
    name: "💀",
  },
];

for (const sticker of stickers) {
  addStickerButton(sticker);
}

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
let drawToolActive = "draw";

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

class StickerToolPreview implements Drawable {
  constructor(
    public x: number,
    public y: number,
    public size: number,
    public emoji: string,
    public angle: number = 0,
  ) {}

  drag(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.font = `${this.size}px serif`;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.fillText(this.emoji, -this.size / 2, this.size / 2);
    ctx.restore();
  }
}

// Force drawing buffer size to match display === The fact that I have to do this is somewhat annoying. Strange.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function addStickerButton(sticker: Sticker) {
  const element = document.createElement("button");
  element.id = sticker.id;
  element.innerHTML = `${sticker.name}`;
  document.body.appendChild(element);
  element.className = "fancy-button"; // applies the style

  element.addEventListener("click", () => {
    if (element.style.backgroundColor !== "gray") {
      for (const button of stickers) {
        document.getElementById(button.id)!.style.backgroundColor = "";
      }
      element.style.backgroundColor = "gray";
      drawToolActive = sticker.name;
    } else {
      element.style.backgroundColor = "";
      drawToolActive = "draw";
    }
    canvas.dispatchEvent(new Event("toolMoved"));
  });
}

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
  if (drawToolActive == "draw") {
    commandList.push(
      new LineSegment(
        e.clientX - rect.left - 10,
        e.clientY - rect.top - 10,
        +sizeSlider.value,
      ),
    );
  } else {
    commandList.push(
      new StickerToolPreview(
        e.clientX - rect.left - 10,
        e.clientY - rect.top - 10,
        +sizeSlider.value * 2,
        drawToolActive,
        +angleSlider.value,
      ),
    );
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (drawToolActive == "draw") {
    toolCommand = new DrawToolPreview(
      e.clientX - canvas.getBoundingClientRect().left - 10,
      e.clientY - canvas.getBoundingClientRect().top - 10,
      +sizeSlider.value / 2,
    );
  } else {
    toolCommand = new StickerToolPreview(
      e.clientX - canvas.getBoundingClientRect().left - 10,
      e.clientY - canvas.getBoundingClientRect().top - 10,
      +sizeSlider.value * 2,
      drawToolActive,
      +angleSlider.value,
    );
  }
  canvas.dispatchEvent(new Event("toolMoved"));

  if (isDrawing) {
    const rect = canvas.getBoundingClientRect();

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

////////////////////////////////////////////////////////////////////////////////////Mobile specific touch handling:

canvas.addEventListener("touchstart", (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  if (drawToolActive == "draw") {
    commandList.push(
      new LineSegment(
        e.touches[0]!.clientX - rect.left - 10,
        e.touches[0]!.clientY - rect.top - 10,
        +sizeSlider.value,
      ),
    );
  } else {
    commandList.push(
      new StickerToolPreview(
        e.touches[0]!.clientX - rect.left - 10,
        e.touches[0]!.clientY - rect.top - 10,
        +sizeSlider.value * 2,
        drawToolActive,
        +angleSlider.value,
      ),
    );
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (drawToolActive == "draw") {
    toolCommand = new DrawToolPreview(
      e.touches[0]!.clientX - canvas.getBoundingClientRect().left - 10,
      e.touches[0]!.clientY - canvas.getBoundingClientRect().top - 10,
      +sizeSlider.value / 2,
    );
  } else {
    toolCommand = new StickerToolPreview(
      e.touches[0]!.clientX - canvas.getBoundingClientRect().left - 10,
      e.touches[0]!.clientY - canvas.getBoundingClientRect().top - 10,
      +sizeSlider.value * 2,
      drawToolActive,
      +angleSlider.value,
    );
  }
  canvas.dispatchEvent(new Event("toolMoved"));

  if (isDrawing) {
    const rect = canvas.getBoundingClientRect();

    commandList[commandList.length - 1]!.drag(
      e.touches[0]!.clientX - rect.left - 10,
      e.touches[0]!.clientY - rect.top - 10,
    ); //draw connecting line

    drawingChanged();
  }
});

canvas.addEventListener("touchend", () => {
  if (isDrawing == true) {
    isDrawing = false;
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

customStickerButton.addEventListener("click", () => {
  const text = prompt("Custom sticker text", "🧽");

  if (text !== null) {
    stickers.push(
      {
        id: text,
        name: text,
      },
    );
    addStickerButton(
      {
        id: text,
        name: text,
      },
    );
  } else {
    console.log("User cancelled the prompt.");
  }
});

exportButton.addEventListener("click", () => {
  const canvasExp = document.createElement("canvas");
  canvasExp.style.width = "1024px";
  canvasExp.style.height = "1024px";
  canvasExp.id = "sketch_canvas";
  canvasExp.style.display = "block";
  document.body.append(canvasExp);

  canvasExp.width = canvasExp.clientWidth;
  canvasExp.height = canvasExp.clientHeight;

  const ctx2 = canvasExp.getContext("2d")!;

  ctx2.scale(4, 4); // Scale drawing to 4x for higher resolution

  for (let i = 0; i <= commandList.length - 1; i++) {
    commandList[i]!.display(ctx2);
  }

  const dataURL = canvasExp.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "sticker_sketchpad_drawing.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  document.body.removeChild(canvasExp);
});
