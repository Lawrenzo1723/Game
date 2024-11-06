document.addEventListener("DOMContentLoaded", async () => {
    console.log("Game initialized");

    const explosionFrames = [
        "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/explosions/Explosion1.png",
        "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/explosions/Explosion2.png",
        "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/explosions/Explosion3.png",
        "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/explosions/Explosion4.png",
        "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/explosions/Explosion5.png",
        "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/explosions/Explosion6.png"
    ];

    explosionFrames.forEach(src => {
        const img = new Image();
        img.src = src;
    });

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

    let gameSpeed = 30000;
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
            console.log("Questions loaded:", questions);
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    }

    function loadQuestion() {
        if (questions.length === 0) return;
        const questionData = questions[currentQuestionIndex];
        questionEl.textContent = questionData["Question"];
        console.log("Loaded question:", questionData["Question"]);

        const correctAnswerText = questionData["Correct Answer"].trim().toLowerCase();
        console.log("Correct answer for this question:", correctAnswerText);

        optionsContainer.innerHTML = '';
        Object.keys(bombs).forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`] || ''}`;
            optionText.addEventListener("click", () => handleAnswerSelection(option, correctAnswerText));
            optionsContainer.appendChild(optionText);

            resetBomb(bombs[option]);
            bombs[option].style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;
            bombs[option].onclick = () => handleAnswerSelection(option, correctAnswerText);
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
        let frame = 0;
        bomb.style.animation = "";
        bomb.src = explosionFrames[frame];
        bomb.style.width = "150px";

        const explosionInterval = setInterval(() => {
            frame++;
            if (frame < explosionFrames.length) {
                bomb.src = explosionFrames[frame];
            } else {
                clearInterval(explosionInterval);
                bomb.style.display = "none";
            }
        }, 100);
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

    function handleAnswerSelection(selectedOption, correctAnswerText) {
        const selectedBomb = bombs[selectedOption];
        const selectedAnswerText = document.querySelector(`#options p:nth-child(${selectedOption.charCodeAt(0) - 64})`).textContent.split(': ')[1].trim().toLowerCase();

        console.log("Selected answer text:", selectedAnswerText);
        console.log("Expected correct answer text:", correctAnswerText);

        if (selectedAnswerText === correctAnswerText) {
            sounds.correct.play();
            score++;
            scoreEl.textContent = score;
            console.log("Correct answer selected. Score updated:", score);
            lifeDeductedThisRound = false; // Reset life deduction
            loadNextQuestion();
        } else {
            console.log("Incorrect answer selected; triggering explosion on bomb.");
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
        void bomb.offsetWidth;
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
        lives = 9;
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
