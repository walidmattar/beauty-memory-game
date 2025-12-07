// ----------------- SCREEN SWITCHING -----------------
const dataEntryScreen = document.getElementById("dataEntryScreen");
const gameScreen = document.getElementById("gameScreen");
const winnerScreen = document.getElementById("winnerScreen");

const playerForm = document.getElementById("playerForm");
const playerDisplay = document.getElementById("playerDisplay");

playerForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("playerName").value;
    const email = document.getElementById("playerEmail").value;
    const phone = document.getElementById("playerPhone").value;

    currentPlayerName = name;

    // Show loading state
    const submitBtn = playerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    try {
        console.log("Sending player data to server...");
        const response = await fetch('/save-player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone })
        });

        const result = await response.json();
        console.log("Server response:", result);

        if (result.success) {
            console.log("✅ Player saved successfully");
            // Show success message briefly
            submitBtn.textContent = "✓ Saved!";
            submitBtn.style.backgroundColor = "#4CAF50";

            setTimeout(() => {
                playerDisplay.textContent = "Good luck, " + name + "!";
                dataEntryScreen.classList.remove("active");
                gameScreen.classList.add("active");
                startGame();

                // Reset button
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = "";
            }, 1000);
        } else {
            console.error("❌ Error saving player:", result.message);
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            alert("⚠️ Error saving data: " + result.message + "\n\nPlease check your internet connection or try again later.");
        }
    } catch (error) {
        console.error("❌ Network error saving player:", error);
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        alert("⚠️ Network error: Could not connect to server!\n\nPlease check your internet connection.\n\nError: " + error.message);
    }
});

// ----------------- GAME LOGIC -----------------
let moves = 0;
let pairs = 0;
let flippedCards = [];
let currentPlayerName = "";
const gameBoard = document.getElementById("gameBoard");

const images = [
    "images/product1.png",
    "images/product2.png",
    "images/product3.png",
    "images/product4.png",
    "images/product5.png",
    "images/product6.png"
];

function startGame() {
    moves = 0;
    pairs = 0;
    flippedCards = [];

    document.getElementById("movesCount").textContent = moves;
    document.getElementById("pairsCount").textContent = "0/6";

    let cards = [...images, ...images];
    cards.sort(() => Math.random() - 0.5);

    gameBoard.innerHTML = "";

    cards.forEach(src => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front">
                    <img src="${src}">
                </div>
                <div class="card-face card-back">
                    <img src="images/logo.png">
                </div>
            </div>
        `;

        card.addEventListener("click", () => flipCard(card));
        gameBoard.appendChild(card);
    });
}

function flipCard(card) {
    if (card.classList.contains("matched") || card.classList.contains("flipped")) return;
    if (flippedCards.length === 2) return;

    // Flip animation
    gsap.to(card.querySelector(".card-inner"), {
        rotateY: 180,
        duration: 0.6,
        ease: "back.out(1.7)"
    });

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) checkMatch();
}

function checkMatch() {
    moves++;
    document.getElementById("movesCount").textContent = moves;

    let [card1, card2] = flippedCards;
    let img1 = card1.querySelector(".card-front img").src;
    let img2 = card2.querySelector(".card-front img").src;

    if (img1 === img2) {
        // Match found

        // Wait for flip animation to finish before showing match effect
        setTimeout(() => {
            pairs++;
            document.getElementById("pairsCount").textContent = pairs + "/6";

            // Particle effect at center of cards
            createParticles(card1);
            createParticles(card2);

            // Animate disappearance
            card1.classList.add("matched");
            card2.classList.add("matched");

            flippedCards = [];

            if (pairs === 6) {
                setTimeout(showWinner, 1000);
            }
        }, 2000); // Wait 2000ms for flip
    } else {
        // No match
        setTimeout(() => {
            gsap.to(card1.querySelector(".card-inner"), { rotateY: 0, duration: 0.5 });
            gsap.to(card2.querySelector(".card-inner"), { rotateY: 0, duration: 0.5 });
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            flippedCards = [];
        }, 1000);
    }
}

// ----------------- PARTICLES -----------------
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.style.position = "fixed";
        particle.style.left = centerX + "px";
        particle.style.top = centerY + "px";
        particle.style.width = "8px";
        particle.style.height = "8px";
        particle.style.backgroundColor = ["#d81b60", "#d4af37", "#fce4ec"][Math.floor(Math.random() * 3)];
        particle.style.borderRadius = "50%";
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "1000";
        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 100;

        gsap.to(particle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => particle.remove()
        });
    }
}

// ----------------- WINNER & FIREWORKS -----------------
function showWinner() {
    gameScreen.classList.remove("active");
    winnerScreen.classList.add("active");
    document.getElementById("finalMoves").textContent = moves;
    document.getElementById("winnerName").textContent = currentPlayerName;
    startFireworks();
}

function startFireworks() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    function createFirework() {
        const x = Math.random() * canvas.width;
        const y = canvas.height;
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: x,
                y: y / 2 + Math.random() * 100, // Burst in upper half
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                alpha: 1,
                color: color
            });
        }
    }

    function animate() {
        if (!winnerScreen.classList.contains("active")) return;

        requestAnimationFrame(animate);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.05) createFirework();

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.alpha -= 0.01;

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();

            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    animate();
}

document.getElementById("playAgainBtn").addEventListener("click", () => {
    winnerScreen.classList.remove("active");
    dataEntryScreen.classList.add("active");

    // Reset Form
    document.getElementById("playerName").value = "";
    document.getElementById("playerEmail").value = "";
    document.getElementById("playerPhone").value = "";
});
