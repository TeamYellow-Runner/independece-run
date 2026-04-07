const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1080; canvas.height = 1920;

let gameState = 'START', currentLevel = 1, score = 0, playerHP = 3, bossHP = 10;
let playerLane = 1, selectedGender = 'm', gameSpeed = 15, frameCount = 0;
const images = {}, audio = {};

// Dein spezifischer Kanal-Link
const channelLink = "https://whatsapp.com/channel/0029Vakref7E50Uf6qbO6545";

function loadAssets() {
    const imgList = {
        bg1: 'bg_1.png', bg2: 'bg_2.png', bg3: 'bg_3.png', bg4: 'bg_4.png',
        runner_m: 'runner_m.png', runner_f: 'runner_f.png',
        agent: 'enemy_agent.png', boss: 'boss_ceo.png',
        gate: 'item_gate.png', barrier: 'barrier_check.png',
        proj_syn: 'proj_syn.png', proj_ty: 'proj_ty.png',
        sc_start: 'sc_start.png', sc_gameover: 'sc_gameover.png', sc_victory: 'sc_victory.png',
        ui_hp: 'ui_hp.png', ui_score: 'ui_score.png', fx_shadow: 'fx_shadow.png'
    };
    for (let key in imgList) { images[key] = new Image(); images[key].src = imgList[key]; }
    audio.main = new Audio('music_main_loop.mp3');
    audio.win = new Audio('music_victory.mp3');
    audio.lose = new Audio('music_gameover.mp3');
    audio.main.loop = true;
}
loadAssets();

let obstacles = [], projectiles = [], backgroundY = 0;

class Obstacle {
    constructor(type) {
        this.type = type; this.lane = Math.floor(Math.random() * 3);
        this.y = -200; this.width = 250; this.height = 250;
    }
    update() { this.y += gameSpeed; }
    draw() {
        let img = this.type === 'gate' ? images.gate : (this.type === 'agent' ? images.agent : images.proj_syn);
        if (img.complete) ctx.drawImage(img, 360 * this.lane + 55, this.y, this.width, this.height);
    }
}

function startGame() { 
    gameState = 'PLAYING'; score = 0; currentLevel = 1; 
    audio.main.play().catch(() => {}); 
}

// Funktion zum Teilen auf WhatsApp
function shareGame() {
    const gameUrl = window.location.href; // Holt sich automatisch den Link zu deinem GitHub-Spiel
    const shareText = `🚀 *Independence Run: Team Yellow braucht DICH!* 🚀\n\nIch habe gerade den Endboss besiegt! 🏆 Aber wahre Eigenständigkeit erreichen wir nur als Team. Bist du dabei?\n\nSpiel hier mit: ${gameUrl}\n\nGemeinsam sind wir unschlagbar! 💪🟨`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
}

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (gameState === 'START') { 
        // Bereich oben: Spielerwahl
        if (y < 1600) {
            if (x < 540) selectedGender = 'm'; else selectedGender = 'f'; 
            startGame(); 
        } 
        // Bereich unten: Kanal beitreten
        else { window.open(channelLink, '_blank'); }
    }
    else if (gameState === 'BOSS') { 
        projectiles.push({lane: playerLane, y: 1500}); 
    }
    else if (gameState === 'GAMEOVER') {
        if (y > 1400 && y < 1600) location.reload(); // Versuche es nochmal
        if (y > 1650) window.open(channelLink, '_blank'); // Kanal beitreten
    }
    else if (gameState === 'VICTORY') {
        if (y > 1150 && y < 1350) shareGame(); // Link zum Spiel teilen
        if (y > 1400 && y < 1600) location.reload(); // Wiederholen
        if (y > 1650) window.open(channelLink, '_blank'); // Kanal beitreten
    }
});

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && playerLane > 0) playerLane--;
    if (e.key === 'ArrowRight' && playerLane < 2) playerLane++;
    if (e.key === ' ' && gameState === 'BOSS') projectiles.push({lane: playerLane, y: 1500});
});

function update() {
    if (gameState === 'PLAYING' || gameState === 'BOSS') {
        backgroundY = (backgroundY + gameSpeed/2) % 1920;
        frameCount++;
        if (frameCount % 60 === 0) obstacles.push(new Obstacle(gameState === 'BOSS' ? 'arrow' : (Math.random() > 0.4 ? 'gate' : 'agent')));
        obstacles.forEach((obj, i) => {
            obj.update();
            if (obj.y > 1400 && obj.y < 1700 && obj.lane === playerLane) {
                if (obj.type === 'gate') { score += 20; obstacles.splice(i, 1); }
                else if (obj.type === 'agent') { score = Math.max(0, score - 10); obstacles.splice(i, 1); }
                else if (obj.type === 'arrow') { playerHP--; obstacles.splice(i, 1); if(playerHP <= 0) { gameState = 'GAMEOVER'; audio.main.pause(); audio.lose.play(); } }
            }
            if (obj.y > 2000) obstacles.splice(i, 1);
        });
        projectiles.forEach((p, i) => {
            p.y -= 30;
            if (p.y < 300) { bossHP--; projectiles.splice(i, 1); if(bossHP <= 0) { gameState = 'VICTORY'; audio.main.pause(); audio.win.play(); } }
        });
        if (gameState === 'PLAYING') {
            if (score >= 100 && currentLevel === 1) currentLevel = 2;
            else if (score >= 250 && currentLevel === 2) currentLevel = 3;
            else if (score >= 500 && currentLevel === 3) { gameState = 'BOSS'; playerHP = 3; }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameState === 'START') {
        if(images.sc_start.complete) ctx.drawImage(images.sc_start, 0, 0, 1080, 1920);
    } else if (gameState === 'PLAYING' || gameState === 'BOSS') {
        let bg = gameState === 'BOSS' ? images.bg4 : images['bg' + currentLevel];
        if(bg && bg.complete) {
            ctx.drawImage(bg, 0, backgroundY, 1080, 1920);
            ctx.drawImage(bg, 0, backgroundY - 1920, 1080, 1920);
        }
        if(images.fx_shadow.complete) ctx.drawImage(images.fx_shadow, 360 * playerLane + 80, 1650, 200, 100);
        let runnerImg = selectedGender === 'm' ? images.runner_m : images.runner_f;
        if(runnerImg.complete) ctx.drawImage(runnerImg, 360 * playerLane + 50, 1400, 260, 320);
        obstacles.forEach(o => o.draw());
        projectiles.forEach(p => {
            if(images.proj_ty.complete) ctx.drawImage(images.proj_ty, 360 * p.lane + 130, p.y, 100, 200);
        });
        if (gameState === 'PLAYING') {
            if(images.ui_score.complete) ctx.drawImage(images.ui_score, 50, 50, 400, 150);
            ctx.fillStyle = "black"; ctx.font = "bold 60px Arial"; ctx.fillText(score, 280, 145);
        } else {
            if(images.ui_hp.complete) ctx.drawImage(images.ui_hp, 50, 50, 400, 150);
            ctx.fillStyle = "red"; ctx.font = "bold 60px Arial"; ctx.fillText(playerHP, 280, 145);
        }
    } else if (gameState === 'GAMEOVER') {
        if(images.sc_gameover.complete) ctx.drawImage(images.sc_gameover, 0, 0, 1080, 1920);
    } else if (gameState === 'VICTORY') {
        if(images.sc_victory.complete) ctx.drawImage(images.sc_victory, 0, 0, 1080, 1920);
    }
    requestAnimationFrame(draw);
}
setInterval(update, 1000/60); draw();
