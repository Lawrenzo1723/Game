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

    const sounds = {
        explosion: document.getElementById("explosionSound"),
        correct: document.getElementById("correctAnswerSound"),
        music: document.getElementById("gameMusic")
    };

    let gameSpeed = 12000;
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
            console.log("Questions fetched successfully:", questions);
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    }

    function loadQuestion() {
        if (questions.length === 0) return;
        const questionData = questions[currentQuestionIndex];
        questionEl.textContent = questionData["Question"];
        console.log("Displaying question:", questionData["Question"]);

        optionsContainer.innerHTML = '';
        Object.keys(bombs).forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`] || ''}`;
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
        console.log("Lives updated:", lives);
    }

    function triggerExplosion(bomb) {
        console.log("Explosion triggered on bomb:", bomb);
        bomb.style.display = "none";
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
        lifeDeductedThisRound = true;
        console.log("Life lost due to collision. Lives remaining:", lives);
        updateLives();
        checkGameStatus();
    }

    function handleAnswerSelection(selectedOption, correctOption) {
        const selectedBomb = bombs[selectedOption];
        if (selectedOption === correctOption) {
            sounds.correct.play();
            score++;
            scoreEl.textContent = score;
            console.log("Correct answer selected. Score:", score);
            resetBombs();
            loadQuestion();
        } else {
            console.log("Incorrect answer selected, triggering explosion.");
            triggerExplosion(selectedBomb);
        }
    }

    function checkGameStatus() {
        if (lives <= 0) {
            gameOver();
        } else if (lifeDeductedThisRound) {
            // Proceed to the next question after a life is deducted due to a collision
            resetBombs();
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
        playButton.removeEventListener("click", startGame);
        playButton.addEventListener("click", resetGame);
    }

    function resetGame() {
        score = 0;
        lives = 9;
        currentQuestionIndex = 0;
        scoreEl.textContent = score;
        gameActive = true;
        console.log("Game reset. Starting new game.");

        updateLives();
        resetBombs();
        loadQuestion();
        playButton.style.display = "none";
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    // Define resetBomb function to reset the bomb's state and animation
    function resetBomb(bomb) {
        bomb.style.display = 'block';
        bomb.style.animation = 'none';
        void bomb.offsetWidth; // Trigger reflow to reset animation
        bomb.style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`; // Restart animation
    }

    function resetBombs() {
        Object.values(bombs).forEach(bomb => resetBomb(bomb));
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
    console.log("Music volume set and game music started.");
});
