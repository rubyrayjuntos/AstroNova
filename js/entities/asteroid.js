/**
 * Asteroid - Space rock entity with fragmentation mechanics and modern colors
 */
class Asteroid {
    constructor(x, y, size = 'large', velocity = null) {
        this.x = x;
        this.y = y;
        this.size = size; // 'large', 'medium', 'small'
        this.active = true;
        
        // Set size-specific properties
        this.setSizeProperties();
        
        // Set velocity (random if not provided)
        if (velocity) {
            this.velocity = velocity;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.baseSpeed + Math.random() * this.speedVariation;
            this.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
        }
        
        // Generate irregular shape
        this.generateShape();
        
        // Collision detection
        this.collisionPolygon = {
            points: this.shape
        };
    }

    /**
     * Set properties based on asteroid size
     */
    setSizeProperties() {
        switch (this.size) {
            case 'large':
                this.radius = 30;
                this.baseSpeed = 1;
                this.speedVariation = 1;
                this.points = 20;
                this.color = '#8D6E63'; // Brown
                this.glowColor = '#6D4C41';
                break;
            case 'medium':
                this.radius = 20;
                this.baseSpeed = 2;
                this.speedVariation = 1.5;
                this.points = 50;
                this.color = '#A1887F'; // Lighter brown
                this.glowColor = '#8D6E63';
                break;
            case 'small':
                this.radius = 10;
                this.baseSpeed = 3;
                this.speedVariation = 2;
                this.points = 100;
                this.color = '#BCAAA4'; // Lightest brown
                this.glowColor = '#A1887F';
                break;
        }
    }

    /**
     * Generate irregular polygon shape for the asteroid
     */
    generateShape() {
        this.shape = [];
        const numVertices = 8 + Math.floor(Math.random() * 4); // 8-11 vertices
        
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const radiusVariation = 0.7 + Math.random() * 0.6; // 70% to 130% of base radius
            const radius = this.radius * radiusVariation;
            
            this.shape.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
    }

    /**
     * Update asteroid position
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;

        const dt = deltaTime / 1000; // Convert to seconds
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Screen wrap
        this.wrapAround();
    }

    /**
     * Wrap asteroid around screen edges
     */
    wrapAround() {
        const canvas = document.getElementById('game-canvas');
        const width = canvas.width;
        const height = canvas.height;

        if (this.x < -this.radius) this.x = width + this.radius;
        if (this.x > width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = height + this.radius;
        if (this.y > height + this.radius) this.y = -this.radius;
    }

    /**
     * Render the asteroid with modern colors and effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw asteroid glow
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        
        ctx.closePath();
        ctx.stroke();

        // Draw asteroid body
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        
        ctx.closePath();
        ctx.stroke();

        // Fill asteroid with gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.glowColor);
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw surface details
        ctx.fillStyle = '#3E2723';
        ctx.globalAlpha = 0.6;
        
        // Add some random surface details
        for (let i = 0; i < 3; i++) {
            const detailX = (Math.random() - 0.5) * this.radius * 0.8;
            const detailY = (Math.random() - 0.5) * this.radius * 0.8;
            const detailSize = Math.random() * 2 + 0.5;
            
            ctx.beginPath();
            ctx.arc(detailX, detailY, detailSize, 0, Math.PI * 2);
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
     * Handle asteroid destruction and fragmentation
     * @returns {Array} - Array of new asteroids (if any)
     */
    destroy() {
        this.active = false;
        
        // Play appropriate explosion sound with color effects
        switch (this.size) {
            case 'large':
                audioManager.playExplosion('medium');
                break;
            case 'medium':
                audioManager.playExplosion('small');
                break;
            case 'small':
                audioManager.playExplosion('small');
                break;
        }

        // Create fragments if not small
        if (this.size !== 'small') {
            return this.createFragments();
        }
        
        return [];
    }

    /**
     * Create smaller asteroid fragments
     * @returns {Array} - Array of new asteroid instances
     */
    createFragments() {
        const fragments = [];
        const fragmentCount = 2;
        
        for (let i = 0; i < fragmentCount; i++) {
            // Calculate fragment velocity (inherit parent velocity + divergence)
            const divergenceAngle = (Math.PI * 2 * i) / fragmentCount;
            const divergenceSpeed = 1 + Math.random() * 2;
            
            const fragmentVelocity = {
                x: this.velocity.x + Math.cos(divergenceAngle) * divergenceSpeed,
                y: this.velocity.y + Math.sin(divergenceAngle) * divergenceSpeed
            };
            
            // Determine fragment size
            let fragmentSize;
            switch (this.size) {
                case 'large':
                    fragmentSize = 'medium';
                    break;
                case 'medium':
                    fragmentSize = 'small';
                    break;
                default:
                    continue;
            }
            
            // Create fragment
            const fragment = new Asteroid(this.x, this.y, fragmentSize, fragmentVelocity);
            fragments.push(fragment);
        }
        
        return fragments;
    }

    /**
     * Get points awarded for destroying this asteroid
     * @returns {number} - Points value
     */
    getPoints() {
        return this.points;
    }
} 