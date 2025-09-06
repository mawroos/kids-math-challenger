// Sound effects utility for the math quiz app
// Uses Web Audio API to generate simple sound effects programmatically

class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext when first needed
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    // Resume AudioContext if it's suspended (required by some browsers)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private showSoundFeedback(type: 'correct' | 'incorrect' | 'celebration') {
    // Create a temporary visual indicator for accessibility
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.top = '20px';
    indicator.style.right = '20px';
    indicator.style.padding = '8px 16px';
    indicator.style.borderRadius = '8px';
    indicator.style.zIndex = '9999';
    indicator.style.fontSize = '14px';
    indicator.style.fontWeight = 'bold';
    indicator.style.transition = 'all 0.3s ease';
    indicator.style.pointerEvents = 'none';
    
    switch (type) {
      case 'correct':
        indicator.textContent = '✓ Correct!';
        indicator.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
        indicator.style.color = 'white';
        break;
      case 'incorrect':
        indicator.textContent = '✗ Try again';
        indicator.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
        indicator.style.color = 'white';
        break;
      case 'celebration':
        indicator.textContent = '🎉 Well done!';
        indicator.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
        indicator.style.color = 'white';
        break;
    }
    
    document.body.appendChild(indicator);
    
    // Animate in
    setTimeout(() => {
      indicator.style.transform = 'translateX(0)';
      indicator.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      indicator.style.transform = 'translateX(100%)';
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          document.body.removeChild(indicator);
        }
      }, 300);
    }, 1500);
  }

  // Play a pleasant "correct" sound - ascending tone
  async playCorrectSound() {
    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      this.showSoundFeedback('correct');

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create a pleasant ascending tone
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5

      oscillator.type = 'sine';
      
      // Smooth volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.2);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.4);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.4);
    } catch (error) {
      console.warn('Error playing correct sound:', error);
    }
  }

  // Play a gentle "incorrect" sound - descending tone
  async playIncorrectSound() {
    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      this.showSoundFeedback('incorrect');

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create a gentle descending tone
      oscillator.frequency.setValueAtTime(392.00, this.audioContext.currentTime); // G4
      oscillator.frequency.setValueAtTime(329.63, this.audioContext.currentTime + 0.15); // E4
      oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime + 0.3); // C4

      oscillator.type = 'sine';
      
      // Smooth volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.2);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.45);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.45);
    } catch (error) {
      console.warn('Error playing incorrect sound:', error);
    }
  }

  // Play a celebration sound for quiz completion
  async playCelebrationSound() {
    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      this.showSoundFeedback('celebration');

      // Play multiple ascending notes in rapid succession
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      
      for (let i = 0; i < notes.length; i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(notes[i], this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        const startTime = this.audioContext.currentTime + (i * 0.1);
        const endTime = startTime + 0.2;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);
      }
    } catch (error) {
      console.warn('Error playing celebration sound:', error);
    }
  }
}

// Create a singleton instance
export const soundEffects = new SoundEffects();
