/** Quiet synthesized railway ambience. No context is created until Sound is clicked. */
export class JourneyAudio {
  private context: AudioContext | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private gain: GainNode | null = null;
  private muted = true;
  private destroyed = false;

  async setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) { await this.context?.suspend(); return; }
    if (!this.context) {
      this.context = new AudioContext();
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.035;
      this.gain.connect(this.context.destination);
    }
    await this.context.resume();
    if (this.destroyed || this.muted) { await this.context.suspend(); return; }
    if (!this.interval) {
      this.chord();
      this.interval = setInterval(() => this.chord(), 5000);
    }
  }

  private chord() {
    if (this.muted || this.destroyed || !this.context || !this.gain || this.context.state !== "running") return;
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
    void this.context?.close().catch(() => undefined);
  }
}
