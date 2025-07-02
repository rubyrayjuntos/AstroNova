/**
 * Projectile - Player bullet entity with modern visual effects
 */
class Projectile {
    constructor(x, y, angle, speed = 500) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.lifetime = 1000; // 1 second
        this.age = 0;
        this.active = true;
        
        // Collision detection
        this.collisionPolygon = {
            points: [
                { x: -2, y: -1 },
                { x: 2, y: -1 },
                { x: 2, y: 1 },
                { x: -2, y: 1 }
            ]
        };
    }

    /**
     * Update projectile position and lifetime
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update position
        this.x += this.velocity.x * (deltaTime / 1000);
        this.y += this.velocity.y * (deltaTime / 1000);

        // Update age
        this.age += deltaTime;

        // Check lifetime
        if (this.age >= this.lifetime) {
            this.active = false;
        }

        // Screen wrap
        this.wrapAround();
    }

    /**
     * Wrap projectile around screen edges
     */
    wrapAround() {
        const canvas = document.getElementById('game-canvas');
        const width = canvas.width;
        const height = canvas.height;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    /**
     * Render the projectile with modern colors and effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Calculate fade based on age
        const fade = 1 - (this.age / this.lifetime);
        
        // Draw projectile trail (glow effect)
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.3})`;
        ctx.lineWidth = 6;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Draw main projectile body
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();

        // Draw projectile tip with color
        ctx.strokeStyle = `rgba(255, 235, 59, ${fade})`; // Yellow tip
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFEB3B';
        ctx.shadowBlur = 3;
        
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Get collision polygon in world coordinates
     * @returns {Object} - Collision polygon with world coordinates
     */
    getCollisionPolygon() {
        const worldPoints = this.collisionPolygon.points.map(point => ({
            x: this.x + point.x,
            y: this.y + point.y
        }));

        return {
            points: worldPoints
        };
    }

    /**
     * Mark projectile as destroyed
     */
    destroy() {
        this.active = false;
    }
} 