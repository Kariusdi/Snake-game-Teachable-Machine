// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// Assign Model Link Here ! ⤵️
const URL = "https://teachablemachine.withgoogle.com/models/t0FeiSVJG/";
//
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
// ************************************************************************
let label = "waiting...";
let model, webcam, labelContainer, maxPredictions;
let snake, food, gameCanvas, ctx;
let score = 0;
let gameOver = false;
let gameInterval, timerInterval;
let timeLeft = 60; // 1 minute
overlay = document.querySelector(".overlay");
pauseButton = document.querySelector(".pause-button");
restartButton = document.querySelector(".restart-button");
loader = document.querySelector(".loading-overlay");

async function init() {
  try {
    loader.classList.remove("hidden");
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    pauseButton.classList.remove("hidden");
    restartButton.classList.remove("hidden");
    loader.classList.add("hidden");

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    document.getElementById("webcam-container").style.border = "none";
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
      let div = document.createElement("div");
      div.classList.add("prediction-label");
      labelContainer.appendChild(div);
    }

    gameCanvas = document.getElementById("gameCanvas");
    ctx = gameCanvas.getContext("2d");
    snake = new Snake();
    food = generateFood();
    score = 0;
    timeLeft = 60;
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("time-left").innerText =
      "Time Left: " + timeLeft + "s";

    gameOver = false;
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("game-pause-screen").style.display = "none";

    // Game speed
    gameInterval = setInterval(gameLoop, 150);

    // Game Timer
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById("time-left").innerText =
        "Time Left: " + timeLeft + "s";
      if (timeLeft <= 0) {
        stopGame();
      }
    }, 1000);
  } catch (error) {
    console.error("Initialization error: ", error);
  }
}

function stopGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameOver = true;
  document.getElementById("game-over-screen").style.display = "block";
  document.getElementById("final-score").innerText = "Final Score: " + score;
}

function pauseGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  overlay.classList.remove("hidden");
  document.getElementById("game-pause-screen").style.display = "block";
  document.getElementById("current-score").innerText =
    "Current Score: " + score;
  document.getElementById("timeLeft").innerText = "Time Left:" + timeLeft + "s";
}

async function loop() {
  if (!gameOver) {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }
}

async function predict() {
  try {
    const prediction = await model.predict(webcam.canvas);
    let maxPrediction = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
      if (prediction[i].probability > maxPrediction.probability) {
        maxPrediction = prediction[i];
      }
    }
    label = maxPrediction.className;
    labelContainer.innerHTML = `${label}: ${maxPrediction.probability.toFixed(
      2
    )}`;
    controlSnake();
  } catch (error) {
    console.error("Prediction error: ", error);
  }
}

function controlSnake() {
  if (label === "up") {
    snake.setDir(0, -1);
  } else if (label === "right") {
    snake.setDir(1, 0);
  } else if (label === "left") {
    snake.setDir(-1, 0);
  } else if (label === "down") {
    snake.setDir(0, 1);
  }
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  snake.update();
  if (snake.eat(food)) {
    food = generateFood();
    score++;
    document.getElementById("score").innerText = "Score: " + score;
  }
  snake.show();
  drawFood();
  checkGameOver();
}

function generateFood() {
  let cols = gameCanvas.width / 20; // Adjusted for larger food
  let rows = gameCanvas.height / 20; // Adjusted for larger food
  return {
    x: Math.floor(Math.random() * cols) * 20,
    y: Math.floor(Math.random() * rows) * 20,
  };
}

function drawFood() {
  const foodSize = 20; // Adjusted for larger food
  const foodImage = new Image();
  foodImage.src = "./apple.webp"; // Path to your apple image

  foodImage.onload = function () {
    ctx.drawImage(foodImage, food.x, food.y, foodSize, foodSize);
  };
}

function checkGameOver() {
  if (snake.collidesWithSelf()) {
    stopGame();
  }
}

function restartGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  overlay.classList.remove("hidden");
  document.getElementById("game-restart-screen").style.display = "block";
}

function startGame() {
  overlay.classList.add("hidden");
  document.getElementById("game-restart-screen").style.display = "none";
  gameOver = false;
  init();
}

function cont() {
  document.getElementById("game-pause-screen").style.display = "none";
  document.getElementById("game-restart-screen").style.display = "none";
  overlay.classList.add("hidden");
  // Game speed
  gameInterval = setInterval(gameLoop, 150);

  // Game Timer count from remaining time
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time-left").innerText =
      "Time Left: " + timeLeft + "s";
    if (timeLeft <= 0) {
      stopGame();
    }
  }, 1000);
}

class Snake {
  constructor() {
    this.x = gameCanvas.width / 2;
    this.y = gameCanvas.height / 2;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.total = 0;
    this.tail = [];
    this.headImage = new Image();
    this.headImage.src = "./snake-head.webp"; // Path to your snake head image
    this.headSize = 20; // Size of the snake head
  }

  setDir(x, y) {
    if (this.xSpeed !== -x || this.ySpeed !== -y) {
      this.xSpeed = x;
      this.ySpeed = y;
    }
  }

  update() {
    const head = { x: this.x, y: this.y };

    if (this.total > 0) {
      for (let i = 0; i < this.tail.length - 1; i++) {
        this.tail[i] = this.tail[i + 1];
      }
      this.tail[this.total - 1] = head;
    }

    this.x += this.xSpeed * this.headSize;
    this.y += this.ySpeed * this.headSize;

    if (this.x >= gameCanvas.width) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = gameCanvas.width - this.headSize;
    }

    if (this.y >= gameCanvas.height) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = gameCanvas.height - this.headSize;
    }
  }

  show() {
    // Draw the tail segments
    ctx.fillStyle = "#a0c432";
    this.tail.forEach((part) => {
      ctx.beginPath();
      ctx.arc(
        part.x + this.headSize / 2,
        part.y + this.headSize / 2,
        this.headSize / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw the head image
    ctx.drawImage(this.headImage, this.x, this.y, this.headSize, this.headSize);
  }

  eat(food) {
    if (this.x === food.x && this.y === food.y) {
      this.total++;
      return true;
    }
    return false;
  }

  collidesWithSelf() {
    for (let i = 0; i < this.tail.length; i++) {
      if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
        return true;
      }
    }
    return false;
  }
}
