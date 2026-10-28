import type { AmbienceProfile } from '../content/audio';

export class AmbienceSystem {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private modulator: OscillatorNode | null = null;
  private musicOscillator: OscillatorNode | null = null;

  start(profile: AmbienceProfile, ambienceVolume = 1, musicVolume = 0): void {
    this.stop();
    try {
      this.context = new AudioContext();
    } catch {
      return;
    }
    const gain = this.context.createGain();
    const musicGain = this.context.createGain();
    const modulationGain = this.context.createGain();
    this.oscillator = this.context.createOscillator();
    this.modulator = this.context.createOscillator();
    this.musicOscillator = this.context.createOscillator();
    this.oscillator.type = profile.waveform;
    this.oscillator.frequency.value = profile.baseFrequency;
    this.modulator.frequency.value = profile.modulationFrequency;
    modulationGain.gain.value = profile.baseFrequency * 0.08;
    gain.gain.value = profile.gain * ambienceVolume;
    this.musicOscillator.type = 'sine';
    this.musicOscillator.frequency.value = profile.baseFrequency * 2;
    musicGain.gain.value = profile.gain * musicVolume * 0.28;
    this.modulator.connect(modulationGain).connect(this.oscillator.frequency);
    this.oscillator.connect(gain).connect(this.context.destination);
    this.musicOscillator.connect(musicGain).connect(this.context.destination);
    this.modulator.start();
    this.oscillator.start();
    this.musicOscillator.start();
  }

  stop(): void {
    this.oscillator?.stop();
    this.modulator?.stop();
    this.musicOscillator?.stop();
    void this.context?.close();
    this.oscillator = null;
    this.modulator = null;
    this.musicOscillator = null;
    this.context = null;
  }
}
