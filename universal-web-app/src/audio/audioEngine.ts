export class AudioEngine {
    private ctx: AudioContext | null = null;
    private node: AudioWorkletNode | OscillatorNode | null = null;
    private gain: GainNode | null = null;
    private usesFallback: boolean = false;

    async init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
            latencyHint: 'interactive'
        }) as AudioContext;
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.3;
        
        if (this.ctx.audioWorklet) {
            try {
                await this.ctx.audioWorklet.addModule('/audio/simple-processor.js');
                this.node = new AudioWorkletNode(this.ctx, 'simple-processor');
                this.usesFallback = false;
                this.node.connect(this.gain).connect(this.ctx.destination);
            } catch (e) {
                this.setupFallback();
            }
        } else {
            this.setupFallback();
        }
    }

    private setupFallback() {
        if (!this.ctx || !this.gain) return;
        this.node = this.ctx.createOscillator();
        (this.node as OscillatorNode).type = 'sine';
        (this.node as OscillatorNode).frequency.value = 440;
        this.node.connect(this.gain).connect(this.ctx.destination);
        (this.node as OscillatorNode).start(0);
        this.usesFallback = true;
    }

    async start() {
        if (!this.ctx) await this.init();
        if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
    }

    async stop() {
        if (this.ctx && this.ctx.state !== 'closed') await this.ctx.suspend();
    }

    setFrequency(freq: number) {
        if (this.usesFallback && this.node && 'frequency' in this.node) {
            (this.node as OscillatorNode).frequency.value = freq;
        } else if (this.node && 'port' in this.node) {
            (this.node as AudioWorkletNode).port.postMessage({ frequency: freq });
        }
    }

    setGain(v: number) {
        if (this.gain) this.gain.gain.value = v;
        if (!this.usesFallback && this.node && 'port' in this.node) {
            (this.node as AudioWorkletNode).port.postMessage({ gain: v });
        }
    }
}
