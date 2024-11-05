document.addEventListener("DOMContentLoaded", async () => {
    console.log("Game initialized");

    const questionEl = document.getElementById("question");
    const optionsContainer = document.getElementById("options");
    const bombs = {
        A: document.getElementById("bombA"),
        B: document.getElementById("bombB"),
        C: document.getElementById("bombC"),
        D: document.getElementById("bombD"),
    };
    const scoreEl = document.getElementById("score");
    const livesContainer = document.getElementById("lives-container");
    const playButton = document.getElementById("play-button");

    const sounds = {
        explosion: document.getElementById("explosionSound"),
        correct: document.getElementById("correctAnswerSound"),
        music: document.getElementById("gameMusic")
    };

    let gameSpeed = 10000;
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let lives = 3;
    let gameActive = false;
    let lifeDeductedThisRound = false;

    async function fetchQuestions() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/refs/heads/main/question%20in%20Json.json');
            questions = await response.json();
            console.log("Questions loaded:", questions);
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    }

    function loadQuestion() {
        if (questions.length === 0) return;
        const questionData = questions[currentQuestionIndex];
        questionEl.textContent = questionData["Question"];
        console.log("Question loaded:", questionData["Question"]);

        optionsContainer.innerHTML = '';
        Object.keys(bombs).forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`] || ''}`;
            optionText.addEventListener("click", () => handleAnswerSelection(option, questionData["Correct Answer"]));
            optionsContainer.appendChild(optionText);

            resetBomb(bombs[option]);
            bombs[option].style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;

            // Ensure each bomb is clickable for answer selection
            bombs[option].onclick = () => handleAnswerSelection(option, questionData["Correct Answer"]);
        });

        lifeDeductedThisRound = false;
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
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
        sounds.explosion.play();
    }

    function handleBombCollision(bomb) {
        if (lifeDeductedThisRound) {
            console.log("Life already deducted for this round; no further deductions.");
            return;
        }

        lives--;
        lifeDeductedThisRound = true;
        console.log("Life lost due to bomb collision. Remaining lives:", lives);
        updateLives();
        checkGameStatus();
    }

    function handleAnswerSelection(selectedOption, correctOption) {
        const selectedBomb = bombs[selectedOption];
        if (selectedOption === correctOption) {
            sounds.correct.play();
            score++;
            scoreEl.textContent = score;
            console.log("Correct answer selected. Score updated:", score);
            loadNextQuestion();
        } else {
            console.log("Incorrect answer; triggering explosion on bomb.");
            triggerExplosion(selectedBomb);
        }
    }

    function checkGameStatus() {
        if (lives <= 0) {
            gameOver();
        } else if (lifeDeductedThisRound) {
            loadNextQuestion();
        }
    }

    function gameOver() {
        gameActive = false;
        sounds.music.pause();
        alert("Game Over! Your final score: " + score);
    }

    function loadNextQuestion() {
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        resetBombs();
        loadQuestion();
    }

    function resetBomb(bomb) {
        bomb.style.display = 'block';
        bomb.style.animation = 'none';
        void bomb.offsetWidth; // Trigger reflow to reset animation
        bomb.style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;
        bomb.addEventListener("animationend", () => handleBombCollision(bomb), { once: true });
    }

    function resetBombs() {
        Object.values(bombs).forEach(bomb => resetBomb(bomb));
    }

    function startGame() {
        fetchQuestions().then(() => {
            resetGame();
            Object.values(bombs).forEach(bomb => bomb.addEventListener("animationend", () => handleBombCollision(bomb), { once: true }));
        });
    }

    function resetGame() {
        score = 0;
        lives = 3;
        currentQuestionIndex = 0;
        scoreEl.textContent = score;
        gameActive = true;
        updateLives();
        loadQuestion();
        playButton.style.display = "none";
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    playButton.addEventListener("click", startGame);
    sounds.music.volume = 0.5;
});
