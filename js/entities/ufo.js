/**
 * UFO - Enemy flying saucer entity with AI behavior and modern colors
 */
class UFO {
    constructor(x, y, type = 'large') {
        this.x = x;
        this.y = y;
        this.type = type; // 'large' or 'small'
        this.active = true;
        this.velocity = { x: 0, y: 0 };
        this.fireCooldown = 0;
        this.direction = Math.random() < 0.5 ? 1 : -1; // Left or right movement
        
        // Set type-specific properties
        this.setTypeProperties();
        
        // Generate saucer shape
        this.generateShape();
        
        // Collision detection
        this.collisionPolygon = {
            points: this.shape
        };
        
        // AI state
        this.lastFireTime = 0;
        this.targetAngle = 0;
        
        // Animation state
        this.animationTime = 0;
    }

    /**
     * Set properties based on UFO type
     */
    setTypeProperties() {
        switch (this.type) {
            case 'large':
                this.width = 30;
                this.height = 15;
                this.speed = 2;
                this.fireRate = 2000; // 2 seconds between shots
                this.points = 200;
                this.accuracy = 0.3; // Poor accuracy
                this.color = '#9C27B0'; // Purple
                this.glowColor = '#7B1FA2';
                this.lightColor = '#FFEB3B'; // Yellow lights
                break;
            case 'small':
                this.width = 20;
                this.height = 10;
                this.speed = 4;
                this.fireRate = 1000; // 1 second between shots
                this.points = 1000;
                this.accuracy = 0.8; // Good accuracy
                this.color = '#F44336'; // Red
                this.glowColor = '#D32F2F';
                this.lightColor = '#FF5722'; // Orange lights
                break;
        }
    }

    /**
     * Generate saucer shape
     */
    generateShape() {
        if (this.type === 'large') {
            // Large saucer shape
            this.shape = [
                { x: -this.width/2, y: 0 },
                { x: -this.width/3, y: -this.height/2 },
                { x: this.width/3, y: -this.height/2 },
                { x: this.width/2, y: 0 },
                { x: this.width/3, y: this.height/2 },
                { x: -this.width/3, y: this.height/2 }
            ];
        } else {
            // Small saucer shape
            this.shape = [
                { x: -this.width/2, y: 0 },
                { x: -this.width/4, y: -this.height/2 },
                { x: this.width/4, y: -this.height/2 },
                { x: this.width/2, y: 0 },
                { x: this.width/4, y: this.height/2 },
                { x: -this.width/4, y: this.height/2 }
            ];
        }
    }

    /**
     * Update UFO position and AI behavior
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Ship} playerShip - Player ship for targeting
     */
    update(deltaTime, playerShip) {
        if (!this.active) return;

        const dt = deltaTime / 1000; // Convert to seconds

        // Update fire cooldown
        this.fireCooldown += deltaTime;

        // Update animation time
        this.animationTime += deltaTime;

        // Movement
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Screen wrap
        this.wrapAround();

        // AI behavior
        this.updateAI(deltaTime, playerShip);

        // Fire projectiles
        this.tryFire(deltaTime, playerShip);
    }

