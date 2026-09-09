// ==========================================================================
// Sound Effects System (Web Audio API - No external audio files needed)
// ==========================================================================

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('scratch_waste_muted') === 'true';
    this.initialized = false;
  }

  init() {
    if (!this.initialized) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.initialized = true;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('scratch_waste_muted', this.isMuted);
    return this.isMuted;
  }

  // Soft UI click sound
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.06);
  }

  // Correct waste sort chime (cheerful high notes)
  playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + index * 0.06);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + index * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + index * 0.06);
      osc.stop(this.audioCtx.currentTime + index * 0.06 + 0.22);
    });
  }

  // Wrong waste sort buzzer (gentle low buzz)
  playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(130, this.audioCtx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.2);
  }

  // Grab or drop waste item
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.14, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  }

  // Victory / Game over fanfare
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [
      { f: 523.25, t: 0.0 }, // C5
      { f: 659.25, t: 0.12 }, // E5
      { f: 783.99, t: 0.24 }, // G5
      { f: 1046.50, t: 0.38 }, // C6
      { f: 880.00, t: 0.54 }, // A5
      { f: 1046.50, t: 0.70 }  // C6 long
    ];

    notes.forEach(note => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, this.audioCtx.currentTime + note.t);

      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + note.t + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + note.t);
      osc.stop(this.audioCtx.currentTime + note.t + 0.35);
    });
  }
}

// Global Sound instance
window.soundManager = new SoundManager();
