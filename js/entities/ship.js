/**
 * Ship - Player spaceship entity with classic Asteroids physics
 * Now with modern colors and visual effects
 */
class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = -Math.PI / 2; // Start pointing up (like original Asteroids)
        this.velocity = { x: 0, y: 0 };
        this.active = true;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 3000; // 3 seconds
        
        // Physics constants (as specified in the technical spec)
        this.ROTATION_SPEED = 3.5; // radians per second
        this.THRUST = 5; // pixels per second squared
        this.MAX_SPEED = 7; // pixels per second
        this.FRICTION = 0.97; // velocity decay per frame
        
        // Ship shape (triangle) - nose points up (negative Y)
        this.shape = [
            { x: 0, y: -10 },   // Nose (points up)
            { x: -8, y: 8 },    // Bottom left
            { x: 8, y: 8 }      // Bottom right
        ];
        
        // Collision detection
        this.collisionPolygon = {
            points: this.shape
        };
        
        // Thrust flame shape
        this.thrustShape = [
            { x: -4, y: 8 },
            { x: 0, y: 12 },
            { x: 4, y: 8 }
        ];
    }

    /**
     * Update ship physics and state
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Object} input - Current input state
     */
    update(deltaTime, input) {
        if (!this.active) return;

        const dt = deltaTime / 1000; // Convert to seconds

        // Handle rotation
        if (input.rotateLeft) {
            this.angle -= this.ROTATION_SPEED * dt;
        }
        if (input.rotateRight) {
            this.angle += this.ROTATION_SPEED * dt;
        }

        // Handle thrust
        if (input.thrust) {
            const thrustX = Math.cos(this.angle) * this.THRUST * dt;
            const thrustY = Math.sin(this.angle) * this.THRUST * dt;
            
            this.velocity.x += thrustX;
            this.velocity.y += thrustY;
        }

        // Apply friction
        this.velocity.x *= this.FRICTION;
        this.velocity.y *= this.FRICTION;

        // Limit maximum speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.MAX_SPEED) {
            this.velocity.x = (this.velocity.x / speed) * this.MAX_SPEED;
            this.velocity.y = (this.velocity.y / speed) * this.MAX_SPEED;
        }

        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Screen wrap
        this.wrapAround();

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime += deltaTime;
            if (this.invulnerabilityTime >= this.invulnerabilityDuration) {
                this.invulnerable = false;
                this.invulnerabilityTime = 0;
            }
        }
    }

    /**
     * Wrap ship around screen edges
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
     * Render the ship with modern colors and effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {boolean} thrusting - Whether the ship is currently thrusting
     */
    render(ctx, thrusting = false) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw thrust flame if thrusting
        if (thrusting) {
            // Outer flame (orange)
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#FF9800';
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.moveTo(this.thrustShape[0].x, this.thrustShape[0].y);
            ctx.lineTo(this.thrustShape[1].x, this.thrustShape[1].y);
            ctx.lineTo(this.thrustShape[2].x, this.thrustShape[2].y);
            ctx.stroke();

            // Inner flame (yellow)
            ctx.strokeStyle = '#FFEB3B';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#FFEB3B';
            ctx.shadowBlur = 5;
            
            ctx.beginPath();
            ctx.moveTo(this.thrustShape[0].x * 0.7, this.thrustShape[0].y * 0.7);
            ctx.lineTo(this.thrustShape[1].x * 0.7, this.thrustShape[1].y * 0.7);
            ctx.lineTo(this.thrustShape[2].x * 0.7, this.thrustShape[2].y * 0.7);
            ctx.stroke();
        }

        // Draw ship body with modern colors
        ctx.strokeStyle = '#4FC3F7'; // Blue outline
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4FC3F7';
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        ctx.lineTo(this.shape[1].x, this.shape[1].y);
        ctx.lineTo(this.shape[2].x, this.shape[2].y);
        ctx.closePath();
        ctx.stroke();

        // Fill ship body with gradient
        const gradient = ctx.createLinearGradient(0, -10, 0, 8);
        gradient.addColorStop(0, '#29B6F6'); // Light blue
        gradient.addColorStop(1, '#0288D1'); // Dark blue
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw cockpit
        ctx.fillStyle = '#E3F2FD';
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 3;
        
        ctx.beginPath();
        ctx.arc(0, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw invulnerability effect
        if (this.invulnerable) {
            const alpha = Math.sin(this.invulnerabilityTime * 0.01) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Get collision polygon in world coordinates
     * @returns {Object} - Collision polygon with world coordinates
     */
    getCollisionPolygon() {
        const worldPoints = this.collisionPolygon.points.map(point => ({
            x: this.x + point.x * Math.cos(this.angle) - point.y * Math.sin(this.angle),
            y: this.y + point.x * Math.sin(this.angle) + point.y * Math.cos(this.angle)
        }));

        return {
            points: worldPoints
        };
    }

    /**
     * Fire a projectile
     * @returns {Projectile} - New projectile instance
     */
    fire() {
        // Fire from the nose of the ship (front tip)
        // Use the actual nose coordinates from the ship shape
        const noseX = this.x + this.shape[0].x * Math.cos(this.angle) - this.shape[0].y * Math.sin(this.angle);
        const noseY = this.y + this.shape[0].x * Math.sin(this.angle) + this.shape[0].y * Math.cos(this.angle);
        return new Projectile(noseX, noseY, this.angle);
    }

    /**
     * Handle ship destruction
     */
    destroy() {
        this.active = false;
        audioManager.playExplosion('large');
    }

    /**
     * Respawn the ship
     * @param {number} x - New x position
     * @param {number} y - New y position
     */
    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.angle = -Math.PI / 2;
        this.velocity = { x: 0, y: 0 };
        this.active = true;
        this.invulnerable = true;
        this.invulnerabilityTime = 0;
    }
} 