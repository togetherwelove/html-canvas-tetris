const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ballRadius = 10;

let x = canvas.width / 2;
let y = canvas.height - 30;

let dx = 4;
let dy = -4;

let ballColor = getColor();
let brickColor = getColor();

let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let score = 0;

let lives = 5;

const brickRowCount = 3;
const brickColumnCount = 8;
const brickWidth = 40;
const brickHeight = 20;
const brickPadding = 15;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  } else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  } else if (e.keyCode == 37) {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function ball() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

function paddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0099DD";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0099DD";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = brickColor;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          brickColor = getColor();
          if (score == brickRowCount * brickColumnCount) {
            alert("You Win! Congatulations!\n" + "Your Score is " + score);
            resetGame();
            score = 0;
            for (let c = 0; c < brickColumnCount; c++) {
              for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r].status = 1;
              }
            }
          }
        }
      }
    }
  }
}

function getColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function resetGame() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 4;
  dy = -4;
  rightPressed = false;
  leftPressed = false;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ball();
  paddle();
  drawBricks();
  collisionDetection();
  drawScore();
  drawLives();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
    ballColor = getColor();
  }

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (!lives) {
        alert("Game Over");
        score = 0;
        for (let c = 0; c < brickColumnCount; c++) {
          for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
          }
        }
        resetGame();
      } else {
        resetGame();
      }
    }
  }

  if (rightPressed) {
    paddleX += 4;
  } else if (leftPressed) {
    paddleX -= 4;
  }

  if (paddleX > canvas.width - paddleWidth) {
    paddleX = canvas.width - paddleWidth;
  } else if (paddleX < 0) {
    paddleX = 0;
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

draw();
