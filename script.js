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
            const response = await fetch('https://raw.githubusercontent.com/Lawrenzo1723/Game/56e7a26f1eaad69f937734143a85e3a8180aaa26/game/assets/questions.json');
            if (!response.ok) {
                throw new Error("Failed to fetch questions");
            }
            questions = await response.json();
        } catch (error) {
            console.error("Error loading questions:", error);
            questions = [
                {
                    "Question": "Sample Question 1",
                    "Option A": "Answer A",
                    "Option B": "Answer B",
                    "Option C": "Answer C",
                    "Option D": "Answer D",
                    "Correct Answer": "A",
                    "Explanation": "Explanation for answer A"
                }
            ];
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
        startBombs();
    }

    function updateLives() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeIcon = document.createElement('img');
            lifeIcon.src = "https://raw.githubusercontent.com/Lawrenzo1723/Game/56e7a26f1eaad69f937734143a85e3a8180aaa26/game/assets/images/Cat_life.png";
            livesContainer.appendChild(lifeIcon);
        }
    }

    function triggerExplosion() {
        gameContainer.classList.add("shake");

        let frame = 1;
        explosionAnimation.style.display = "block";
        const explosionInterval = setInterval(() => {
            explosionAnimation.style.backgroundImage = `url(https://raw.githubusercontent.com/Lawrenzo1723/Game/56e7a26f1eaad69f937734143a85e3a8180aaa26/game/assets/explosions/Explosion${frame}.png)`;
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
        playButton.removeEventListener("click", startGame);
        playButton.addEventListener("click", resetGame);
    }

    function resetGame() {
        score = 0;
        lives = 9;
        currentQuestionIndex = 0;
        scoreEl.textContent = score;
        gameActive = true;
        lifeDeductedThisRound = false;

        updateLives();
        resetBombs();
        loadQuestion();

        playButton.style.display = "none";
        sounds.music.currentTime = 0;
        sounds.music.play();
    }

    function resetBombs() {
        Object.values(bombs).forEach(bomb => {
            bomb.style.animation = 'none';
            void bomb.offsetWidth;
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
        fetchQuestions().then(() => {
            resetGame();
            monitorBombs();
        });
    }

    playButton.addEventListener("click", startGame);

    sounds.music.volume = 0.5;
    sounds.music.play();
});
