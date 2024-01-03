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

// blocks 배열의 종류에 맞는 색상 목록
const blockColors = [
  "#FFFF00",
  "#800080",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFA500",
  "#00FFFF",
];

/**
 * (10 + 4 * 20 + 1) 배열을 만든 이유는 다음과 같습니다.
 *
 * 블록이 존재할 수 있는 공간은 10 * 20 입니다.
 * 벽 블록과 맨 밑 바닥 블록 칸을 추가하였습니다 (column + 2, row + 1)
 *
 * (4 * 4) 블록이 맨 왼쪽 벽에 붙어 회전하는 경우,
 * Index out of range를 방지하기 위해 짝수 단위로 column를 추가하였습니다. (column + 2)
 */
const column = 14;
const row = 21;

const grid = [];
const gridPreview = [];
const gridScore = [];

let score = 0;

// 블록이 생성될 때 축을 담당하는 인덱스
let cAxis = column / 2 - 2;
let rAxis = 1;

// 현재 블록과 미리보기 블록을 담은 목록
let blockList = [];

//#region
/**
 * 플레이 공간(0), 벽과 바닥(-8),
 * 미리보기 화면용(4 * 4) 배열을 2차원으로 생성합니다.
 */
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

// 블록 목록에 랜덤한 블록 인덱스를 추가합니다.
for (let i = 0; i < 2; i++) {
  blockList[i] = getRandomBlockIndex();
}
//#endregion

document.addEventListener("keydown", keydownHandler);
document.addEventListener("click", clickHandler);

function clickHandler(e) {
  // 좌
  if (e.target.id == 1) {
    if (!checkLeft()) {
      moveLeft();
    }
  }

  // 우
  if (e.target.id == 2) {
    if (!checkRight()) {
      moveRight();
    }
  }

  // 회전
  if (e.target.id == 3) {
    rotateBlock();
  }

  // 하강
  if (e.target.id == 4) {
    while (!checkGround()) {
      dropBlock();
    }
    collisionDetection();
  }
}

function keydownHandler(e) {
  if (e.keyCode == 37) {
    if (!checkLeft()) {
      moveLeft();
    }
  }

  if (e.keyCode == 39) {
    if (!checkRight()) {
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

/**
 * 블록을 생성합니다.
 *
 * @param {number[][]} block 블록 2차원 배열
 */
function drawBlock(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      grid[column / 2 - 2 + i][j] = block[i][j];
    }
  }
}

/**
 * 미리보기 배열에 파라미터로 받은 블록 배열을 저장합니다.
 *
 * @param {number[][]} block 블록 2차원 배열
 */
function drawBlockPreview(block) {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      gridPreview[i][j] = block[i][j];
    }
  }
}

// 게임의 진행을 위한 블록 생성용 메서드입니다.
function createBlock() {
  const index = blockList[0];
  drawBlock(blocks[index]);

  const nextIndex = blockList[1];
  drawBlockPreview(blocks[nextIndex]);
}

// 충돌 감지 후 블록을 한 칸 하강시킵니다.
function dropBlock() {
  collisionDetection();
  moveDown();
}

//#region
// 블록이 있는 배열과 기존의 블록(벽 포함)을 비교합니다.
function checkLeft() {
  let checked = false;

  loop: for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c - 1][r] < 0) {
        checked = true;
        break loop;
      }
    }
  }
  return checked;
}

function checkRight() {
  let checked = false;

  loop: for (let c = column - 3; c > 0; c--) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c + 1][r] < 0) {
        checked = true;
        break loop;
      }
    }
  }
  return checked;
}

function checkGround() {
  let checked = false;
  loop: for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      if (grid[c][r] > 0 && gridScore[c][r + 1] < 0) {
        checked = true;
        break loop;
      }
    }
  }
  return checked;
}
//#endregion

//#region

// 블록을 이동시킵니다.

