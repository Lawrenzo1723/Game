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

        // Display options and set up click handlers
        optionsContainer.innerHTML = '';
        Object.keys(bombs).forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`]}`;
            optionText.addEventListener("click", () => handleAnswerSelection(option, questionData["Correct Answer"]));
            optionsContainer.appendChild(optionText);

            // Reset bomb for each option at its starting position
            resetBomb(bombs[option]);
            bombs[option].style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;
        });

        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
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
        bomb.style.display = "none"; // Hide the bomb after it explodes
        gameContainer.classList.add("shake");
        explosionAnimation.style.display = "block";
        sounds.explosion.play();

        setTimeout(() => {
            explosionAnimation.style.display = "none";
            gameContainer.classList.remove("shake");
        }, 500);
    }

    function handleBombCollision(bomb) {
        if (!gameActive) return;
        lives--;
        updateLives();
        triggerExplosion(bomb);
        checkGameStatus();
    }

    function handleAnswerSelection(selectedOption, correctOption) {
        const selectedBomb = bombs[selectedOption];
        if (selectedOption === correctOption) {
            console.log("Correct answer selected.");
            sounds.correct.play();
            score++;
            scoreEl.textContent = score;
            resetBombs();
            loadQuestion();
        } else {
            console.log("Incorrect answer selected.");
            triggerExplosion(selectedBomb); // Only triggers explosion, no life deduction
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
        void bomb.offsetWidth; // Trigger reflow
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
