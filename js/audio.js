/**
 * AudioManager - Web Audio API manager for game sound effects
 * Now with modern, colorful sound generation
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.initialized = false;
        this.generator = null;
    }

    /**
     * Initialize the audio context (must be called after user interaction)
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generator = new AudioGenerator();
            this.initialized = true;
            console.log('Audio context initialized with modern sound generator');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    /**
     * Resume audio context if suspended
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Generate modern sound effects using the AudioGenerator
     * @param {string} type - Type of sound to generate
     * @returns {AudioBuffer} - Generated audio buffer
     */
    generateModernSound(type) {
        if (!this.generator) return null;

        switch (type) {
            case 'fire':
                return this.generator.generateFireSound();
            case 'thrust':
                return this.generator.generateThrustSound();
            case 'explode_sm':
                return this.generator.generateExplosionSound('small');
            case 'explode_md':
                return this.generator.generateExplosionSound('medium');
            case 'explode_lg':
                return this.generator.generateExplosionSound('large');
            case 'ufo_lg_spawn':
                return this.generator.generateUFOSpawnSound('large');
            case 'ufo_sm_spawn':
                return this.generator.generateUFOSpawnSound('small');
            case 'pulse':
                return this.generator.generatePulseSound();
            default:
                return this.generator.generateFireSound();
        }
    }

    /**
     * Generate a simple sound effect using Web Audio API (fallback)
     * @param {string} type - Type of sound to generate
     * @returns {AudioBuffer} - Generated audio buffer
     */
    generateSimpleSound(type) {
        if (!this.audioContext) return null;

        const sampleRate = this.audioContext.sampleRate;
        let duration, frequency, volume;

        switch (type) {
            case 'fire':
                duration = 0.1;
                frequency = 800;
                volume = 0.3;
                break;
            case 'thrust':
                duration = 0.2;
                frequency = 200;
                volume = 0.2;
                break;
            case 'explode_sm':
                duration = 0.15;
                frequency = 400;
                volume = 0.4;
                break;
            case 'explode_md':
                duration = 0.25;
                frequency = 300;
                volume = 0.5;
                break;
            case 'explode_lg':
                duration = 0.4;
                frequency = 150;
                volume = 0.6;
                break;
            case 'ufo_lg_spawn':
                duration = 0.3;
                frequency = 600;
                volume = 0.3;
                break;
            case 'ufo_sm_spawn':
                duration = 0.2;
                frequency = 1000;
                volume = 0.4;
                break;
            default:
                duration = 0.1;
                frequency = 440;
                volume = 0.3;
        }

        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5); // Exponential decay
            data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
        }

        return buffer;
    }

    /**
     * Pre-load all sound effects
     */
    loadSounds() {
        if (!this.audioContext) return;

        const soundTypes = [
            'fire', 'thrust', 'explode_sm', 'explode_md', 
            'explode_lg', 'ufo_lg_spawn', 'ufo_sm_spawn', 'pulse'
        ];

        soundTypes.forEach(type => {
            // Try modern sound first, fallback to simple sound
            this.sounds[type] = this.generateModernSound(type) || this.generateSimpleSound(type);
        });

        console.log('All modern sounds loaded');
    }

    /**
     * Play a sound effect with optional color-themed effects
     * @param {string} soundId - ID of the sound to play
     * @param {string} color - Optional color theme for the sound
     */
    playSound(soundId, color = null) {
        if (!this.audioContext || !this.sounds[soundId]) return;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            source.buffer = this.sounds[soundId];
            
            // Apply color-themed effects
            if (color) {
                this.applyColorEffect(filterNode, color);
            }
            
            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    /**
     * Apply color-themed audio effects
     * @param {BiquadFilterNode} filterNode - Filter node to apply effects to
     * @param {string} color - Color theme
     */
    applyColorEffect(filterNode, color) {
        switch (color) {
            case 'blue':
                filterNode.type = 'lowpass';
                filterNode.frequency.value = 2000;
                break;
            case 'red':
                filterNode.type = 'highpass';
                filterNode.frequency.value = 800;
                break;
            case 'green':
                filterNode.type = 'bandpass';
                filterNode.frequency.value = 1000;
                filterNode.Q.value = 2;
                break;
            case 'yellow':
                filterNode.type = 'lowpass';
                filterNode.frequency.value = 3000;
                break;
            case 'purple':
                filterNode.type = 'notch';
                filterNode.frequency.value = 500;
                filterNode.Q.value = 3;
                break;
        }
    }

    /**
     * Play thrust sound (looping) with engine color effect
     * @returns {AudioBufferSourceNode} - The source node for stopping later
     */
    playThrust() {
        if (!this.audioContext || !this.sounds.thrust) return null;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            source.buffer = this.sounds.thrust;
            source.loop = true;
            
            // Apply engine-like filter effect
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 800;
            filterNode.Q.value = 1;
            
            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            return source;
        } catch (error) {
            console.error('Error playing thrust sound:', error);
            return null;
        }
    }

    /**
     * Play explosion with size-appropriate color effects
     * @param {string} size - Size of explosion ('small', 'medium', 'large')
     */
    playExplosion(size) {
        const soundId = `explode_${size}`;
        let color = null;
        
        switch (size) {
            case 'small':
                color = 'yellow';
                break;
            case 'medium':
                color = 'orange';
                break;
            case 'large':
                color = 'red';
                break;
        }
        
        this.playSound(soundId, color);
    }

    /**
     * Play the classic Asteroids pulse sound
     */
    playPulse() {
        this.playSound('pulse', 'blue');
    }
}

// Create global audio manager instance
const audioManager = new AudioManager(); 