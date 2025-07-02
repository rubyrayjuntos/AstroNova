/**
 * InputHandler - Manages keyboard and touch input for the game
 */
class InputHandler {
    constructor() {
        this.state = {
            rotateLeft: false,
            rotateRight: false,
            thrust: false,
            fire: false
        };
        
        this.thrustSound = null;
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners for keyboard and touch input
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch events for mobile controls
        this.setupTouchControls();
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', e => e.preventDefault());
    }

    /**
     * Setup touch controls for mobile devices
     */
    setupTouchControls() {
        const touchControls = document.getElementById('touch-controls');
        if (!touchControls) return;

        const buttons = {
            'touch-left': 'rotateLeft',
            'touch-right': 'rotateRight',
            'touch-up': 'thrust',
            'touch-down': 'fire'
        };

        // Touch start events
        Object.keys(buttons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.state[buttons[buttonId]] = true;
                    this.handleThrustChange();
                });
                
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.state[buttons[buttonId]] = true;
                    this.handleThrustChange();
                });
            }
        });

        // Touch end events
        Object.keys(buttons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.state[buttons[buttonId]] = false;
                    this.handleThrustChange();
                });
                
                button.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.state[buttons[buttonId]] = false;
                    this.handleThrustChange();
                });
            }
        });
    }

    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'ArrowLeft':
                this.state.rotateLeft = true;
                break;
            case 'ArrowRight':
                this.state.rotateRight = true;
                break;
            case 'ArrowUp':
                this.state.thrust = true;
                this.handleThrustChange();
                break;
            case 'Space':
                event.preventDefault();
                this.state.fire = true;
                break;
        }
    }

    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        switch (event.code) {
            case 'ArrowLeft':
                this.state.rotateLeft = false;
                break;
            case 'ArrowRight':
                this.state.rotateRight = false;
                break;
            case 'ArrowUp':
                this.state.thrust = false;
                this.handleThrustChange();
                break;
            case 'Space':
                this.state.fire = false;
                break;
        }
    }

    /**
     * Handle thrust state changes for audio
     */
    handleThrustChange() {
        if (this.state.thrust && !this.thrustSound) {
            this.thrustSound = audioManager.playThrust();
        } else if (!this.state.thrust && this.thrustSound) {
            this.thrustSound.stop();
            this.thrustSound = null;
        }
    }

    /**
     * Get current input state
     * @returns {Object} - Current input state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Reset all input states
     */
    reset() {
        this.state = {
            rotateLeft: false,
            rotateRight: false,
            thrust: false,
            fire: false
        };
        
        if (this.thrustSound) {
            this.thrustSound.stop();
            this.thrustSound = null;
        }
    }
} 