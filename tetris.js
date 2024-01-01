const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const blocks = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [2, 2, 2],
    [0, 2, 0],
  ],
  [
    [3, 3, 0],
    [0, 3, 3],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [5, 5, 5],
    [5, 0, 0],
  ],
  [
    [6, 6, 6],
    [0, 0, 6],
  ],
  [[7, 7, 7, 7]],
];

const blockColors = [
  "#FFFF00",
  "#800080",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFA500",
  "#00FFFF",
];

const column = 14;
const row = 21;

const grid = [];
const gridPreview = [];
const gridScore = [];

let score = 0;

let cAxis = column / 2 - 2;
let rAxis = 1;

let blockList = [];

for (let c = 0; c < column; c++) {
  grid[c] = [];
  gridScore[c] = [];
  for (let r = 0; r < row; r++) {
    grid[c][r] = 0;
    gridScore[c][r] = -8;
  }
}

for (let c = 1; c < column - 3; c++) {
  for (let r = 0; r < row - 1; r++) {
    gridScore[c][r] = 0;
  }
}

for (let c = 0; c < 4; c++) {
  gridPreview[c] = [];
  for (let r = 0; r < 4; r++) {
    gridPreview[c][r] = 0;
  }
}

for (let i = 0; i < 2; i++) {
  blockList[i] = getRandomBlockIndex();
}

document.addEventListener("keydown", keydownHandler);
document.addEventListener("click", clickHandler);

function clickHandler(e) {
  if (e.target.id == 1) {
    if (!checkWallLeft()) {
      moveLeft();
    }
  }

  if (e.target.id == 2) {
    if (!checkWallRight()) {
      moveRight();
    }
  }

  if (e.target.id == 3) {
    rotateBlock();
  }

  if (e.target.id == 4) {
    while (!checkGround()) {
      dropBlock();
    }
    collisionDetection();
  }
}

function keydownHandler(e) {
  if (e.keyCode == 37) {
    if (!checkWallLeft()) {
      moveLeft();
    }
  }

  if (e.keyCode == 39) {
    if (!checkWallRight()) {
      moveRight();
    }
  }

  if (e.keyCode == 38) {
    rotateBlock();
  }

  if (e.keyCode == 32) {
    while (!checkGround()) {
      dropBlock();
    }
    collisionDetection();
  }
}

function getRandomBlockIndex() {
  return Math.floor(Math.random() * blocks.length);
}

function getBlockList() {
  blockList.shift();
  blockList.push(getRandomBlockIndex());
}

function drawBlock(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      grid[column / 2 - 2 + i][j] = block[i][j];
    }
  }
}

function drawNextBlock(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      gridPreview[i][j] = block[i][j];
    }
  }
}

function createBlock() {
  const index = blockList[0];
  drawBlock(blocks[index]);

  const nextIndex = blockList[1];
  drawNextBlock(blocks[nextIndex]);
}

function dropBlock() {
  collisionDetection();
  moveDown();
}

function checkWallLeft() {
  let checked = false;

  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c - 1][r] < 0) {
        checked = true;
        break;
      }
    }
  }
  return checked;
}

function checkWallRight() {
  let checked = false;

  for (let c = column - 3; c > 0; c--) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c + 1][r] < 0) {
        checked = true;
        break;
      }
    }
  }
  return checked;
}

function checkGround() {
  let checked = false;
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c][r + 1] < 0) {
        checked = true;
        break;
      }
    }
  }
  return checked;
}

function moveLeft() {
  const newLine = [];
  for (let r = 0; r < row; r++) {
    newLine[r] = 0;
  }

  grid.push(newLine);
  grid.shift();
  for (let r = 0; r < row - 1; r++) {
    if (gridScore[cAxis - 1][r] >= 0) {
      cAxis--;
      break;
    }
  }
}

function moveRight() {
  const newLine = [];
  for (let r = 0; r < row; r++) {
    newLine[r] = 0;
  }

  grid.unshift(newLine);
  grid.pop();

  cAxis++;
}

function moveDown() {
  for (let c = 0; c < column; c++) {
    grid[c].unshift(0);
    grid[c].pop();
  }
  rAxis++;
}

function moveUp() {
  for (let c = 0; c < column; c++) {
    grid[c].push(0);
    grid[c].shift();
  }
  rAxis--;
}

function landBlock() {
  let negativeGrid = [];
  for (let c = 0; c < column; c++) {
    negativeGrid[c] = [];
    for (let r = 0; r < row; r++) {
      negativeGrid[c][r] = 0;
    }
  }

  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row - 1; r++) {
      negativeGrid[c][r] = grid[c][r] * -1;
    }
  }

  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row - 1; r++) {
      if (gridScore[c][r] === 0) {
        gridScore[c][r] = negativeGrid[c][r];
      }
    }
  }
}

