const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

document.addEventListener("keydown", keydownHandler);
document.addEventListener("click", clickHandler);

const column = 12;
const row = 21;

let score = 0;

let xAxis = column / 2 - 1;
let yAxis = 1;

// 내려오는 블록 배열
const grid = [];
for (let c = 0; c < column; c++) {
  grid[c] = [];
  for (let r = 0; r < row; r++) {
    grid[c][r] = 0;
  }
}

// 미리보기 블록 배열
const gridPreview = [];
for (let c = 0; c < 4; c++) {
  gridPreview[c] = [];
  for (let r = 0; r < 4; r++) {
    gridPreview[c][r] = 0;
  }
}

// 벽, 바닥 그리고 쌓이는 블록 배열
const gridScore = [];
for (let c = 0; c < column; c++) {
  gridScore[c] = [];
  for (let r = 0; r < row; r++) {
    gridScore[c][r] = -8;
  }
}

// 벽과 바닥 만들기
for (let c = 1; c < column - 1; c++) {
  for (let r = 0; r < row - 1; r++) {
    gridScore[c][r] = 0;
  }
}

// 블록들
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
  [
    [7, 7, 7, 7],
    [0, 0, 0, 0],
  ],
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

// 블록 리스트
let blockList = [];
for (let i = 0; i < 2; i++) {
  blockList[i] = getRandomBlockIndex();
}

//#region 핸들러
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
    const currentBlockIndex = blockList[0] + 1;
    if (currentBlockIndex == 7) {
      rotateBlockI();
    } else if (currentBlockIndex != 1) {
      rotateBlock();
    }
  }

  if (e.target.id == 4) {
    while (!checkGround()) {
      drop();
    }
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
    const currentBlockIndex = blockList[0] + 1;
    if (currentBlockIndex == 7) {
      rotateBlockI();
    } else if (currentBlockIndex != 1) {
      rotateBlock();
    }
  }

  if (e.keyCode == 32) {
    while (!checkGround()) {
      drop();
    }
  }
}
//#endregion

//#region 블록 생성 로직
function drawBlock(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      grid[column / 2 - 1 + i][j] = block[i][j];
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

function getRandomBlockIndex() {
  return Math.floor(Math.random() * blocks.length);
}

function getBlockList() {
  blockList.shift();
  blockList.push(getRandomBlockIndex());
}

function createBlock() {
  const index = blockList[0];
  drawBlock(blocks[index]);

  const nextIndex = blockList[1];
  drawNextBlock(blocks[nextIndex]);
}
//#endregion

//#region 블록 이동 로직
function drop() {
  dropBlock();
}

function dropBlock() {
  for (let c = 0; c < column; c++) {
    grid[c].unshift(0);
    grid[c].pop();
  }

  yAxis++;
}

function checkWallLeft() {
  let checked = false;
  for (let c = 1; c < column - 1; c++) {
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
  for (let c = column - 1; c > 0; c--) {
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
  xAxis--;
}

function moveRight() {
  const newLine = [];
  for (let r = 0; r < row; r++) {
    newLine[r] = 0;
  }

  grid.unshift(newLine);
  grid.pop();
  xAxis++;
}

function blockLand() {
  let negativeGrid = [];
  for (let c = 0; c < column; c++) {
    negativeGrid[c] = [];
    for (let r = 0; r < row; r++) {
      negativeGrid[c][r] = 0;
    }
  }

  for (let c = 1; c < column - 1; c++) {
    for (let r = 0; r < row - 1; r++) {
      negativeGrid[c][r] = grid[c][r] * -1;
    }
  }

  for (let c = 1; c < column - 1; c++) {
    for (let r = 0; r < row - 1; r++) {
      if (gridScore[c][r] === 0) {
        gridScore[c][r] = negativeGrid[c][r];
      }
    }
  }
}

//#region 블록 회전 로직

function rotateBlock() {
  const gridTemp = [];
  for (let c = 0; c < 3; c++) {
    gridTemp[c] = [];
    for (let r = 0; r < 3; r++) {
      gridTemp[c][r] = 0;
    }
  }

  let xt = 2;
  for (let y = 0; y < 3; y++) {
    let yt = 2;
    for (let x = 2; x >= 0; x--) {
      gridTemp[xt][yt] = grid[xAxis + (x - 1)][yAxis + (y - 1)];
      yt--;
    }
    xt--;
  }

  let rotatable = true;

  loop: for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (
        gridTemp[x][y] > 0 &&
        gridScore[xAxis + (x - 1)][yAxis + (y - 1)] < 0
      ) {
        rotatable = false;
        break loop;
      }
    }
  }

  if (rotatable) {
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        grid[xAxis + (x - 1)][yAxis + (y - 1)] = gridTemp[x][y];
      }
    }
  }
}

