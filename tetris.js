const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

// 각 블록의 형태를 2차원 배열로 표현한 목록
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

// 각 블록 종류의 대응하는 색상 코드 목록
const blockColors = [
  "#FFFF00",
  "#800080",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFA500",
  "#00FFFF",
];

// 게임의 점수
let score = 0;

// 벽과 바닥을 포함하는 화면의 행과 열
const column = 12;
const row = 21;

// 블록의 가로축과 세로축
let xAxis = column / 2 - 1;
let yAxis = 1;

// 현재 떨어지고 있는 블록과 다음에 나올 블록 목록
let blockList = [];

// 컨트롤 그리드 (12 * 21)
const grid = [];
// 미리보기 그리드 (4 * 4)
const gridPreview = [];
// 점수 계산 그리드 (12 * 21)
const gridScore = [];

// 7번 블록 회전 체크 변수
let blockIRotated = false;

//#region 배열 생성
for (let c = 0; c < column; c++) {
  grid[c] = [];
  gridScore[c] = [];
  for (let r = 0; r < row; r++) {
    grid[c][r] = 0;
    gridScore[c][r] = -8;
  }
}

for (let c = 1; c < column - 1; c++) {
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
//#endregion

// 클릭과 키보드 이벤트 리스너
document.addEventListener("keydown", keydownHandler);
document.addEventListener("click", clickHandler);

//#region 이벤트 리스너 핸들러

// 클릭 핸들러입니다.
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

// 키보드 핸들러입니다.
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
    collisionDetection();
  }
}
//#endregion

//#region 블록 생성 로직

// 직접 화면에 블록을 등장시킵니다.
function drawBlock(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      grid[column / 2 - 1 + i][j] = block[i][j];
    }
  }
}

// 미리보기 화면에 블록을 등장시킵니다.
function drawNextBlock(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      gridPreview[i][j] = block[i][j];
    }
  }
}

// 랜덤한 종류의 블록 인덱스(1 ~ 7)를 반환합니다.
function getRandomBlockIndex() {
  return Math.floor(Math.random() * blocks.length);
}

// 블록 목록에 새 블록을 push 합니다.
function getBlockList() {
  blockList.shift();
  blockList.push(getRandomBlockIndex());
}

// drawBlock과 drawNextBlock을 실행시킵니다.
function createBlock() {
  const index = blockList[0];
  drawBlock(blocks[index]);

  const nextIndex = blockList[1];
  drawNextBlock(blocks[nextIndex]);
}
//#endregion

//#region 블록 이동 로직

// 충돌 감지 로직 실행 후 블록을 한 칸 내립니다.
function drop() {
  collisionDetection();
  dropBlock();
}

// 블록을 한 칸 내리고 세로축을 증가시킵니다.
function dropBlock() {
  for (let c = 0; c < column; c++) {
    grid[c].unshift(0);
    grid[c].pop();
  }
  yAxis++;
}

// 블록의 왼쪽에 벽이 있는지 확인합니다.
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

// 블록의 오른쪽에 벽이 있는지 확인합니다.
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

// 블록과 닿아있는 밑 면이 바닥인지 확인합니다.
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

// 블록을 왼쪽으로 이동시킵니다.
function moveLeft() {
  const newLine = [];
  for (let r = 0; r < row; r++) {
    newLine[r] = 0;
  }

  grid.push(newLine);
  grid.shift();
  xAxis--;
}

// 블록을 오른쪽으로 이동시킵니다.
function moveRight() {
  const newLine = [];
  for (let r = 0; r < row; r++) {
    newLine[r] = 0;
  }

  grid.unshift(newLine);
  grid.pop();
  xAxis++;
}

// 블록을 착지시킵니다.
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

// 7번과 1번 블록을 제외한 나머지 블록을 회전 시킵니다.
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

// 7번 블록을 회전시킵니다.
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

// 충돌을 감지하고 여러 로직을 실행시킵니다.
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

// 화면을 리셋시킵니다.
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

// 점수를 계산합니다. 한 줄이 채워지면 없애고 위의 줄을 한 칸 내립니다.
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

// 배열의 숫자를 화면에 나타냅니다. (개발용)
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

// 게임 화면을 나타냅니다.
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

// 점수 화면을 나타냅니다.
function drawScore() {
  ctx.beginPath();
  ctx.strokeRect(135, 0, 65, 20);
  ctx.closePath();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Score: " + score, 137, 15);
}

// 미리보기 화면을 나타냅니다.
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
//#endregion

//#region 게임오버 로직

// 게임오버를 체크합니다.
function checkGameover() {
  for (let c = 1; c < column - 1; c++) {
    if (gridScore[c][4] != 0) {
      alert("Game Over");
      resetGame();
    }
  }
}

// 게임을 리셋시킵니다.
function resetGame() {
  score = 0;
  for (let c = 1; c < column - 1; c++) {
    for (let r = 0; r < row - 1; r++) {
      gridScore[c][r] = 0;
    }
  }
}
//#endregion

// 메인 메소드 입니다.
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // drawStatus();
  drawGrid();
  drawScore();
  drawPreview();

  checkGameover();

  requestAnimationFrame(draw);
}

createBlock();

setInterval(drop, 1000);

draw();
//#endregion
