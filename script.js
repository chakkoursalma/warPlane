const plane = document.getElementById('plane');
const banner = document.querySelector('.banner');

let planeTop = window.innerHeight / 2;
let planeLeft = window.innerWidth / 2;

const step = 25; // Movement speed
const bullets = []; // Track active bullets
const obstacles = []; // Track active obstacles
let score = 0; // Player's score
let planeHits = 0; // Number of times the plane has been hit

// Initialize the chrono variables
let seconds = 0;
let minutes = 0;
let timer;

// Create the score board div and apply styles
const scoreBoard = document.createElement('div');
scoreBoard.classList.add('score-board');
scoreBoard.style.position = 'fixed';
scoreBoard.style.top = '10px';
scoreBoard.style.right = '10px';
scoreBoard.style.fontSize = '20px';
scoreBoard.style.color = '#fff';
scoreBoard.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
scoreBoard.style.padding = '10px 20px';
scoreBoard.style.borderRadius = '5px';
scoreBoard.style.fontFamily = "'Arial', sans-serif";

// Append the score board to the banner (assuming 'banner' is already defined in your HTML)
document.body.appendChild(scoreBoard);



// Function to start the timer
function startTimer() {
    timer = setInterval(function () {
        seconds++;  // Increment seconds
        if (seconds >= 60) {
            seconds = 0;  // Reset seconds
            minutes++;  // Increment minutes
        }

        // Update the chrono time
        const timeString = formatTime(minutes, seconds);
        document.getElementById('chrono-time').textContent = timeString;
    }, 1000);  // Update every second
}

// Function to format the time as MM:SS
function formatTime(min, sec) {
    const minutesFormatted = min < 10 ? '0' + min : min;
    const secondsFormatted = sec < 10 ? '0' + sec : sec;
    return `${minutesFormatted}:${secondsFormatted}`;
}

// Call startTimer when the game is ready to start
window.onload = function() {
    startTimer();  // Start the timer when the page loads
    updateScore(0);  // Initialize the score display with 0
};



// Move the plane
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            planeTop = Math.max(0, planeTop - step);
            break;
        case 'ArrowDown':
            planeTop = Math.min(window.innerHeight - plane.offsetHeight, planeTop + step);
            break;
        case 'ArrowLeft':
            planeLeft = Math.max(0, planeLeft - step);
            break;
        case 'ArrowRight':
            planeLeft = Math.min(window.innerWidth - plane.offsetWidth, planeLeft + step);
            break;
        case ' ': // Spacebar to shoot
            shootBullet();
            break;
    }

    plane.style.top = `${planeTop}px`;
    plane.style.left = `${planeLeft}px`;
});

function spawnBomb() {
    const bomb = document.createElement('div');
    bomb.classList.add('bomb'); // Use a CSS class for bomb styling

    // Random horizontal position for the bomb
    const startLeft = Math.random() * (window.innerWidth - 20); // 20 is the approximate width of the bomb
    bomb.style.left = `${startLeft}px`;
    bomb.style.top = `0px`; // Start at the top of the screen

    banner.appendChild(bomb);

    moveBomb(bomb);
}

let bombSpeed = 5; // Variable to control the speed of the bomb

function moveBomb(bomb) {
    const interval = setInterval(() => {
        const bombTop = parseInt(bomb.style.top, 10);

        // Update the bomb's vertical position
        bomb.style.top = `${bombTop + bombSpeed}px`; // Use bombSpeed for movement

        const planeRect = plane.getBoundingClientRect();
        const bombRect = bomb.getBoundingClientRect();

        // Check for collision with the plane
        if (
            bombRect.left < planeRect.right &&
            bombRect.right > planeRect.left &&
            bombRect.top < planeRect.bottom &&
            bombRect.bottom > planeRect.top
        ) {
            alert('Game Over!');
            location.reload(); // Reload the game
            clearInterval(interval);
        }

        // Remove bomb if it goes out of bounds
        if (bombTop > window.innerHeight) {
            bomb.remove();
            clearInterval(interval);
        }
    }, 30);
}

function shootBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');

    // Calculate the plane's current position
    const planeRect = plane.getBoundingClientRect();
    const bannerRect = banner.getBoundingClientRect();

    // Ensure the plane's position is inside the banner
    if (!planeRect || !bannerRect) return;

    // Position the bullet at the bottom of the plane
    bullet.style.top = `${planeRect.top + planeRect.height / 2 - bannerRect.top}px`; // Center vertically relative to the plane
    bullet.style.left = `${planeRect.left + planeRect.width + 5 - bannerRect.left}px`; // Slightly outside the plane horizontally

     
    // Append the bullet to the banner
    banner.appendChild(bullet);
    bullets.push(bullet);

    moveBullet(bullet);  
}

