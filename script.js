function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'START') {
        if(images.sc_start.complete) ctx.drawImage(images.sc_start, 0, 0, 1080, 1920);
    } else if (gameState === 'PLAYING' || gameState === 'BOSS') {
        // Hintergrund zeichnen
        let bg = gameState === 'BOSS' ? images.bg4 : images['bg' + currentLevel];
        if(bg && bg.complete) {
            ctx.drawImage(bg, 0, backgroundY, 1080, 1920);
            ctx.drawImage(bg, 0, backgroundY - 1920, 1080, 1920);
        }

        // --- NEU: BOSS ZEICHNEN ---
        if (gameState === 'BOSS' && images.boss.complete) {
            // Zeichnet den Boss oben mittig am Horizont
            ctx.drawImage(images.boss, 340, 150, 400, 400); 
            
            // Boss Lebensbalken (Hintergrund grau, Vordergrund rot)
            ctx.fillStyle = "gray"; ctx.fillRect(340, 120, 400, 20);
            ctx.fillStyle = "red"; ctx.fillRect(340, 120, 40 * bossHP, 20);
        }

        // Schatten & Runner
        if(images.fx_shadow.complete) ctx.drawImage(images.fx_shadow, 360 * playerLane + 80, 1650, 200, 100);
        let runnerImg = selectedGender === 'm' ? images.runner_m : images.runner_f;
        if(runnerImg.complete) ctx.drawImage(runnerImg, 360 * playerLane + 50, 1400, 260, 320);

        // Hindernisse & Projektile
        obstacles.forEach(o => o.draw());
        projectiles.forEach(p => {
            if(images.proj_ty.complete) ctx.drawImage(images.proj_ty, 360 * p.lane + 130, p.y, 100, 200);
        });

        // UI (Punkte oder HP)
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
