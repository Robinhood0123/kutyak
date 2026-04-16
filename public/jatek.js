const modal = document.getElementById('game-modal');
const openBtn = document.getElementById('game-button');
const closeBtn = document.getElementById('close-game');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameActive = false;
let score = 0;
let animationId;
let player = { x: 0, lane: 1 }; 
let items = []; 
let speed = 4;
let lastSpawn = 0;

// Mobil swipe változók
let touchStartX = 0;

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Megnyitás/Bezárás
openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(resizeCanvas, 50);
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    stopGame(false);
});

// IRÁNYÍTÁS: NYILAK
window.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft' && player.lane > 0) player.lane--;
    if (e.key === 'ArrowRight' && player.lane < 2) player.lane++;
});

// IRÁNYÍTÁS: MOBIL SWIPE
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    if (!gameActive) return;
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 30) {
        if (diff > 0 && player.lane < 2) player.lane++;
        else if (diff < 0 && player.lane > 0) player.lane--;
    }
}, { passive: true });

function initGame() {
    gameActive = true;
    score = 0;
    speed = 4;
    items = [];
    player.lane = 1;
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    lastSpawn = Date.now();
    resizeCanvas();
    gameLoop();
}

function stopGame(showResult = true) {
    gameActive = false;
    cancelAnimationFrame(animationId);
    if(showResult) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        overlayTitle.innerText = "JÁTÉK VÉGE";
        overlayScore.innerText = `GYŰJTÖTT CSONTOK: ${score}`;
        startBtn.innerText = "ÚJRA";
    }
}

function spawnItem() {
    const lane = Math.floor(Math.random() * 3);
    const isBone = Math.random() > 0.3; 
    items.push({
        lane: lane,
        y: -50,
        type: isBone ? '🦴' : '🎾',
        size: isBone ? 40 : 35
    });
}

// SZÍNES JÁTÉK HÁTTÉR
function drawBackground() {
    // Égbolt
    ctx.fillStyle = '#bae6fd'; // Világoskék
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/3, 0); ctx.lineTo(canvas.width/3, canvas.height);
    ctx.moveTo(canvas.width*2/3, 0); ctx.lineTo(canvas.width*2/3, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fű az alján
    ctx.fillStyle = '#4ade80'; // Élénk zöld
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function drawPlayer() {
    const laneWidth = canvas.width / 3;
    const targetX = (player.lane * laneWidth) + (laneWidth / 2);
    player.x += (targetX - player.x) * 0.25;

    ctx.font = '50px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐕', player.x, canvas.height - 60);
}

function drawItems() {
    const laneWidth = canvas.width / 3;
    items.forEach((item, index) => {
        item.y += speed;
        const x = (item.lane * laneWidth) + (laneWidth / 2);
        ctx.font = `${item.size}px serif`;
        ctx.fillText(item.type, x, item.y);

        const dist = Math.hypot(x - player.x, item.y - (canvas.height - 60));
        if (dist < 40) {
            if (item.type === '🦴') {
                score++;
                items.splice(index, 1);
                speed += 0.05;
            } else {
                stopGame(true);
            }
        }
        if (item.y > canvas.height + 50) items.splice(index, 1);
    });
}

function gameLoop() {
    if (!gameActive) return;
    drawBackground();
    if (Date.now() - lastSpawn > Math.max(400, 1000 - (speed * 50))) {
        spawnItem();
        lastSpawn = Date.now();
    }
    drawItems();
    drawPlayer();

    ctx.fillStyle = '#c2410c'; // Narancsos-barna
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🦴 ${score}`, 20, 40);

    animationId = requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', initGame);
window.addEventListener('resize', resizeCanvas);

window.addEventListener('scroll', () => {

    const gameBtn = document.getElementById('game-button');

    if (window.scrollY > 100) {

        gameBtn.classList.add('btn-hidden');

    } else {

        gameBtn.classList.remove('btn-hidden');

    }

});
 