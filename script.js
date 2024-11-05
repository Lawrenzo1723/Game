document.addEventListener("DOMContentLoaded", async () => {
    console.log("Game is loading...");

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
            console.log("Fetching questions...");
            const response = await fetch('https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/refs/heads/main/question%20in%20Json.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
            }
            questions = await response.json();
            console.log("Questions loaded successfully:", questions);
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
        if (questions.length === 0) {
            console.warn("No questions available to load.");
            return;
        }
        const questionData = questions[currentQuestionIndex];
        questionEl.textContent = questionData["Question"];
        optionsContainer.innerHTML = '';
        ['A', 'B', 'C', 'D'].forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = `${option}: ${questionData[`Option ${option}`]}`;
            optionText.addEventListener("click", () => handleAnswerSelection(option, questionData["Correct Answer"]));
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
            lifeIcon.src = "https://raw.githubusercontent.com/Lawrenzo1723/CAPM-Quizz/697de47588007abf1f402d1a8af4b5ddf3491d44/game/assets/images/Cat_life.png";
            livesContainer.appendChild(lifeIcon);
        }
        console.log("Lives updated:", lives);
    }

    function triggerExplosion() {
        gameContainer.classList.add("shake");
        let frame = 1;
        explosionAnimation.style.display = "block";
        const explosionInterval = setInterval(() => {
            explosionAnimation.style.backgroundImage = `url(https://github.com/Lawrenzo1723/Game/blob/56e7a26f1eaad69f937734143a85e3a8180aaa26/game/assets/explosions/Explosion${frame}.png)`;
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
        console.log("Bomb collided with cat. Lives left:", lives);

        if (lives > 0) {
            setTimeout(() => {
                resetBombs();
                loadQuestion();
            }, 500);
        }
    }

    function handleAnswerSelection(selectedOption, correctOption) {
        if (selectedOption === correctOption) {
            console.log("Correct answer selected.");
            sounds.correct.play();
            score++;
            scoreEl.textContent = score;
            resetBombs();
            loadQuestion();
        } else {
            console.log("Incorrect answer selected.");
            handleBombCollision();
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
        console.log("Game Over. Final score:", score);
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
            void bomb.offsetWidth; // Trigger reflow to reset animation
            bomb.style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;
        });
    }

    function startBombs() {
        Object.values(bombs).forEach(bomb => {
            bomb.style.animation = `moveToCenter ${gameSpeed / 1000}s linear forwards`;
        });
        console.log("Bombs started moving towards the cat.");
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
});