function moveBullet(bullet) {
    const interval = setInterval(() => {
        const currentTop = parseFloat(bullet.style.top);

        if (currentTop < 0) { // Bullet moves off-screen
            bullet.remove(); // Remove the bullet once it's out of the screen
            clearInterval(interval);
        } else {
            bullet.style.top = `${currentTop - 5}px`;  // Move the bullet upwards
            checkCollision(bullet);  // Check for collision with obstacles
        }
    }, 16);  // 60 FPS
}

function spawnObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.left = `${Math.random() * (window.innerWidth - 20)}px`; // Random horizontal position
    obstacle.style.top = `0px`; // Start at the top of the screen

    banner.appendChild(obstacle);
    obstacles.push(obstacle);

    moveObstacle(obstacle);
}

let obstacleSpeed = 1; // Variable to control the speed of the obstacle

function moveObstacle(obstacle) {
    const interval = setInterval(() => {
        const obstacleTop = parseInt(obstacle.style.top, 10);

        // Update the obstacle's vertical position
        obstacle.style.top = `${obstacleTop + obstacleSpeed}px`; // Use obstacleSpeed for movement

        // Check if the obstacle is out of bounds
        if (obstacleTop > window.innerHeight) {
            obstacle.remove(); // Remove obstacle when it moves past the screen
            clearInterval(interval); // Clear the interval to stop the movement
            obstacles = obstacles.filter(item => item !== obstacle); // Remove from array
        }

        // Check for collision with the plane
        if (checkCollisionWithPlane(obstacle)) {
            obstacle.remove(); // Remove the obstacle if a collision happens
            clearInterval(interval); // Stop moving the obstacle
            obstacles = obstacles.filter(item => item !== obstacle); // Remove from array
        }
    }, 10); // Adjust the interval for smoother movement
}


// Function to check for collision between the plane and the obstacle
function checkCollisionWithPlane(obstacle) {
    // Assuming plane and obstacle are DOM elements, adjust as per your setup
    const plane = document.querySelector('.plane'); // Replace with your plane's selector
    const planeRect = plane.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // Check if the obstacle is colliding with the plane
    return !(obstacleRect.top > planeRect.bottom || 
             obstacleRect.bottom < planeRect.top || 
             obstacleRect.left > planeRect.right || 
             obstacleRect.right < planeRect.left);
}

// Check collision between bullets and obstacles
function checkCollision(bullet) {
    obstacles.forEach((obstacle) => {
        const bulletRect = bullet.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            bulletRect.left < obstacleRect.right &&
            bulletRect.right > obstacleRect.left &&
            bulletRect.top < obstacleRect.bottom &&
            bulletRect.bottom > obstacleRect.top
        ) {
            bullet.remove();
            obstacle.remove();

            bullets.splice(bullets.indexOf(bullet), 1);
            obstacles.splice(obstacles.indexOf(obstacle), 1);

            score++; // Increase the score when a bullet hits an obstacle
            updateScore();
        }
    });
}

// Check collision between plane and obstacles
function checkCollisionWithPlane(obstacle) {
    const planeRect = plane.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
        planeRect.left < obstacleRect.right &&
        planeRect.right > obstacleRect.left &&
        planeRect.top < obstacleRect.bottom &&
        planeRect.bottom > obstacleRect.top
    ) {
        obstacle.remove();
        obstacles.splice(obstacles.indexOf(obstacle), 1);

        planeHits++; // Increment the hit counter
        score--; // Decrease the score
        updateScore();

        if (planeHits >= 3) {
            alert('Game Over!');
            location.reload(); // Reload the game
        }
    }
}

function updateScore() {
    scoreBoard.textContent = `Score: ${score}`;

    // Reference to the background video element
    const videoElement = document.getElementById('background-video'); // Video tag
    const currentSource = videoElement.querySelector('source')?.src || '';

    let newSource = '';
    if (score >= 50) {
        newSource = "images/video5.mp4";
    } else if (score >= 40) {
        newSource = "images/video4.mp4";
    } else if (score >= 30) {
        newSource = "images/video2.mp4";
    } else if (score >= 20) {
        newSource = "images/video3.mp4";
    }

    // Change source only if it's different from the current source
    if (!currentSource.includes(newSource)) {
        changeVideoSource(videoElement, newSource);
    }
}