function moveLeft() {
  const newLine = [];
  for (let r = 0; r < row; r++) {
    newLine[r] = 0;
  }

  grid.push(newLine);
  grid.shift();

  // 축 좌표가 화면에서 벗어나지 못하게 방지합니다.
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
//#endregion

function landBlock() {
  // 임시 배열을 생성합니다.
  let gridTemp = [];
  for (let c = 0; c < column; c++) {
    gridTemp[c] = [];
    for (let r = 0; r < row; r++) {
      gridTemp[c][r] = 0;
    }
  }

  // 양수 배열을 음수로 만들어 기존의 블록으로 만듭니다.
  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row - 1; r++) {
      gridTemp[c][r] = grid[c][r] * -1;
    }
  }

  // 기존의 블록 배열에 추가합니다.
  for (let c = 1; c < column - 3; c++) {
    for (let r = 0; r < row - 1; r++) {
      if (gridScore[c][r] === 0) {
        gridScore[c][r] = gridTemp[c][r];
      }
    }
  }
}

function rotateBlock() {
  // 현재의 블록 인덱스 값을 받아 회전할 배열의 길이를 지정합니다.
  let arrayLength = 0;
  let currentBlockIndex = blockList[0] + 1;

  // I 블록의 경우 (4 * 4)이고,
  // O 블록을 제외한 나머지 블록은 (3 * 3)입니다.
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

  // 시계방향으로 90도 회전시킵니다.
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

/**
 * 회전한 블록과 기존의 블록이 겹치지 않는지 검사합니다.
 * 겹치는 경우 재귀를 통해 블록을 이동시켜 더이상 겹치지 않을 때까지 반복합니다.
 * 어떤 경우도 겹치는 것이 불가피할 경우 stackoverflow를 일으킵니다.
 *
 * @param {number[][]} gridTemp 회전된 배열
 * @param {number} arrayLength 회전 배열의 길이
 */
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
        if (!complete && r >= 2) {
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

/**
 * 충돌을 감지한 직후,
 *
 * 블록 착지 -> 점수 계산(한 줄 삭제 & 위 블록 하강 처리)
 * -> 배열 리셋 -> 블록 목록 갱신 -> 블록 생성 -> 축 초기화
 *
 * 순으로 메서드가 실행됩니다.
 */
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

/**
 * 한 줄이 채워지면 그 줄은 삭제되고 위에 있는 기존의 블록이 한 칸 하강합니다.
 * 재귀를 통해 채워진 한 줄이 없어질 때까지 점수 계산을 반복합니다.
 */
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

// 블록이 생성될 자리에 기존의 블록이 닿게 되면 게임은 종료되고
// 기존의 블록 배열은 초기화, 점수는 0점이 됩니다.
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

//#region
// 캔버스에 배열을 시각화합니다.
function drawMatrix() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      const g = grid[c][r];
      const gs = gridScore[c][r];

      ctx.font = "16px Arial";

      ctx.fillStyle = "#0099DD";
      ctx.fillText(g, c * 20 + column / 2 - 20, r * 20 + row - 5);

      ctx.fillStyle = "#FF4000";
      ctx.fillText(gs, c * 20 + column / 2 - 20, r * 20 + row - 5);
    }
  }

  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      const gp = gridPreview[c][r];
      ctx.fillStyle = "#01DF01";
      ctx.fillText(gp, c * 20 + column / 2, r * 20 + row - 5);
    }
  }
}

function drawGrid() {
  for (let c = 0; c < column; c++) {
    for (let r = 0; r < row; r++) {
      const g = grid[c][r];
      const gs = gridScore[c][r];

      ctx.beginPath();

      if (g > 0) {
        ctx.rect(c * 20 - 20, r * 20, 20, 20);
        ctx.fillStyle = blockColors[blockList[0]];
      }

      if (gs < 0) {
        ctx.rect(c * 20 - 20, r * 20, 20, 20);
        ctx.fillStyle = blockColors[Math.abs(gs) - 1];
      }

      ctx.fill();
      ctx.stroke();
      ctx.closePath();
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
  ctx.strokeRect(0, 0, 60, 60);
  ctx.closePath();
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      const gp = gridPreview[c][r];
      if (gp > 0) {
        ctx.beginPath();
        ctx.rect(c * 12.5 + 20, r * 12.5 + 10, 12.5, 12.5);
        ctx.fillStyle = blockColors[blockList[1]];
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}
//#endregion

// 메인 메서드입니다.
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // drawMatrix();
  drawPreview();
  drawScore();
  drawGrid();

  checkGameover();

  requestAnimationFrame(draw);
}

/**
 * 맨 처음 블록을 생성합니다. 그리고 1초(1000ms)에 한번 블록을 하강시킵니다.
 */
createBlock();
setInterval(dropBlock, 1000);
draw();
