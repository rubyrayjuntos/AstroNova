/**
 * Game - Main game class with state management and game loop
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.inputHandler = new InputHandler();
        
        // Game state
        this.state = 'START_SCREEN'; // START_SCREEN, GAMEPLAY, GAME_OVER
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Game entities
        this.ship = null;
        this.asteroids = [];
        this.ufos = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        
        // Game timing
        this.lastTime = 0;
        this.ufoSpawnTimer = 0;
        this.ufoSpawnInterval = 10000; // 10 seconds
        this.pulseTimer = 0;
        this.pulseInterval = 2000; // 2 seconds between pulses
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        
        this.setupEventListeners();
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('play-again-button').addEventListener('click', () => {
            this.startGame();
        });
    }

    /**
     * Initialize the game
     */
    init() {
        // Initialize audio
        audioManager.init();
        audioManager.loadSounds();
        
        // Start the game loop
        this.gameLoop();
    }

    /**
     * Start a new game
     */
    startGame() {
        this.state = 'GAMEPLAY';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Create player ship
        this.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2);
        
        // Clear all entities
        this.asteroids = [];
        this.ufos = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        
        // Spawn initial asteroids
        this.spawnAsteroids();
        
        // Reset timers
        this.ufoSpawnTimer = 0;
        this.pulseTimer = 0;
        
        // Update UI
        this.updateUI();
        this.showScreen('gameplay');
        
        // Resume audio context
        audioManager.resume();
    }

    /**
     * Main game loop using requestAnimationFrame
     * @param {number} timestamp - High resolution timestamp
     */
    gameLoop(timestamp = 0) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Update game state
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Update game logic
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        switch (this.state) {
            case 'GAMEPLAY':
                this.updateGameplay(deltaTime);
                break;
        }
    }

    /**
     * Update gameplay logic
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    updateGameplay(deltaTime) {
        // Get input state
        const input = this.inputHandler.getState();
        
        // Update ship
        if (this.ship && this.ship.active) {
            this.ship.update(deltaTime, input);
            
            // Handle firing
            if (input.fire && !this.ship.invulnerable) {
                const projectile = this.ship.fire();
                this.projectiles.push(projectile);
                audioManager.playSound('fire');
            }
        }
        
        // Update asteroids
        this.asteroids.forEach(asteroid => asteroid.update(deltaTime));
        
        // Update UFOs
        this.ufos.forEach(ufo => ufo.update(deltaTime, this.ship));
        
        // Update projectiles
        this.projectiles.forEach(projectile => projectile.update(deltaTime));
        this.enemyProjectiles.forEach(projectile => projectile.update(deltaTime));
        
        // Spawn UFOs
        this.ufoSpawnTimer += deltaTime;
        if (this.ufoSpawnTimer >= this.ufoSpawnInterval) {
            this.spawnUFO();
            this.ufoSpawnTimer = 0;
        }
        
        // Play pulse sound periodically
        this.pulseTimer += deltaTime;
        if (this.pulseTimer >= this.pulseInterval) {
            audioManager.playPulse();
            this.pulseTimer = 0;
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Clean up inactive entities
        this.cleanupEntities();
        
        // Check level completion
        this.checkLevelCompletion();
        
        // Check game over
        this.checkGameOver();
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.state) {
            case 'GAMEPLAY':
                this.renderGameplay();
                break;
        }
    }

    /**
     * Render gameplay elements
     */
    renderGameplay() {
        // Render ship
        if (this.ship && this.ship.active) {
            const input = this.inputHandler.getState();
            this.ship.render(this.ctx, input.thrust);
        }
        
        // Render asteroids
        this.asteroids.forEach(asteroid => asteroid.render(this.ctx));
        
        // Render UFOs
        this.ufos.forEach(ufo => ufo.render(this.ctx));
        
        // Render projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        this.enemyProjectiles.forEach(projectile => projectile.render(this.ctx));
    }

    /**
     * Check all collisions
     */
    checkCollisions() {
        // Player projectiles vs asteroids
        this.projectiles.forEach(projectile => {
            if (!projectile.active) return;
            
            this.asteroids.forEach(asteroid => {
                if (!asteroid.active) return;
                
                if (SAT.testPolygonPolygon(projectile.getCollisionPolygon(), asteroid.getCollisionPolygon())) {
                    // Destroy projectile and asteroid
                    projectile.destroy();
                    const fragments = asteroid.destroy();
                    this.score += asteroid.getPoints();
                    
                    // Add fragments to asteroids array
                    this.asteroids.push(...fragments);
                }
            });
        });
        
        // Player projectiles vs UFOs
        this.projectiles.forEach(projectile => {
            if (!projectile.active) return;
            
            this.ufos.forEach(ufo => {
                if (!ufo.active) return;
                
                if (SAT.testPolygonPolygon(projectile.getCollisionPolygon(), ufo.getCollisionPolygon())) {
                    // Destroy projectile and UFO
                    projectile.destroy();
                    ufo.destroy();
                    this.score += ufo.getPoints();
                }
            });
        });
        
        // Ship vs asteroids
        if (this.ship && this.ship.active && !this.ship.invulnerable) {
            this.asteroids.forEach(asteroid => {
                if (!asteroid.active) return;
                
                if (SAT.testPolygonPolygon(this.ship.getCollisionPolygon(), asteroid.getCollisionPolygon())) {
                    this.handleShipDestruction();
                }
            });
        }
        
        // Ship vs UFOs
        if (this.ship && this.ship.active && !this.ship.invulnerable) {
            this.ufos.forEach(ufo => {
                if (!ufo.active) return;
                
                if (SAT.testPolygonPolygon(this.ship.getCollisionPolygon(), ufo.getCollisionPolygon())) {
                    this.handleShipDestruction();
                }
            });
        }
        
        // Ship vs enemy projectiles
        if (this.ship && this.ship.active && !this.ship.invulnerable) {
            this.enemyProjectiles.forEach(projectile => {
                if (!projectile.active) return;
                
                if (SAT.testPolygonPolygon(this.ship.getCollisionPolygon(), projectile.getCollisionPolygon())) {
                    projectile.destroy();
                    this.handleShipDestruction();
                }
            });
        }
    }

    /**
     * Handle ship destruction
     */
    handleShipDestruction() {
        this.ship.destroy();
        this.lives--;
        this.updateUI();
        
        if (this.lives > 0) {
            // Respawn ship after delay
            setTimeout(() => {
                this.ship.respawn(this.canvas.width / 2, this.canvas.height / 2);
            }, 2000);
        }
    }

    /**
     * Clean up inactive entities
     */
    cleanupEntities() {
        this.asteroids = this.asteroids.filter(asteroid => asteroid.active);
        this.ufos = this.ufos.filter(ufo => ufo.active);
        this.projectiles = this.projectiles.filter(projectile => projectile.active);
        this.enemyProjectiles = this.enemyProjectiles.filter(projectile => projectile.active);
    }

    /**
     * Check if level is complete
     */
    checkLevelCompletion() {
        if (this.asteroids.length === 0 && this.ufos.length === 0) {
            this.level++;
            this.spawnAsteroids();
            this.ufoSpawnTimer = 0;
        }
    }

    /**
     * Check game over condition
     */
    checkGameOver() {
        if (this.lives <= 0) {
            this.state = 'GAME_OVER';
            this.showScreen('game-over');
            this.finalScoreElement.textContent = `Final Score: ${this.score}`;
        }
    }

    /**
     * Spawn asteroids for current level
     */
    spawnAsteroids() {
        const asteroidCount = Math.min(4 + this.level, 12); // Cap at 12 asteroids
        
        for (let i = 0; i < asteroidCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const asteroid = new Asteroid(x, y, 'large');
            this.asteroids.push(asteroid);
        }
    }

    /**
     * Spawn a UFO
     */
    spawnUFO() {
        if (this.ufos.length > 0) return; // Only one UFO at a time
        
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const x = side === 'left' ? -30 : this.canvas.width + 30;
        const y = Math.random() * this.canvas.height;
        
        const type = Math.random() < 0.7 ? 'large' : 'small';
        const ufo = new UFO(x, y, type);
        this.ufos.push(ufo);
        
        // Play spawn sound
        audioManager.playSound(type === 'large' ? 'ufo_lg_spawn' : 'ufo_sm_spawn');
    }

    /**
     * Add enemy projectile to the game
     * @param {Projectile} projectile - Enemy projectile
     */
    addEnemyProjectile(projectile) {
        this.enemyProjectiles.push(projectile);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.livesElement.textContent = `Lives: ${this.lives}`;
        
        // Award extra life every 10,000 points
        const extraLives = Math.floor(this.score / 10000);
        if (extraLives > 0 && this.lives < 3 + extraLives) {
            this.lives = 3 + extraLives;
            this.livesElement.textContent = `Lives: ${this.lives}`;
        }
    }

    /**
     * Show/hide screens
     * @param {string} screen - Screen to show
     */
    showScreen(screen) {
        this.startScreen.style.display = screen === 'start' ? 'block' : 'none';
        this.gameOverScreen.style.display = screen === 'game-over' ? 'block' : 'none';
    }
}

// Make game globally accessible for UFO projectiles
window.game = null; 