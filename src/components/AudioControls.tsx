import React, { useState } from 'react';
import { AudioEngine } from '../audio/audioEngine';

const engine = new AudioEngine();

export default function AudioControls(): JSX.Element {
    const [frequency, setFrequency] = useState(440);
    const [gain, setGain] = useState(0.3);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onStart = async () => {
        try {
            setError(null);
            await engine.start();
            engine.setGain(gain);
            engine.setFrequency(frequency);
            setRunning(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start audio';
            setError(message);
            setRunning(false);
        }
    };

    const onStop = async () => {
        try {
            setError(null);
            await engine.stop();
            setRunning(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to stop audio';
            setError(message);
        }
    };

    return (
        <div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}
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