// Function to change video source smoothly
function changeVideoSource(videoElement, newSource) {
    const sourceElement = videoElement.querySelector('source') || document.createElement('source');

    // Update the source only
    sourceElement.src = newSource;
    sourceElement.type = "video/mp4";

    if (!videoElement.contains(sourceElement)) {
        videoElement.appendChild(sourceElement);
    }

    // Load and play the new video
    videoElement.load();
    videoElement.play();
}

function spawnDollar() {
    const dollar = document.createElement('div');
    dollar.classList.add('dollar'); // Use a CSS class for dollar styling

    // Random horizontal position for the dollar
    const startLeft = Math.random() * (window.innerWidth - 20); // 20 is the approximate width of the dollar
    dollar.style.left = `${startLeft}px`;
    dollar.style.top = `0px`; // Start at the top of the screen

    banner.appendChild(dollar);

    moveDollar(dollar);
}

let dollarSpeed = 1; // Variable to control the speed of the dollar

function moveDollar(dollar) {
    const interval = setInterval(() => {
        const dollarTop = parseInt(dollar.style.top, 10);

        // Update the dollar's vertical position using dollarSpeed for movement
        dollar.style.top = `${dollarTop + dollarSpeed}px`;

        const planeRect = plane.getBoundingClientRect();
        const dollarRect = dollar.getBoundingClientRect();

        // Check if the dollar is near or overlapping with the plane
        if (
            dollarRect.left < planeRect.right &&
            dollarRect.right > planeRect.left &&
            dollarRect.top < planeRect.bottom &&
            dollarRect.bottom > planeRect.top
        ) {
            // Increase the score
            score = score + 1;
            updateScore(); // Update score display
            dollar.remove();
            clearInterval(interval);
        }

        // Remove dollar if it goes out of bounds
        if (dollarTop > window.innerHeight) {
            dollar.remove();
            clearInterval(interval);
        }
    }, 30); // The interval for smoother movement
}


// Initialize an array to hold all ally planes
const allies = [];

// Spawn ally planes (adjusted for top-down movement)
function spawnAllyPlane() {
    const ally = document.createElement('div');
    ally.classList.add('ally');
    ally.style.left = `${Math.random() * (window.innerWidth - 20)}px`; // Random horizontal position
    ally.style.top = `0px`; // Start at the top of the screen

    banner.appendChild(ally);
    allies.push(ally);

    moveAlly(ally);
}

let allySpeed = 1; // Variable to control the speed of the ally plane

function moveAlly(ally) {
    const interval = setInterval(() => {
        const allyTop = parseInt(ally.style.top, 10);
        if (allyTop > window.innerHeight) {
            ally.remove();
            clearInterval(interval);
            allies.splice(allies.indexOf(ally), 1);
        } else {
            ally.style.top = `${allyTop + allySpeed}px`; // Use allySpeed for movement
            checkCollisionWithPlane(ally); // Check if the plane collides with the ally
            checkShootingCollision(ally); // Check if a bullet hits the ally
        }
    }, 30); // Interval for updating the position
}

// Check if the player's bullets collide with the ally plane
function checkShootingCollision(ally) {
    const bullets = document.querySelectorAll('.bullet'); // Assuming bullets have class 'bullet'

    bullets.forEach(bullet => {
        const bulletRect = bullet.getBoundingClientRect();
        const allyRect = ally.getBoundingClientRect();

        if (
            bulletRect.left < allyRect.right &&
            bulletRect.right > allyRect.left &&
            bulletRect.top < allyRect.bottom &&
            bulletRect.bottom > allyRect.top
        ) {
            // Bullet hits the ally plane, decrease score by 1
            score--;
            updateScore();

            // Remove the ally plane and the bullet after the collision
            ally.remove();
            allies.splice(allies.indexOf(ally), 1);

            bullet.remove(); // Remove bullet
        }
    });
}



// Spawn different elements at intervals
setInterval(spawnObstacle, 3000); // Spawn obstacles every 7 seconds
setInterval(spawnBomb, 5000);     // Spawn bombs every 7 seconds
setInterval(spawnDollar, 800);  // Spawn a dollar every 5 seconds
setInterval(spawnAllyPlane, 6000); // Spawn ally planes every second
