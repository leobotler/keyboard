class SimpleProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.phase = 0;
        this.frequency = 440;
        this.gain = 0.2;
        this.port.onmessage = (e) => {
            if (typeof e.data.frequency === 'number') this.frequency = e.data.frequency;
            if (typeof e.data.gain === 'number') this.gain = e.data.gain;
        };
    }

    process(inputs, outputs /*, parameters */) {
        const output = outputs[0];
        if (!output) return true;
        const sr = sampleRate;
        const increment = 2 * Math.PI * this.frequency / sr;
        for (let ch = 0; ch < output.length; ++ch) {
            const out = output[ch];
            for (let i = 0; i < out.length; ++i) {
                out[i] = Math.sin(this.phase) * this.gain;
                this.phase += increment;
                if (this.phase > 2 * Math.PI) this.phase -= 2 * Math.PI;
            }
        }
        return true;
    }
}

registerProcessor('simple-processor', SimpleProcessor);
