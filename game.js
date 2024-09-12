const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 512;
canvas.height = 512;

const player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 30,
  width: 10,
  height: 10,
  speed: 2,
  dx: 0,
  dy: 0,
  alive: true, // Add this line
};

let gameLoop = 0; // gameLoop is appox 200 = 1 second
let gemCount = 0;
const GEM_GOAL = 10;

const obstacles = [];

const gems = [];

const keys = {};

const drawPlayer = () => {
  if (player.alive) {
    ctx.fillStyle = "hsl(60, 100%, 100%)";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const updatePlayerPosition = () => {
  if (keys['d']) player.dx = player.speed;
  else if (keys['a']) player.dx = -player.speed;
  else player.dx = 0;

  if (keys['w']) player.dy = -player.speed;
  else if (keys['s']) player.dy = player.speed;
  else player.dy = 0;

  player.x += player.dx;
  player.y += player.dy;

  // Prevent player from going off the canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
};

function createObstacle() {
  const obstacle = {
    x: Math.random() * (canvas.width - 20),
    y: 0,
    width: 10,
    height: 10,
    speed: 1 + Math.random() * 2
  };
  obstacles.push(obstacle);
}

function createGem() {
  const gem = {
    x: Math.random() * (canvas.width - 20),
    y: 0,
    width: 10,
    height: 10,
    speed: 1
  };
  gems.push(gem);
}

function didPlayerCollideWithObstacle() {
  return obstacles.some((obstacle) => {
    return player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y;
  });
}

function didPlayerCollideWithGem() {
  return gems.some((gem) => {
    return player.x < gem.x + gem.width &&
      player.x + player.width > gem.x &&
      player.y < gem.y + gem.height &&
      player.y + player.height > gem.y;
  });
}

function collectGem(index) {
  console.log("Gem collected!");
  gemCount++;
  gems.splice(index, 1);
}

function updateObstacles() {
  obstacles.forEach((obstacle, index) => {
    obstacle.y += obstacle.speed;

    // Remove obstacle if it's off the screen
    if (obstacle.y > canvas.height) {
      obstacles.splice(index, 1);
    }

    // Check collision with player
    if (didPlayerCollideWithObstacle()) {
      console.log("Collision detected!");
      player.alive = false; // Set player to not alive
    }
  });
}

function updateGems() {
  gems.forEach((gem, index) => {
    gem.y += gem.speed;

    if (player.x < gem.x + gem.width &&
        player.x + player.width > gem.x &&
        player.y < gem.y + gem.height &&
        player.y + player.height > gem.y) {
      collectGem(index);
    }
  });
}

const drawObstacles = () => {
  ctx.fillStyle = "hsl(0, 100%, 50%)"; // Red color for obstacles
  obstacles.forEach((obstacle) => {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
};

const drawGems = () => {
  ctx.fillStyle = "hsl(60, 100%, 50%)"; // gold color for gems
  gems.forEach((gem) => {
    ctx.fillRect(gem.x, gem.y, gem.width, gem.height);
  });
};

const renderLoopLabel = () => {
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(gameLoop, 10, 20);
};

const renderGemCount = () => {
  let gemCountElement = document.getElementById('gemCount');
  if (!gemCountElement) {
    gemCountElement = document.createElement('div');
    gemCountElement.id = 'gemCount';
    document.body.appendChild(gemCountElement);
    gemCountElement.classList.add('gem-count');
  }
  gemCountElement.textContent = `Gems: ${gemCount}`;
}

function shouldCreateObstacle(rateIncrease = 1) {
  return Math.random() < Math.min(Math.max(0.02 * rateIncrease * gemCount * gameLoop / 8000, 0.02), 0.2)
}

function shouldCreateGem(rateIncrease = 1) {
  return Math.random() < 0.001
}

const update = () => {
  gameLoop++;
  if (player.alive) {
    if (shouldCreateObstacle()) {
      createObstacle();
    }
    if (shouldCreateGem()) {
      createGem();
    }
    updateObstacles();
    updateGems();
    updatePlayerPosition();
  }
  clearCanvas();
  drawObstacles();
  drawGems();
  drawPlayer();
  // renderLoopLabel();
  renderGemCount();
  if (player.alive && gemCount < GEM_GOAL) {
    requestAnimationFrame(update);
  } else {
    // Display game over or win message
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    const message = gemCount >= GEM_GOAL ? "WIN!" : "Game Over";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);

    // Show the replay button
    replayButton.style.display = 'block';
  }
};

const handleKeyDown = (e) => {
  keys[e.key] = true;
};

const handleKeyUp = (e) => {
  keys[e.key] = false;
};

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

let replayButton;

// Add this function to create the replay button
function createReplayButton() {
  replayButton = document.createElement('button');
  replayButton.textContent = 'Play Again';
  replayButton.style.position = 'absolute';
  // replayButton.style.left = `${canvas.offsetLeft + canvas.width / 2 - 50}px`;
  replayButton.style.top = `${canvas.offsetTop + canvas.height / 2 + 70}px`;
  replayButton.style.width = '230px';
  replayButton.style.display = 'none';
  replayButton.classList.add('replay-button');
  document.body.appendChild(replayButton);

  replayButton.addEventListener('click', resetGame);
}

// Add this function to reset the game state
function resetGame() {
  player.x = canvas.width / 2 - 15;
  player.y = canvas.height - 30;
  player.alive = true;
  gameLoop = 0;
  gemCount = 0;
  obstacles.length = 0;
  gems.length = 0;
  replayButton.style.display = 'none';
  update();
}

// Call this function to create the replay button when the game starts
createReplayButton();

update();
