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

    let gameSpeed = 12000; // Slower speed for uniform bomb movement (12 seconds)
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let lives = 9;
    let gameActive = false;
    let lifeDeductedThisRound = false;

    async function fetchQuestions() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/refs/heads/main/question%20in%20Json.json');
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
        Object.keys(bombs).forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`]}`;
            optionText.addEventListener("click", () => handleAnswerSelection(option, questionData["Correct Answer"]));
            optionsContainer.appendChild(optionText);

            resetBomb(bombs[option]);
            bombs[option].style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;
        });

        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        lifeDeductedThisRound = false;
    }

    function updateLives() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeIcon = document.createElement('img');
            lifeIcon.src = "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/images/Cat_life.png";
            livesContainer.appendChild(lifeIcon);
        }
    }

    function triggerExplosion(bomb) {
        bomb.style.display = "none"; // Hide the bomb after explosion
        explosionAnimation.style.display = "block";
        explosionAnimation.style.top = bomb.offsetTop + 'px';
        explosionAnimation.style.left = bomb.offsetLeft + 'px';
        sounds.explosion.play();

        setTimeout(() => {
            explosionAnimation.style.display = "none";
        }, 500);
    }

    function handleBombCollision(bomb) {
        if (!gameActive || lifeDeductedThisRound) return;
        lives--;
        lifeDeductedThisRound = true; // Only deduct life once per question
        updateLives();
        triggerExplosion(bomb);
        checkGameStatus();
    }

    function handleAnswerSelection(selectedOption, correctOption) {
        const selectedBomb = bombs[selectedOption];
        if (selectedOption === correctOption) {
            sounds.correct.play();
            score++;
            scoreEl.textContent = score;
            resetBombs();
            loadQuestion();
        } else {
            triggerExplosion(selectedBomb); // Trigger explosion on incorrect bomb without losing life
        }
    }

    function checkGameStatus() {
        if (lives <= 0) {
            gameOver();
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
        playButton.removeEventListener("click", startGame);
        playButton.addEventListener("click", resetGame);
    }

    function resetGame() {
        score = 0;
        lives = 9;
        currentQuestionIndex = 0;
        scoreEl.textContent = score;
        gameActive = true;

        updateLives();
        resetBombs();
        loadQuestion();

        playButton.style.display = "none";
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    function resetBombs() {
        Object.values(bombs).forEach(resetBomb);
    }

    function resetBomb(bomb) {
        bomb.style.animation = 'none';
        bomb.style.display = 'block';
        void bomb.offsetWidth; // Trigger reflow to reset animation
    }

    function startBombs() {
        Object.keys(bombs).forEach((key) => {
            const bomb = bombs[key];
            bomb.addEventListener("animationend", () => handleBombCollision(bomb));
        });
    }

    function startGame() {
        fetchQuestions().then(() => {
            resetGame();
            startBombs();
        });
    }

    playButton.addEventListener("click", startGame);
    sounds.music.volume = 0.5;
});