    /**
     * Update AI behavior
     * @param {number} deltaTime - Time since last frame
     * @param {Ship} playerShip - Player ship for targeting
     */
    updateAI(deltaTime, playerShip) {
        if (!playerShip || !playerShip.active) return;

        // Calculate distance to player
        const dx = playerShip.x - this.x;
        const dy = playerShip.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.type === 'large') {
            // Large UFO: Random movement with occasional shots
            this.velocity.x = this.direction * this.speed;
            this.velocity.y = Math.sin(Date.now() * 0.001) * this.speed * 0.5;
            
            // Change direction occasionally
            if (Math.random() < 0.005) {
                this.direction *= -1;
            }
        } else {
            // Small UFO: Target player with improved accuracy
            const targetAngle = Math.atan2(dy, dx);
            
            // Add some randomness based on accuracy
            const accuracyRandom = (Math.random() - 0.5) * (1 - this.accuracy) * Math.PI;
            this.targetAngle = targetAngle + accuracyRandom;
            
            // Move towards player
            this.velocity.x = Math.cos(this.targetAngle) * this.speed;
            this.velocity.y = Math.sin(this.targetAngle) * this.speed;
        }
    }

    /**
     * Try to fire at the player
     * @param {number} deltaTime - Time since last frame
     * @param {Ship} playerShip - Player ship for targeting
     */
    tryFire(deltaTime, playerShip) {
        if (!playerShip || !playerShip.active) return;
        if (this.fireCooldown < this.fireRate) return;

        // Calculate angle to player
        const dx = playerShip.x - this.x;
        const dy = playerShip.y - this.y;
        let fireAngle = Math.atan2(dy, dx);

        // Add accuracy variation
        if (this.type === 'large') {
            // Large UFO: Poor accuracy
            fireAngle += (Math.random() - 0.5) * Math.PI * 0.5;
        } else {
            // Small UFO: Better accuracy but still some variation
            fireAngle += (Math.random() - 0.5) * Math.PI * 0.2;
        }

        // Create projectile
        const projectile = new Projectile(this.x, this.y, fireAngle, 300);
        projectile.isEnemy = true; // Mark as enemy projectile
        
        // Reset cooldown
        this.fireCooldown = 0;
        this.lastFireTime = Date.now();

        // Add to game's enemy projectiles (will be handled by game class)
        if (window.game && window.game.addEnemyProjectile) {
            window.game.addEnemyProjectile(projectile);
        }
    }

    /**
     * Wrap UFO around screen edges
     */
    wrapAround() {
        const canvas = document.getElementById('game-canvas');
        const width = canvas.width;
        const height = canvas.height;

        if (this.x < -this.width) this.x = width + this.width;
        if (this.x > width + this.width) this.x = -this.width;
        if (this.y < -this.height) this.y = height + this.height;
        if (this.y > height + this.height) this.y = -this.height;
    }

    /**
     * Render the UFO with modern colors and effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Calculate pulsing effect for lights
        const pulse = Math.sin(this.animationTime * 0.01) * 0.3 + 0.7;

        // Draw UFO glow
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        
        ctx.closePath();
        ctx.stroke();

        // Draw UFO body
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        
        ctx.closePath();
        ctx.stroke();

        // Fill UFO body with gradient
        const gradient = ctx.createLinearGradient(-this.width/2, -this.height/2, this.width/2, this.height/2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.glowColor);
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw top dome
        const domeColor = this.type === 'large' ? '#E1BEE7' : '#FFCDD2';
        ctx.fillStyle = domeColor;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        if (this.type === 'large') {
            ctx.ellipse(0, -5, 15, 5, 0, 0, Math.PI * 2);
        } else {
            ctx.ellipse(0, -3, 10, 3, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Draw cockpit
        ctx.fillStyle = this.type === 'large' ? '#F3E5F5' : '#FFEBEE';
        ctx.strokeStyle = this.glowColor;
        
        ctx.beginPath();
        if (this.type === 'large') {
            ctx.ellipse(0, -5, 8, 3, 0, 0, Math.PI * 2);
        } else {
            ctx.ellipse(0, -3, 5, 2, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Draw animated lights
        ctx.fillStyle = `rgba(255, 235, 59, ${pulse})`; // Pulsing yellow
        ctx.shadowColor = '#FFEB3B';
        ctx.shadowBlur = 8;
        
        if (this.type === 'large') {
            ctx.beginPath();
            ctx.arc(-15, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(15, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `rgba(76, 175, 80, ${pulse})`; // Pulsing green
            ctx.shadowColor = '#4CAF50';
            
            ctx.beginPath();
            ctx.arc(-8, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(8, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = `rgba(255, 87, 34, ${pulse})`; // Pulsing orange
            ctx.shadowColor = '#FF5722';
            
            ctx.beginPath();
            ctx.arc(-12, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(12, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `rgba(255, 193, 7, ${pulse})`; // Pulsing amber
            ctx.shadowColor = '#FFC107';
            
            ctx.beginPath();
            ctx.arc(-6, 0, 1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(6, 0, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Get collision polygon in world coordinates
     * @returns {Object} - Collision polygon with world coordinates
     */
    getCollisionPolygon() {
        const worldPoints = this.shape.map(point => ({
            x: this.x + point.x,
            y: this.y + point.y
        }));

        return {
            points: worldPoints
        };
    }

    /**
     * Handle UFO destruction
     */
    destroy() {
        this.active = false;
        audioManager.playExplosion('medium');
    }

    /**
     * Get points awarded for destroying this UFO
     * @returns {number} - Points value
     */
    getPoints() {
        return this.points;
    }
} 