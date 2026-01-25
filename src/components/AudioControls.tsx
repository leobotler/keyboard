import React, { useState } from 'react';
import { AudioEngine } from '../audio/audioEngine';

const engine = new AudioEngine();

export default function AudioControls(): JSX.Element {
    const [frequency, setFrequency] = useState(440);
    const [gain, setGain] = useState(0.2);
    const [running, setRunning] = useState(false);

    const onStart = async () => {
        await engine.start();
        engine.setGain(gain);
        engine.setFrequency(frequency);
        setRunning(true);
    };

    const onStop = async () => {
        await engine.stop();
        setRunning(false);
    };

    return (
        <div>
            <div>
                <label>Frequency: {frequency} Hz</label>
                <input
                    type="range"
                    min="20"
                    max="2000"
                    value={frequency}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setFrequency(v);
                        engine.setFrequency(v);
                    }}
                />
            </div>

            <div>
                <label>Gain: {gain.toFixed(2)}</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={gain}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setGain(v);
                        engine.setGain(v);
                    }}
                />
            </div>

            <div>
                <button onClick={onStart} disabled={running}>Start</button>
                <button onClick={onStop} disabled={!running}>Stop</button>
            </div>
        </div>
    );
}