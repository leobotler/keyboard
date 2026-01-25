class SimpleProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.phase = 0;
        this.frequency = 440;
        this.port.onmessage = (e) => {
            if (typeof e.data.frequency === 'number') this.frequency = e.data.frequency;
        };
    }

    process(inputs, outputs/*, parameters */) {
        const output = outputs[0];
        const sr = sampleRate;
        const increment = 2 * Math.PI * this.frequency / sr;
        for (let ch = 0; ch < output.length; ++ch) {
            const out = output[ch];
            for (let i = 0; i < out.length; ++i) {
                out[i] = Math.sin(this.phase);
                this.phase += increment;
                if (this.phase > 2 * Math.PI) this.phase -= 2 * Math.PI;
            }
        }
        return true;
    }
}
registerProcessor('simple-processor', SimpleProcessor);

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private node: AudioWorkletNode | null = null;
    private gain: GainNode | null = null;

    async init() {
        if (this.ctx) return;
        this.ctx = new AudioContext({ latencyHint: 'interactive' });
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

    stop() {
        if (this.ctx) this.ctx.suspend();
    }

    setFrequency(freq: number) {
        if (this.node) this.node.port.postMessage({ frequency: freq });
    }

    setGain(v: number) {
        if (this.gain) this.gain.gain.value = v;
    }
}