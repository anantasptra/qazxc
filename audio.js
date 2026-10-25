/**
 * Audio Engine for Media Pembelajaran Interaktif Siswa SD
 * Built with Web Audio API for 100% self-contained procedural background music,
 * high quality sound effects (clicks, chimes, fanfares), and text-to-speech narration.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;

    this.isBgmPlaying = false;
    this.isMuted = false;
    this.bgmVolume = 0.25;
    this.sfxVolume = 0.70;

    this.bgmInterval = null;
    this.bgmStep = 0;

    // Load saved settings from localStorage
    try {
      const savedMute = localStorage.getItem('sound_is_muted');
      if (savedMute !== null) this.isMuted = (savedMute === 'true');
      const savedBgmVol = localStorage.getItem('sound_bgm_vol');
      if (savedBgmVol !== null) this.bgmVolume = parseFloat(savedBgmVol);
      const savedSfxVol = localStorage.getItem('sound_sfx_vol');
      if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);
    } catch (e) {
      console.warn("Storage access restricted", e);
    }

    // Narration Speech Synthesis
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  init() {
    if (this.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // BGM Gain
      this.bgmGain = this.audioCtx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.audioCtx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // SFX Gain
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioCtx.currentTime);
      this.sfxGain.connect(this.masterGain);

      console.log("SoundEngine initialized successfully.");
    } catch (err) {
      console.warn("Web Audio API not supported in this browser:", err);
    }
  }

  ensureContext() {
    if (!this.audioCtx) this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMute(muted) {
    this.isMuted = muted;
    try {
      localStorage.setItem('sound_is_muted', muted);
    } catch (e) {}

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.audioCtx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.ensureContext();
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem('sound_bgm_vol', this.bgmVolume);
    } catch (e) {}
    if (this.bgmGain && this.audioCtx) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.audioCtx.currentTime, 0.05);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem('sound_sfx_vol', this.sfxVolume);
    } catch (e) {}
    if (this.sfxGain && this.audioCtx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.audioCtx.currentTime, 0.05);
    }
  }

  /* ---------------- Procedural Joyful Instrumental BGM ---------------- */
  startBgm() {
    this.ensureContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    // Cheerful pentatonic lullaby/marimba progression: C major / A minor pentatonic
    // Notes in Hz: C4(261.6), D4(293.7), E4(329.6), G4(392.0), A4(440.0), C5(523.3), D5(587.3), E5(659.3)
    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 392.00, 440.00, 587.33, 440.00, 392.00,
      329.63, 392.00, 523.25, 659.25, 523.25, 392.00,
      440.00, 523.25, 392.00, 329.63, 293.66, 261.63
    ];
    const bass = [
      130.81, 130.81, 130.81, 130.81, 130.81, 130.81,
      146.83, 146.83, 146.83, 146.83, 146.83, 146.83,
      164.81, 164.81, 164.81, 164.81, 164.81, 164.81,
      174.61, 174.61, 174.61, 196.00, 196.00, 196.00
    ];

    this.bgmStep = 0;
    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || !this.audioCtx || this.audioCtx.state === 'suspended') return;

      const noteFreq = melody[this.bgmStep % melody.length];
      const bassFreq = bass[this.bgmStep % bass.length];
      const t = this.audioCtx.currentTime;

      // Play soft bell note
      this._playTone(noteFreq, t, 0.35, 'triangle', 0.12 * this.bgmVolume);

      // Play gentle warm bass note every 3 steps
      if (this.bgmStep % 3 === 0) {
        this._playTone(bassFreq, t, 0.6, 'sine', 0.18 * this.bgmVolume);
      }

      this.bgmStep++;
    }, 280);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  _playTone(freq, startTime, duration, type = 'sine', peakGain = 0.2) {
    if (!this.audioCtx || !this.bgmGain) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Envelope: gentle attack, exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      // ignore oscillator lifecycle errors
    }
  }

  /* ---------------- Sound Effects (SFX) ---------------- */
  playClick() {
    this.ensureContext();
    if (!this.audioCtx || this.isMuted) return;
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  playSuccess() {
    this.ensureContext();
    if (!this.audioCtx || this.isMuted) return;
    const t = this.audioCtx.currentTime;

    // Cheerful major chord arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  playError() {
    this.ensureContext();
    if (!this.audioCtx || this.isMuted) return;
    const t = this.audioCtx.currentTime;

    // Encouraging gentle "uh-oh" low bounce
    const notes = [280, 220];
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.12;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });
  }

  playFanfare() {
    this.ensureContext();
    if (!this.audioCtx || this.isMuted) return;
    const t = this.audioCtx.currentTime;

    // Joyful victory fanfare
    const melody = [
      { f: 523.25, d: 0.12, del: 0 },
      { f: 523.25, d: 0.12, del: 0.14 },
      { f: 523.25, d: 0.12, del: 0.28 },
      { f: 659.25, d: 0.35, del: 0.42 },
      { f: 783.99, d: 0.2,  del: 0.8 },
      { f: 1046.5, d: 0.6,  del: 1.02 }
    ];

    melody.forEach(item => {
      const noteTime = t + item.del;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + item.d + 0.05);
    });
  }

  playStar() {
    this.ensureContext();
    if (!this.audioCtx || this.isMuted) return;
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.15); // E6

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  /* ---------------- Narration / Text-to-Speech ---------------- */
  speakNarration(text, onEndCallback) {
    if (!this.synth) return;
    this.stopNarration();

    // Duck BGM slightly while narration speaks
    if (this.bgmGain && this.audioCtx && !this.isMuted) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume * 0.25, this.audioCtx.currentTime, 0.1);
    }

    const cleanText = text.replace(/[*_#`]/g, '');
    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.lang = 'id-ID';
    this.currentUtterance.rate = 0.95; // Friendly, clear pacing for kids
    this.currentUtterance.pitch = 1.1; // Slightly cheerful, bright voice

    this.isSpeaking = true;

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      // Restore BGM volume
      if (this.bgmGain && this.audioCtx && !this.isMuted) {
        this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.audioCtx.currentTime, 0.2);
      }
      if (onEndCallback) onEndCallback();
    };

    this.currentUtterance.onerror = () => {
      this.isSpeaking = false;
      if (this.bgmGain && this.audioCtx && !this.isMuted) {
        this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.audioCtx.currentTime, 0.2);
      }
    };

    this.synth.speak(this.currentUtterance);
  }

  stopNarration() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
    if (this.bgmGain && this.audioCtx && !this.isMuted) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.audioCtx.currentTime, 0.1);
    }
  }

  toggleNarration(text, onStateChange) {
    if (this.isSpeaking) {
      this.stopNarration();
      if (onStateChange) onStateChange(false);
    } else {
      this.speakNarration(text, () => {
        if (onStateChange) onStateChange(false);
      });
      if (onStateChange) onStateChange(true);
    }
  }
}

// Global Sound Engine Instance
window.sound = new SoundEngine();

// Auto-unlock Web Audio context on first user click or tap anywhere on page
document.addEventListener('click', function unlockAudioOnce() {
  window.sound.ensureContext();
  document.removeEventListener('click', unlockAudioOnce);
}, { once: true });
