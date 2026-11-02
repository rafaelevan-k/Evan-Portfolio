import type { SceneId } from "./world";

export type JourneySound = "blip" | "step" | "stamp" | "whistle";

/** Quiet synthesized railway ambience. No context is created until Sound is clicked. */
export class JourneyAudio {
  private context: AudioContext | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private rhythm: ReturnType<typeof setInterval> | null = null;
  private gain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private scene: SceneId = "station";
  private muted = true;
  private destroyed = false;

  async setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) { await this.context?.suspend(); return; }
    if (!this.context) {
      this.context = new AudioContext();
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.05;
      this.gain.connect(this.context.destination);
      this.noise = this.context.createBuffer(1, this.context.sampleRate / 4, this.context.sampleRate);
      const samples = this.noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    await this.context.resume();
    if (this.destroyed || this.muted) { await this.context.suspend(); return; }
    if (!this.interval) {
      this.chord();
      this.interval = setInterval(() => this.chord(), 5000);
      this.rhythm = setInterval(() => this.ambience(), 1150);
    }
  }

  setScene(scene: SceneId) { this.scene = scene; }

  play(sound: JourneySound) {
    if (!this.ready()) return;
    const now = this.context!.currentTime;
    if (sound === "step") this.burst(now, 0.05, 900, 0.5);
    if (sound === "blip") { this.tone(660, now, 0.07, 0.8, "square"); this.tone(880, now + 0.07, 0.09, 0.8, "square"); }
    if (sound === "stamp") { this.burst(now, 0.08, 500, 2); [523, 659, 784].forEach((frequency, i) => this.tone(frequency, now + 0.08 + i * 0.08, 0.14, 0.8, "square")); }
    if (sound === "whistle") for (const frequency of [523, 659]) { this.tone(frequency, now, 0.5, 1.4, "triangle"); this.tone(frequency, now + 0.62, 0.9, 1.4, "triangle"); }
  }

  private ready() { return !this.muted && !this.destroyed && this.context?.state === "running" && this.gain; }

  private tone(frequency: number, start: number, length: number, level: number, type: OscillatorType) {
    const oscillator = this.context!.createOscillator();
    const envelope = this.context!.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + Math.min(0.02, length / 3));
    envelope.gain.linearRampToValueAtTime(0, start + length);
    oscillator.connect(envelope); envelope.connect(this.gain!);
    oscillator.start(start); oscillator.stop(start + length + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  private burst(start: number, length: number, frequency: number, level: number) {
    const source = this.context!.createBufferSource();
    const filter = this.context!.createBiquadFilter();
    const envelope = this.context!.createGain();
    source.buffer = this.noise;
    filter.type = "bandpass"; filter.frequency.value = frequency;
    envelope.gain.setValueAtTime(level, start);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + length);
    source.connect(filter); filter.connect(envelope); envelope.connect(this.gain!);
    source.start(start, Math.random() * 0.15, length);
    source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
  }

  /** Rail joints under the carriages; a sparse cricket chirp on the platform. */
  private ambience() {
    if (!this.ready()) return;
    const now = this.context!.currentTime;
    if (this.scene === "train") { this.burst(now, 0.09, 260, 2.2); this.burst(now + 0.16, 0.09, 220, 2.8); }
    else if (Math.random() > 0.55) for (let i = 0; i < 3; i++) this.tone(4200, now + i * 0.09, 0.05, 0.1, "sine");
  }

  private chord() {
    if (!this.ready()) return;
    [196, 246.94, 293.66].forEach((frequency, i) => {
      const oscillator = this.context!.createOscillator();
      const envelope = this.context!.createGain();
      const start = this.context!.currentTime + i * 0.4;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(0.3, start + 0.8);
      envelope.gain.linearRampToValueAtTime(0, start + 4);
      oscillator.connect(envelope); envelope.connect(this.gain!);
      oscillator.start(start); oscillator.stop(start + 4.1);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
  }

  destroy() {
    this.destroyed = true;
    if (this.interval) clearInterval(this.interval);
    if (this.rhythm) clearInterval(this.rhythm);
    void this.context?.close().catch(() => undefined);
  }
}
