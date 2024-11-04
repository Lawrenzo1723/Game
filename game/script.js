document.addEventListener("DOMContentLoaded", async () => {
    const questionEl = document.getElementById("question");
    const optionsContainer = document.getElementById("options");
    const bombs = {
        A: document.getElementById("bombA"),
        B: document.getElementById("bombB"),
        C: document.getElementById("bombC"),
        D: document.getElementById("bombD"),
    };
    const catImage = document.getElementById("catImage");
    const scoreEl = document.getElementById("score");
    const livesContainer = document.getElementById("lives-container");
    const playButton = document.getElementById("play-button");
    const explosionAnimation = document.getElementById("explosion-animation");
    const gameContainer = document.getElementById("game-container");

    const sounds = {
        explosion: document.getElementById("explosionSound"),
        correct: document.getElementById("correctAnswerSound"),
        music: document.getElementById("gameMusic")
    };

    let gameSpeed = 5000;
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let lives = 9;
    let gameActive = false;
    let lifeDeductedThisRound = false;

    async function fetchQuestions() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/54fd000e59e19a1bbdc9063159b55d3a837991bc/question%20in%20Json.json');
            questions = await response.json();
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    }

    function loadQuestion() {
        if (questions.length === 0) return;
        const questionData = questions[currentQuestionIndex];
        questionEl.textContent = questionData["Question"];

        optionsContainer.innerHTML = '';
        ['A', 'B', 'C', 'D'].forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`]}`;
            optionsContainer.appendChild(optionText);
        });

        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        lifeDeductedThisRound = false;
        startBombs(); // Start bombs moving toward the cat for the new question
    }

    function updateLives() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeIcon = document.createElement('img');
            lifeIcon.src = "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/54fd000e59e19a1bbdc9063159b55d3a837991bc/game/assets/images/Cat_life.png";
            livesContainer.appendChild(lifeIcon);
        }
    }

    function triggerExplosion() {
        gameContainer.classList.add("shake");

        let frame = 1;
        explosionAnimation.style.display = "block";
        const explosionInterval = setInterval(() => {
            explosionAnimation.style.backgroundImage = `url(https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/54fd000e59e19a1bbdc9063159b55d3a837991bc/game/assets/explosions/Explosion${frame}.png)`;
            frame++;
            if (frame > 6) {
                clearInterval(explosionInterval);
                explosionAnimation.style.display = "none";
                gameContainer.classList.remove("shake");
                checkGameStatus();
            }
        }, 100);
    }

    function handleBombCollision() {
        if (!gameActive || lifeDeductedThisRound) return;

        lives--;
        updateLives();
        lifeDeductedThisRound = true;
        triggerExplosion();
        sounds.explosion.play();

        if (lives > 0) {
            setTimeout(() => {
                resetBombs();
                loadQuestion();
            }, 500);
        }
    }

    function checkGameStatus() {
        if (lives <= 0) {
            gameOver();
        } else {
            loadQuestion();
        }
    }

    function gameOver() {
        gameActive = false;
        sounds.music.pause();
        alert("Game Over! Your score: " + score);
        showRetryButton();
    }

    function showRetryButton() {
        playButton.textContent = "Retry";
        playButton.style.display = "block";
        playButton.removeEventListener("click", startGame); // Remove any previous event listeners
        playButton.addEventListener("click", resetGame); // Add reset event listener
    }

    function resetGame() {
        // Reset all game state variables
        score = 0;
        lives = 9;
        currentQuestionIndex = 0;
        scoreEl.textContent = score;
        gameActive = true;
        lifeDeductedThisRound = false;

        updateLives();
        resetBombs(); // Reset bomb animations
        loadQuestion();

        // Hide the retry button and restart the music
        playButton.style.display = "none";
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    function resetBombs() {
        Object.values(bombs).forEach(bomb => {
            bomb.style.animation = 'none';
            void bomb.offsetWidth; // Trigger reflow to reset animation
            bomb.style.animation = `moveToCenter ${gameSpeed / 1000}s linear`;
        });
    }

    function startBombs() {
        Object.values(bombs).forEach(bomb => {
            bomb.style.animation = `moveToCenter ${gameSpeed / 1000}s linear`;
        });
    }

    function monitorBombs() {
        Object.values(bombs).forEach(bomb => {
            bomb.addEventListener("animationend", handleBombCollision);
        });
    }

    function startGame() {
        fetchQuestions();
        resetGame();
        monitorBombs();
    }

    playButton.addEventListener("click", startGame);

    sounds.music.volume = 0.5;
    sounds.music.play();
});
