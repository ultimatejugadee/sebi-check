// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
    
    // Create audio context and oscillator for the digital sound
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.lastSoundTime = 0;
    this.minSoundInterval = 50; // Minimum time between sounds (ms)
  }

  // Method to create and play a quick digital beep
  playDigitalSound() {
    const now = Date.now();
    // Limit sound frequency to avoid overwhelming audio
    if (now - this.lastSoundTime < this.minSoundInterval) return;
    
    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    // Configure sound parameters for more digital feel
    oscillator.type = 'sine'; // Changed to sine for more digital sound
    const baseFreq = 1200 + Math.random() * 400; // Higher frequency range
    oscillator.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 0.8,
      this.audioCtx.currentTime + 0.02
    );
    
    // Set volume (reduced to 30% of original) and duration
    gainNode.gain.setValueAtTime(0.003, this.audioCtx.currentTime); // Reduced from 0.015 to 0.003
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.015); // Reduced from 0.001 to 0.0001
    
    // Play sound with shorter duration
    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + 0.015); // Reduced from 0.05 to 0.015
    
    this.lastSoundTime = now;
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    let soundPlayed = false;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
          // Play sound when characters change, but only once per frame
          if (!soundPlayed) {
            this.playDigitalSound();
            soundPlayed = true;
          }
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————

document.addEventListener('DOMContentLoaded', function() {
    const phrases = [
        'Select your preferred language',
        'अपनी पसंदीदा भाषा चुनें',
        'तुमची पसंतीची भाषा निवडा',
        'તમારી પસંદગીની ભાષા પસંદ કરો',
        'உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
        'আপনার পছন্দের ভাষা নির্বাচন করুন',
        'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
        'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ'
    ];

    // Initialize audio context with user interaction
    let firstInteraction = true;
    document.body.addEventListener('click', () => {
        if (firstInteraction) {
            const temp = new TextScramble(document.createElement('div'));
            // Initialize audio context
            temp.audioCtx.resume();
            firstInteraction = false;
        }
    }, { once: true });

    const el = document.querySelector('.text');
    const fx = new TextScramble(el);

    let counter = 0;
    const next = () => {
        fx.setText(phrases[counter]).then(() => {
            setTimeout(next, 2000);
        });
        counter = (counter + 1) % phrases.length;
    };

    next();
});