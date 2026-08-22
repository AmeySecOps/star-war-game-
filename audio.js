/**
 * Star Wars: Galactic Assault - Web Audio API Procedural Synthesizer
 * Zero external audio files required. All blasters, explosions, TIE howls,
 * R2-D2 chirps, and cinematic battle music are generated in real-time.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.musicPlaying = false;
        this.musicTimer = null;
        this.tempo = 135; // BPM
        this.currentStep = 0;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported or blocked", e);
        }
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        if (!this.initialized) this.init();
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    // --- Sound Effects ---

    // Iconic Red Quad/Dual Rebel Blaster
    playLaser(type = 'rebel') {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        if (type === 'rebel' || type === 'xwing') {
            // High pitch to low sweep
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3200, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.14);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'falcon') {
            // Heavy quad cannon thud
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(750, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800, now);
            filter.Q.value = 3;

            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.19);
        } else if (type === 'awing') {
            // Rapid high-speed twin blaster
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.09);

            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'tie') {
            // Green sharp TIE blaster
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

            const mod = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();
            mod.frequency.setValueAtTime(45, now);
            modGain.gain.setValueAtTime(120, now);
            mod.connect(osc.frequency);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            mod.start(now);
            osc.start(now);
            mod.stop(now + 0.13);
            osc.stop(now + 0.13);
        } else if (type === 'turbolaser') {
            // Heavy Star Destroyer green blast
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2500, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.36);
        }
    }

    // Proton Torpedo Launch & Sub-bass swoosh
    playProtonTorpedo() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        // Filtered noise swoosh
        const bufferSize = this.ctx.sampleRate * 0.5;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.3);
        filter.Q.value = 4.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        whiteNoise.start(now);
        osc.start(now);
        whiteNoise.stop(now + 0.5);
        osc.stop(now + 0.5);
    }

    // Explosions (Small, Medium, Heavy Boss / Death Star)
    playExplosion(type = 'medium') {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const duration = type === 'small' ? 0.4 : (type === 'boss' ? 1.8 : 0.8);

        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(type === 'small' ? 1200 : (type === 'boss' ? 500 : 800), now);
        filter.frequency.exponentialRampToValueAtTime(30, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(type === 'boss' ? 0.9 : 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        // Sub Bass impact for heavy feel
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(type === 'boss' ? 140 : 100, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + duration * 0.7);

        subGain.gain.setValueAtTime(type === 'boss' ? 0.8 : 0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);

        noiseSource.start(now);
        subOsc.start(now);
        noiseSource.stop(now + duration);
        subOsc.stop(now + duration);
    }

    // Iconic TIE Fighter Engine Roar / Doppler Scream
    playTieScream() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        // Doppler pitch shift
        osc1.frequency.setValueAtTime(260, now);
        osc1.frequency.linearRampToValueAtTime(420, now + 0.35);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 1.1);

        osc2.frequency.setValueAtTime(265, now);
        osc2.frequency.linearRampToValueAtTime(430, now + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(145, now + 1.1);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, now);
        filter.frequency.linearRampToValueAtTime(1200, now + 0.35);
        filter.frequency.exponentialRampToValueAtTime(350, now + 1.1);
        filter.Q.value = 4.0;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.15);
        osc2.stop(now + 1.15);
    }

    // R2-D2 Cute Astromech Beeps & Chirps
    playR2D2(mood = 'happy') {
        if (!this.initialized || this.isMuted) return;
        const count = mood === 'happy' ? 4 : (mood === 'alert' ? 6 : 3);
        let timeOffset = 0;

        for (let i = 0; i < count; i++) {
            const start = this.ctx.currentTime + timeOffset;
            const dur = 0.06 + Math.random() * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
            const baseFreq = mood === 'alert' ? 1400 : 900;
            const freq1 = baseFreq + (Math.random() * 1200 - 400);
            const freq2 = baseFreq + (Math.random() * 1400 - 400);

            osc.frequency.setValueAtTime(freq1, start);
            osc.frequency.exponentialRampToValueAtTime(freq2, start + dur);

            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + dur + 0.01);

            timeOffset += dur + (Math.random() * 0.04);
        }
    }

    // Shield Deflection Impact Sound
    playShieldHit() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    // Hyperspace Jump Sound
    playHyperspace() {
        if (!this.initialized || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 1.2);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        // Flash sonic boom
        const boomOsc = this.ctx.createOscillator();
        const boomGain = this.ctx.createGain();
        boomOsc.type = 'triangle';
        boomOsc.frequency.setValueAtTime(350, now + 1.0);
        boomOsc.frequency.exponentialRampToValueAtTime(30, now + 1.8);

        boomGain.gain.setValueAtTime(0.0, now);
        boomGain.gain.setValueAtTime(0.8, now + 1.0);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        boomOsc.connect(boomGain);
        boomGain.connect(this.sfxGain);

        osc.start(now);
        boomOsc.start(now);
        osc.stop(now + 1.5);
        boomOsc.stop(now + 1.9);
    }

    // Powerup / Restock Acquired
    playPowerup() {
        if (!this.initialized || this.isMuted) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const start = this.ctx.currentTime + (idx * 0.06);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.13);
        });
    }

    // --- Procedural Star Wars Battle Music Engine ---
    startBattleMusic(theme = 'space') {
        if (!this.initialized) this.init();
        if (this.musicPlaying) return;
        this.musicPlaying = true;

        const imperialBass = [
            110, 110, 110, 87.31, 130.81, 110, 87.31, 130.81, // A, A, A, F, C, A, F, C
            164.81, 164.81, 164.81, 174.61, 130.81, 103.83, 87.31, 130.81
        ];

        let bassIdx = 0;

        const scheduleNextNote = () => {
            if (!this.musicPlaying || !this.ctx) return;
            const now = this.ctx.currentTime;
            const stepDuration = 60 / this.tempo / 2; // Eighth note interval

            // Bass note synth (driving battle march)
            const bassFreq = imperialBass[bassIdx % imperialBass.length];
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            const bassFilter = this.ctx.createBiquadFilter();

            bassOsc.type = 'sawtooth';
            bassOsc.frequency.setValueAtTime(bassFreq, now);

            bassFilter.type = 'lowpass';
            bassFilter.frequency.setValueAtTime(450, now);
            bassFilter.frequency.exponentialRampToValueAtTime(180, now + stepDuration);

            bassGain.gain.setValueAtTime(0.2, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.95);

            bassOsc.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(this.musicGain);

            bassOsc.start(now);
            bassOsc.stop(now + stepDuration);

            // Driving percussion snare / hi-hat noise
            if (bassIdx % 2 === 1) {
                const snareBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
                const sData = snareBuffer.getChannelData(0);
                for (let j = 0; j < sData.length; j++) sData[j] = Math.random() * 2 - 1;
                const snareSource = this.ctx.createBufferSource();
                snareSource.buffer = snareBuffer;

                const snareFilter = this.ctx.createBiquadFilter();
                snareFilter.type = 'highpass';
                snareFilter.frequency.value = 1800;

                const snareGain = this.ctx.createGain();
                snareGain.gain.setValueAtTime(0.08, now);
                snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

                snareSource.connect(snareFilter);
                snareFilter.connect(snareGain);
                snareGain.connect(this.musicGain);

                snareSource.start(now);
                snareSource.stop(now + 0.08);
            }

            // Occasional Brass/Horn chord hits (Williams battle fanfare)
            if (bassIdx % 8 === 0) {
                const brassNotes = [220, 277.18, 329.63]; // A major chord
                brassNotes.forEach(f => {
                    const bOsc = this.ctx.createOscillator();
                    const bGain = this.ctx.createGain();
                    bOsc.type = 'sawtooth';
                    bOsc.frequency.setValueAtTime(f * 1.5, now);

                    bGain.gain.setValueAtTime(0.12, now);
                    bGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 3);

                    bOsc.connect(bGain);
                    bGain.connect(this.musicGain);

                    bOsc.start(now);
                    bOsc.stop(now + stepDuration * 3);
                });
            }

            bassIdx++;
            this.musicTimer = setTimeout(scheduleNextNote, stepDuration * 1000);
        };

        scheduleNextNote();
    }

    stopBattleMusic() {
        this.musicPlaying = false;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();

