// Global variables
let canvas, ctx;
let rocket = { x: 0, y: 0, width: 50, height: 50, speed: 5 };
let obstacles = [];
let obstacleSpeed = 2;
let obstacleFrequency = 100;
let gameRunning = true;
let score = 0;
let lives = 3;
const SCORE_THRESHOLD = 1000;
let level = 1;
const LEVEL_UP_SCORE = 1000; // Score needed to advance to the next level
let isPaused = false;

// Constants
const OBSTACLE_SPEED = 2;
const OBSTACLE_FREQUENCY = 100; // Frames
let frames = 0;

let rocketImage = new Image();
rocketImage.src = "./rocket.png";

let asteroid1 = new Image();
asteroid1.src = "./asteroid1.png";
let asteroid2 = new Image();
asteroid2.src = "./asteroid2.png";
let asteroid3 = new Image();
asteroid3.src = "./asteroid3.png";
let asteroid4 = new Image();
asteroid4.src = "./asteroid4.png";

let asteroidImages = [asteroid1, asteroid2, asteroid3, asteroid4];

initializeAudio();

// Initialize Canvas and Context
function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  rocket.x = canvas.width / 2 - rocket.width / 2;
  rocket.y = canvas.height - rocket.height - 10;

  // Set up event listeners for controls
  document.addEventListener("keydown", controlRocket);

  gameLoop();
}

function playCrashSound() {
  const crashSound = document.getElementById("crashSound");
  if (crashSound) {
    crashSound.volume = 0.5;
    crashSound.play();
  }
}

function playBackgroundMusic() {
  const music = document.getElementById("backgroundMusic");
  if (music) {
    music.play();
  }
}

function playSoundEffect(effectId) {
  const sound = document.getElementById(effectId);
  if (sound) {
    sound.volume = 0.3;
    sound.play();
  }
}

function pauseBackgroundMusic() {
  const music = document.getElementById("backgroundMusic");
  if (music) {
    music.pause();
  }
}

function resetBackgroundMusic() {
  const music = document.getElementById("backgroundMusic");
  if (music) {
    music.currentTime = 0;
  }
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;

  if (!isPaused) {
    updateGame();
  }
  renderGame();

  frames++;
  requestAnimationFrame(gameLoop);
}

// Player movement
function controlRocket(e) {
  if (e.key === "Space" || e.code === "Space") {
    isPaused = !isPaused;
    if (isPaused) {
      pauseBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
    return; // Skip the rest of the function
  }

  if (e.key === "ArrowLeft" && rocket.x > 0) {
    rocket.x -= rocket.speed;
  } else if (e.key === "ArrowRight" && rocket.x < canvas.width - rocket.width) {
    rocket.x += rocket.speed;
  }
}

// Updating Game State
function updateGame() {
  // Check for level up based on score

  if (score >= level * LEVEL_UP_SCORE) {
    level++;
    rocket.speed *= 1.1; // Increase rocket speed by 10% with each level

    obstacleSpeed *= 1.1; // Increase obstacle speed
    obstacleFrequency *= 0.9; // Increase obstacle frequency (generate more often)
  }

  // Create new obstacles periodically, adjusted by level
  let newFrequency = Math.max(
    20,
    Math.floor(obstacleFrequency / (1 + level * 0.2))
  );
  if (frames % newFrequency === 0) {
    createObstacle();
  }

  // Move obstacles
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].y += obstacleSpeed;

    // Check if the asteroid has passed the bottom of the screen
    if (obstacles[i].y > canvas.height) {
      score += obstacles[i].scoreValue; // Increase score based on the asteroid's value
      obstacles.splice(i, 1);
      i--;
      playSoundEffect("asteroidPassEffect");
      continue;
    }

    if (checkCollision(rocket, obstacles[i])) {
      lives--;
      obstacles.splice(i, 1);
      i--; // Adjust the index after removing an element

      if (lives === 0) {
        gameRunning = false;
        alert(`Game Over! Your score: ${score}`);
        resetGame();
        return;
      } else {
        playCrashSound();
      }

    }
  }
}

// Collision Detection
function checkCollision(obj1, obj2) {
  if (!obj1 || !obj2) {
    return false; // One of the objects is undefined, so no collision
  }

  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.height + obj1.y > obj2.y
  );
}
// Render Game
function renderGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw rocket and obstacles (even when paused, for a better look)
  ctx.drawImage(rocketImage, rocket.x, rocket.y, rocket.width, rocket.height);
  obstacles.forEach((obstacle) => {
    ctx.drawImage(
      obstacle.image,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  });

  if (isPaused) {
    // Draw pause menu overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent black overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Display pause message
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center"; // Align text to center
    ctx.fillText("Game Paused", canvas.width / 2, canvas.height / 2 - 60);

    // Highlight current level
    ctx.font = "24px Arial";
    ctx.fillText(
      `Current Level: ${level}`,
      canvas.width / 2,
      canvas.height / 2 - 20
    );

    // Highlight current score
    ctx.fillText(
      `Current Score: ${score}`,
      canvas.width / 2,
      canvas.height / 2 + 20
    );
  } else {
    // Draw score, lives, and level
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; // Align text to left for the score and lives
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 150, 30);

    ctx.textAlign = "center"; // Align text to center for the level
    ctx.fillText(`Level: ${level}`, canvas.width / 2, 30);
  }

  // Reset textAlign to avoid affecting other text rendering
  ctx.textAlign = "start";
}

function initializeAudio() {
  const asteroidPassEffect = document.getElementById('asteroidPassEffect');
  if (asteroidPassEffect) {
      asteroidPassEffect.volume = 0.1; // 20% volume
  }
  const backgroundMusic = document.getElementById('backgroundMusic');
  if (backgroundMusic) {
      backgroundMusic.volume = 0.8; // 20% volume
  }
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  obstacleFrequency = 100;
  rocket.speed = 5; // Reset to initial speed
  obstacleSpeed = 2; // Reset obstacle speed
  obstacles = [];
  gameRunning = true;

  // Either stop the existing game loop or ensure it doesn't restart unnecessarily
  // Example: Add a flag to control the game loop or just call gameLoop() if it's not running
}

// Creating Obstacles
function createObstacle() {
  // Existing code for setting size, position, etc.
  const size = Math.random() * (60 - 20) + 20; // Random size between 20 and 60
  const position = Math.random() * (canvas.width - size);
  const imageIndex = Math.floor(Math.random() * asteroidImages.length); // Random index

  const obstacleScoreValue = calculateScoreValue(size); // Implement this function
  obstacles.push({
    x: position,
    y: -size,
    width: size,
    height: size,
    scoreValue: obstacleScoreValue,
    image: asteroidImages[imageIndex], // Assuming you are using images
  });
}

function calculateScoreValue(size) {
  // Example: smaller asteroids are harder to dodge, hence more points
  return Math.round((60 - size) * 10);
}

// Start the game
window.onload = initGame;
