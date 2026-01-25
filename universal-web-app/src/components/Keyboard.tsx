import React, { useState } from 'react';
import { AudioEngine } from '../audio/audioEngine';
import '../styles/keyboard.css';

interface Key {
    note: string;
    frequency: number;
    color: string;
    isSharp: boolean;
}

const keys: Key[] = [
    { note: 'C', frequency: 261.63, color: '#FF0000', isSharp: false },      // Red
    { note: 'C#', frequency: 277.18, color: '#FF4500', isSharp: true },     // Orange-Red
    { note: 'D', frequency: 293.66, color: '#FF7F00', isSharp: false },      // Orange
    { note: 'D#', frequency: 311.13, color: '#FFD700', isSharp: true },     // Gold
    { note: 'E', frequency: 329.63, color: '#FFFF00', isSharp: false },      // Yellow
    { note: 'F', frequency: 349.23, color: '#7FFF00', isSharp: false },      // Yellow-Green
    { note: 'F#', frequency: 369.99, color: '#00FF00', isSharp: true },     // Green
    { note: 'G', frequency: 392.00, color: '#00FF7F', isSharp: false },      // Green-Cyan
    { note: 'G#', frequency: 415.30, color: '#00FFFF', isSharp: true },     // Cyan
    { note: 'A', frequency: 440.00, color: '#0000FF', isSharp: false },      // Blue
    { note: 'A#', frequency: 466.16, color: '#4B0082', isSharp: true },     // Indigo
    { note: 'B', frequency: 493.88, color: '#9400D3', isSharp: false },      // Violet
];

const whiteKeys = keys.filter(k => !k.isSharp);
const sharpKeys = keys.filter(k => k.isSharp);

const engine = new AudioEngine();

export default function Keyboard(): React.ReactElement {
    const [activeKey, setActiveKey] = useState<number | null>(null);
    const [initialized, setInitialized] = useState(false);

    const handleMouseDown = async (index: number) => {
        if (!initialized) {
            await engine.start();
            setInitialized(true);
        }
        engine.setFrequency(keys[index].frequency);
        engine.setGain(0.2);
        setActiveKey(index);
    };

    const handleMouseUp = () => {
        engine.setGain(0);
        setActiveKey(null);
    };

    const handleTouchStart = async (index: number) => {
        if (!initialized) {
            await engine.start();
            setInitialized(true);
        }
        engine.setFrequency(keys[index].frequency);
        engine.setGain(0.2);
        setActiveKey(index);
    };

    const handleTouchEnd = () => {
        engine.setGain(0);
        setActiveKey(null);
    };

    return (
        <div className="keyboard-container">
            <div className="keyboard">
                {whiteKeys.map((key, index) => (
                    <div
                        key={index}
                        className={`key white-key ${activeKey === keys.indexOf(key) ? 'active' : ''}`}
                        style={{
                            backgroundColor: key.color,
                        }}
                        onMouseDown={() => handleMouseDown(keys.indexOf(key))}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={() => handleTouchStart(keys.indexOf(key))}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="key-label">
                            <span className="note">{key.note}</span>
                        </div>
                    </div>
                ))}
                <div className="sharp-keys-container">
                    {sharpKeys.map((key, index) => (
                        <div
                            key={index}
                            className={`key sharp-key ${activeKey === keys.indexOf(key) ? 'active' : ''}`}
                            style={{
                                backgroundColor: key.color,
                            }}
                            onMouseDown={() => handleMouseDown(keys.indexOf(key))}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={() => handleTouchStart(keys.indexOf(key))}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="key-label">
                                <span className="note">{key.note}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
