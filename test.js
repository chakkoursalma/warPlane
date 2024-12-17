// Get references to elements
const startGameBtn = document.getElementById("start-game-btn");
const galleryPage = document.getElementById("gallery-page");
const gamePage = document.getElementById("game-page");

// Add event listener to Start Game button
startGameBtn.addEventListener("click", () => {
    galleryPage.style.display = "none"; // Hide the gallery page
    gamePage.style.display = "block";  // Show the game page
});
