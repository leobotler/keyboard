export class AudioEngine {
    private ctx: AudioContext | null = null;
    private node: AudioWorkletNode | null = null;
    private gain: GainNode | null = null;

    async init() {
        if (this.ctx) return;
        this.ctx = new AudioContext({ latencyHint: 'interactive' });
        // Dev server should serve repository root so this path is reachable
        await this.ctx.audioWorklet.addModule('/src/audio/simple-processor.js');
        this.node = new AudioWorkletNode(this.ctx, 'simple-processor');
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.2;
        this.node.connect(this.gain).connect(this.ctx.destination);
    }

    async start() {
        if (!this.ctx) await this.init();
        if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
    }

    async stop() {
        if (this.ctx && this.ctx.state !== 'closed') await this.ctx.suspend();
    }

    setFrequency(freq: number) {
        if (this.node) this.node.port.postMessage({ frequency: freq });
    }

    setGain(v: number) {
        if (this.gain) this.gain.gain.value = v;
        if (this.node) this.node.port.postMessage({ gain: v });
    }
}