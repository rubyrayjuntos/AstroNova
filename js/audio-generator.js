/**
 * Audio Generator - Creates modern sound effects for the game
 * This script generates audio files that can be saved and used in the game
 */

class AudioGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = this.audioContext.sampleRate;
    }

    /**
     * Generate a modern fire sound
     */
    generateFireSound() {
        const duration = 0.15;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const frequency = 800 + Math.sin(t * 50) * 200; // Frequency modulation
            const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 20)); // Attack and decay
            const noise = (Math.random() - 0.5) * 0.3; // Add some noise
            
            data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4 + noise * envelope;
        }

        return buffer;
    }

    /**
     * Generate a modern thrust sound
     */
    generateThrustSound() {
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const frequency = 150 + Math.sin(t * 10) * 50; // Low frequency with modulation
            const envelope = Math.exp(-t * 3); // Slow decay
            const noise = (Math.random() - 0.5) * 0.5; // More noise for engine sound
            
            data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3 + noise * envelope * 0.4;
        }

        return buffer;
    }

    /**
     * Generate explosion sounds of different sizes
     */
    generateExplosionSound(size = 'small') {
        let duration, frequency, volume;
        
        switch (size) {
            case 'small':
                duration = 0.2;
                frequency = 400;
                volume = 0.5;
                break;
            case 'medium':
                duration = 0.35;
                frequency = 250;
                volume = 0.6;
                break;
            case 'large':
                duration = 0.5;
                frequency = 120;
                volume = 0.7;
                break;
        }

        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const freq = frequency * Math.exp(-t * 2); // Frequency sweep down
            const envelope = Math.exp(-t * 4) * (1 - Math.exp(-t * 30)); // Explosion envelope
            const noise = (Math.random() - 0.5) * 0.8; // Lots of noise for explosion
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * volume * 0.3 + noise * envelope * volume;
        }

        return buffer;
    }

    /**
     * Generate UFO spawn sounds
     */
    generateUFOSpawnSound(type = 'large') {
        const duration = 0.4;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            let frequency, volume;
            
            if (type === 'large') {
                frequency = 600 + Math.sin(t * 8) * 100; // Slower modulation
                volume = 0.4;
            } else {
                frequency = 1000 + Math.sin(t * 15) * 200; // Faster, higher frequency
                volume = 0.5;
            }
            
            const envelope = Math.exp(-t * 2) * (1 - Math.exp(-t * 10)); // Siren-like envelope
            const wave1 = Math.sin(2 * Math.PI * frequency * t);
            const wave2 = Math.sin(2 * Math.PI * (frequency * 1.5) * t); // Harmonic
            
            data[i] = (wave1 * 0.6 + wave2 * 0.4) * envelope * volume;
        }

        return buffer;
    }

    /**
     * Generate the classic Asteroids pulsing sound
     */
    generatePulseSound() {
        const duration = 0.1; // Short pulse
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const frequency = 200 + Math.sin(t * 50) * 50; // Frequency modulation
            const envelope = Math.exp(-t * 20) * (1 - Math.exp(-t * 100)); // Sharp attack, quick decay
            const wave = Math.sin(2 * Math.PI * frequency * t);
            
            data[i] = wave * envelope * 0.3;
        }

        return buffer;
    }

    /**
     * Convert AudioBuffer to WAV format
     */
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return arrayBuffer;
    }

    /**
     * Generate all sound effects
     */
    generateAllSounds() {
        const sounds = {
            fire: this.generateFireSound(),
            thrust: this.generateThrustSound(),
            explode_sm: this.generateExplosionSound('small'),
            explode_md: this.generateExplosionSound('medium'),
            explode_lg: this.generateExplosionSound('large'),
            ufo_lg_spawn: this.generateUFOSpawnSound('large'),
            ufo_sm_spawn: this.generateUFOSpawnSound('small'),
            pulse: this.generatePulseSound()
        };

        return sounds;
    }
}

// Export for use in the game
window.AudioGenerator = AudioGenerator; 