let blockIRotated = false;
function rotateBlockI() {
  const gridTemp = [];
  for (let c = 0; c < 4; c++) {
    gridTemp[c] = [];
    for (let r = 0; r < 4; r++) {
      gridTemp[c][r] = 0;
    }
  }

  if (!blockIRotated) {
    let xt = 3;
    for (let y = 0; y < 4; y++) {
      let yt = 3;
      for (let x = 3; x >= 0; x--) {
        gridTemp[xt][yt] = grid[xAxis + (x - 1)][yAxis + (y - 1)];
        yt--;
      }
      xt--;
    }
    blockIRotated = !blockIRotated;
  } else {
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        if (x == 1) {
          gridTemp[x][y] = 7;
        }
      }
    }
    blockIRotated = !blockIRotated;
  }

  let rotatable = true;

  loop: for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (
        gridTemp[x][y] > 0 &&
        gridScore[xAxis + (x - 1)][yAxis + (y - 1)] < 0
      ) {
        rotatable = false;
        break loop;
      }
    }
  }

  if (rotatable) {
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        grid[xAxis + (x - 1)][yAxis + (y - 1)] = gridTemp[x][y];
      }
    }
  }
}
//#endregion

//#endregion

//#region 점수 계산 로직
function collisionDetection() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c][r + 1] < 0) {
        blockLand();
        calculateScore();
        resetGrid();
        getBlockList();
        createBlock();
        xAxis = column / 2 - 1;
        yAxis = 1;
      }
    }
  }
}

function resetGrid() {
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
    for (let c = 1; c < column - 1; c++) {
      if (gridScore[c][r] >= 0) break;
      if (c >= column - 2) {
        hit = true;
        hitrow = r;
      }
    }
  }

  if (hit) {
    for (let c = 1; c < column - 1; c++) {
      gridScore[c].splice(hitrow, 1);
      gridScore[c].unshift(0);
    }

    calculateScore();
    score++;
  }
}
//#endregion

//#region 그래픽 로직
// 상태 코드 화면
function drawStatus() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      const g = grid[c][r];
      ctx.font = "16px Arial";
      ctx.fillStyle = "#0099DD";
      ctx.fillText(g, c * 20 + column / 2 - 20, r * 20 + row - 5);

      const gs = gridScore[c][r];
      ctx.font = "16px Arial";
      ctx.fillStyle = "#FF4000";
      ctx.fillText(gs, c * 20 + column / 2 - 20, r * 20 + row - 5);
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

// 그래픽 화면
function drawGrid() {
  // 미리보기
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

  // 떨어지는 블록
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

  // 쌓이는 블록
  for (let c = 1; c < column - 1; c++) {
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

// 점수 화면
function drawScore() {
  ctx.beginPath();
  ctx.strokeRect(135, 0, 65, 20);
  ctx.closePath();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Score: " + score, 137, 15);
}
//#endregion

//#region 게임오버 로직
function checkGameover() {
  for (let c = 1; c < column - 1; c++) {
    if (gridScore[c][4] != 0) {
      alert("Game Over");
      resetGame();
    }
  }
}

function resetGame() {
  score = 0;
  for (let c = 1; c < column - 1; c++) {
    for (let r = 0; r < row - 1; r++) {
      gridScore[c][r] = 0;
    }
  }
}
//#endregion

//main
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScore();
  drawGrid();
  // drawStatus();
  collisionDetection();
  checkGameover();

  requestAnimationFrame(draw);
}

createBlock();
setInterval(drop, 250);
draw();
//#endregion