function rotateBlock() {
  let arrayLength = 0;
  let currentBlockIndex = blockList[0] + 1;

  if (currentBlockIndex == 7) {
    arrayLength = 4;
  } else if (currentBlockIndex != 1) {
    arrayLength = 3;
  } else {
    return;
  }

  const gridTemp = [];
  for (let c = 0; c < arrayLength; c++) {
    gridTemp[c] = [];
    for (let r = 0; r < arrayLength; r++) {
      gridTemp[c][r] = 0;
    }
  }

  let ct = arrayLength - 1;
  for (let r = 0; r < arrayLength; r++) {
    let rt = arrayLength - 1;
    for (let c = arrayLength - 1; c >= 0; c--) {
      gridTemp[ct][rt] = grid[cAxis - 1 + c][rAxis - 1 + r];
      rt--;
    }
    ct--;
  }

  rotate(gridTemp, arrayLength);
}

function rotate(gridTemp, arrayLength) {
  let complete = true;
  for (let c = 0; c < arrayLength; c++) {
    for (let r = 0; r < arrayLength; r++) {
      if (gridTemp[c][r] > 0 && gridScore[cAxis - 1 + c][rAxis - 1 + r]) {
        if (c <= 1) {
          moveRight();
        } else if (c >= 2) {
          moveLeft();
        }
        if (r >= 2) {
          moveUp();
        }
        complete = false;
      }
    }
  }

  if (complete) {
    for (let c = 0; c < arrayLength; c++) {
      for (let r = 0; r < arrayLength; r++) {
        grid[cAxis - 1 + c][rAxis - 1 + r] = gridTemp[c][r];
      }
    }
  } else {
    rotate(gridTemp, arrayLength);
  }
}

function collisionDetection() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c][r + 1] < 0) {
        landBlock();
        calculateScore();
        gridReset();
        getBlockList();
        createBlock();

        cAxis = column / 2 - 2;
        rAxis = 1;
      }
    }
  }
}

function gridReset() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      grid[c][r] = 0;
    }
  }

  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      gridPreview[c][r] = 0;
    }
  }
}

function calculateScore() {
  let hit = false;
  let hitrow = 0;

  for (let r = 0; r < row - 1; r++) {
    for (let c = 1; c < column - 3; c++) {
      if (gridScore[c][r] >= 0) {
        break;
      }
      if (c >= column - 4) {
        hit = true;
        hitrow = r;
      }
    }
  }

  if (hit) {
    for (let c = 1; c < column - 3; c++) {
      gridScore[c].splice(hitrow, 1);
      gridScore[c].unshift(0);
    }
    calculateScore();
    score++;
  }
}

function drawMatrix() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      const g = grid[c][r];
      ctx.font = "16px Arial";
      ctx.fillStyle = "#0099DD";
      ctx.fillText(g, c * 20 + column / 2, r * 20 + row - 5);

      const gs = gridScore[c][r];
      ctx.font = "16px Arial";
      ctx.fillStyle = "#FF4000";
      ctx.fillText(gs, c * 20 + column / 2, r * 20 + row - 5);
    }
  }

  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      const gp = gridPreview[c][r];
      ctx.font = "16px Arial";
      ctx.fillStyle = "#01DF01";
      ctx.fillText(gp, c * 20 + column / 2, r * 20 + row - 5);
    }
  }
}

function drawGrid() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      const g = grid[c][r];
      if (g > 0) {
        ctx.beginPath();
        ctx.rect(c * 20 - 20, r * 20, 20, 20);
        ctx.fillStyle = blockColors[blockList[0]];
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row - 1; r++) {
      const gs = gridScore[c][r];
      if (gs < 0) {
        ctx.beginPath();
        ctx.rect(c * 20 - 20, r * 20, 20, 20);
        ctx.fillStyle = blockColors[Math.abs(gs) - 1];
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.beginPath();
  ctx.strokeRect(135, 0, 65, 20);
  ctx.closePath();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Score: " + score, 137, 15);
}

function drawPreview() {
  ctx.beginPath();
  ctx.rect(0, 0, 60, 60);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      const gp = gridPreview[c][r];
      if (gp > 0) {
        ctx.beginPath();
        ctx.rect(c * 12.5 + 20, r * 12.5 + 10, 12.5, 12.5);
        ctx.fillStyle = blockColors[blockList[1]];
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

function checkGameover() {
  for (let c = 1; c < column - 3; c++) {
    if (gridScore[c][4] != 0) {
      alert("Game Over");
      gameReset();
    }
  }
}

function gameReset() {
  score = 0;
  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row - 1; r++) {
      gridScore[c][r] = 0;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // drawMatrix();
  drawPreview();
  drawScore();
  drawGrid();

  checkGameover();

  requestAnimationFrame(draw);
}

createBlock();
setInterval(dropBlock, 1000);
draw();
