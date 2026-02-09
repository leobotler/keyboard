document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.horizontal-list-btn');
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    let activeOscillators = [];
    let activeTimeouts = []; // Keep track of visual highlights

    const noteFreqs = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
    };

    // Define songs as arrays of {note, duration}
    const songs = [
        // 1. Mary Had a Little Lamb
        [
            {n:'E4',d:0.4}, {n:'D4',d:0.4}, {n:'C4',d:0.4}, {n:'D4',d:0.4},
            {n:'E4',d:0.4}, {n:'E4',d:0.4}, {n:'E4',d:0.8},
            {n:'D4',d:0.4}, {n:'D4',d:0.4}, {n:'D4',d:0.8},
            {n:'E4',d:0.4}, {n:'G4',d:0.4}, {n:'G4',d:0.8}
        ],
        // 2. Twinkle Twinkle Little Star
        [
            {n:'C4',d:0.4}, {n:'C4',d:0.4}, {n:'G4',d:0.4}, {n:'G4',d:0.4},
            {n:'A4',d:0.4}, {n:'A4',d:0.4}, {n:'G4',d:0.8},
            {n:'F4',d:0.4}, {n:'F4',d:0.4}, {n:'E4',d:0.4}, {n:'E4',d:0.4},
            {n:'D4',d:0.4}, {n:'D4',d:0.4}, {n:'C4',d:0.8}
        ],
        // 3. Jingle Bells
        [
            {n:'E4',d:0.3}, {n:'E4',d:0.3}, {n:'E4',d:0.6},
            {n:'E4',d:0.3}, {n:'E4',d:0.3}, {n:'E4',d:0.6},
            {n:'E4',d:0.3}, {n:'G4',d:0.3}, {n:'C4',d:0.4}, {n:'D4',d:0.2}, {n:'E4',d:0.8}
        ],
        // 4. London Bridge
        [
            {n:'G4',d:0.4}, {n:'A4',d:0.4}, {n:'G4',d:0.3}, {n:'F4',d:0.3},
            {n:'E4',d:0.4}, {n:'F4',d:0.4}, {n:'G4',d:0.8},
            {n:'D4',d:0.4}, {n:'E4',d:0.4}, {n:'F4',d:0.8},
            {n:'E4',d:0.4}, {n:'F4',d:0.4}, {n:'G4',d:0.8}
        ],
        // 5. Row Row Row Your Boat
        [
            {n:'C4',d:0.4}, {n:'C4',d:0.4}, {n:'C4',d:0.4}, {n:'D4',d:0.2}, {n:'E4',d:0.4},
            {n:'E4',d:0.4}, {n:'D4',d:0.2}, {n:'E4',d:0.4}, {n:'F4',d:0.2}, {n:'G4',d:0.8}
        ],
        // 6. Baa Baa Black Sheep
        [
             {n:'C4',d:0.4}, {n:'C4',d:0.4}, {n:'G4',d:0.4}, {n:'G4',d:0.4},
             {n:'A4',d:0.2}, {n:'B4',d:0.2}, {n:'C5',d:0.2}, {n:'A4',d:0.2}, {n:'G4',d:0.8}
        ],
        // 7. The Wheels on the Bus
        [
            {n:'C4',d:0.3}, {n:'F4',d:0.3}, {n:'F4',d:0.3}, {n:'F4',d:0.3}, {n:'F4',d:0.3},
            {n:'A4',d:0.3}, {n:'C5',d:0.3}, {n:'A4',d:0.3}, {n:'F4',d:0.8}
        ],
        // 8. Happy Birthday
        [
            {n:'C4',d:0.3}, {n:'C4',d:0.1}, {n:'D4',d:0.4}, {n:'C4',d:0.4}, {n:'F4',d:0.4}, {n:'E4',d:0.8},
            {n:'C4',d:0.3}, {n:'C4',d:0.1}, {n:'D4',d:0.4}, {n:'C4',d:0.4}, {n:'G4',d:0.4}, {n:'F4',d:0.8}
        ],
        // 9. Old MacDonald
        [
            {n:'C5',d:0.4}, {n:'C5',d:0.4}, {n:'C5',d:0.4}, {n:'G4',d:0.4},
            {n:'A4',d:0.4}, {n:'A4',d:0.4}, {n:'G4',d:0.8}
        ],
        // 10. Frere Jacques
        [
            {n:'C4',d:0.4}, {n:'D4',d:0.4}, {n:'E4',d:0.4}, {n:'C4',d:0.4},
            {n:'C4',d:0.4}, {n:'D4',d:0.4}, {n:'E4',d:0.4}, {n:'C4',d:0.4}
        ]
    ];

    // Helper to find key elements robustly (handles different naming conventions)
    const findKeyElement = (noteName) => {
        // 1. Try ID and Attributes (Exact Match)
        let key = document.getElementById(noteName) ||
                  document.querySelector(`[data-note="${noteName}"]`) ||
                  document.querySelector(`[data-key="${noteName}"]`);
        if (key) return key;

        // 2. Try Attributes without octave (e.g. "C" for "C4")
        const noteBase = noteName.replace(/[0-9]/g, '');
        key = document.getElementById(noteBase) ||
              document.querySelector(`[data-note="${noteBase}"]`) ||
              document.querySelector(`[data-key="${noteBase}"]`);
        if (key) return key;

        // 3. Try Text Content (e.g. <button>C4</button> or <div class="key">C</div>)
        // We scan buttons and elements with 'key' in their class
        const candidates = document.querySelectorAll('button, [class*="key"]');
        for (let el of candidates) {
            const text = el.textContent.trim();
            if (text === noteName || text === noteBase) return el;
        }

        return null;
    };

    const playMelody = (song) => {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // Stop previous audio
        activeOscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
        activeOscillators = [];

        // Clear any pending visual highlights from previous songs
        activeTimeouts.forEach(id => clearTimeout(id));
        activeTimeouts = [];

        // Reset any stuck keys from interrupted songs (ensure mouseup is fired)
        document.querySelectorAll('.piano-key-playing').forEach(key => {
            key.classList.remove('piano-key-playing');
            key.style.removeProperty('background-color');
            key.style.removeProperty('box-shadow');
            key.style.removeProperty('border');
            const eventOpts = { bubbles: true, cancelable: true, view: window };
            key.dispatchEvent(new PointerEvent('pointerup', { ...eventOpts, isPrimary: true, pointerId: 1, pointerType: 'mouse' }));
            key.dispatchEvent(new MouseEvent('mouseup', eventOpts));
        });

        let startTime = audioCtx.currentTime;

        song.forEach(note => {
            // Audio
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = noteFreqs[note.n];
            gainNode.gain.setValueAtTime(0.5, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.d);
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + note.d);
            activeOscillators.push(osc);

            // Visuals
            const delayMs = (startTime - audioCtx.currentTime) * 1000;
            const durationMs = note.d * 1000;
            const safeDelay = Math.max(0, delayMs);

            const startTimeout = setTimeout(() => {
                const key = findKeyElement(note.n);
                if (key) {
                    // Start Visuals
                    key.classList.add('piano-key-playing');
                    key.style.setProperty('background-color', '#ffeb3b', 'important');
                    key.style.setProperty('box-shadow', '0 0 15px rgba(255, 235, 59, 0.8)', 'important');
                    key.style.setProperty('border', '2px solid #ffeb3b', 'important');

                    // Schedule End immediately to ensure it happens regardless of event errors
                    const endTimeout = setTimeout(() => {
                        // Re-query the key element in case the UI framework replaced it during playback
                        const currentKey = findKeyElement(note.n) || key;

                        currentKey.classList.remove('piano-key-playing');
                        currentKey.style.removeProperty('background-color');
                        currentKey.style.removeProperty('box-shadow');
                        currentKey.style.removeProperty('border');
                        
                        const upOpts = { bubbles: true, cancelable: true, view: window };
                        currentKey.dispatchEvent(new PointerEvent('pointerup', { ...upOpts, isPrimary: true, pointerId: 1, pointerType: 'mouse' }));
                        currentKey.dispatchEvent(new MouseEvent('mouseup', upOpts));
                    }, durationMs);
                    
                    activeTimeouts.push(endTimeout);

                    // Start Events (Wrapped in try-catch)
                    try {
                        const eventOpts = { bubbles: true, cancelable: true, view: window };
                        key.dispatchEvent(new PointerEvent('pointerdown', { ...eventOpts, isPrimary: true, pointerId: 1, pointerType: 'mouse' }));
                        key.dispatchEvent(new MouseEvent('mousedown', eventOpts));
                        key.click();
                    } catch (e) {
                        console.error("Error emulating key press:", e);
                    }
                } else {
                    console.warn(`Key not found for note: ${note.n}`);
                }
            }, safeDelay);

            activeTimeouts.push(startTimeout);

            startTime += note.d;
        });
    };

    buttons.forEach((btn, index) => {
        // Cycle through the songs list
        const song = songs[index % songs.length];
        
        btn.addEventListener('click', () => {
            playMelody(song);
        });
    });
});