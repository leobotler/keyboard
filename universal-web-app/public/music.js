document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.horizontal-list-btn');
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    let activeOscillators = []; // Keep track of playing sounds to stop them if needed

    // Note frequencies
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

    const playMelody = (song) => {
        // Initialize AudioContext on first user interaction to comply with browser policies
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Stop any currently playing notes so melodies don't overlap chaotically
        activeOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        activeOscillators = [];

        let startTime = audioCtx.currentTime;

        song.forEach(note => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = noteFreqs[note.n];

            // Envelope for the sound (fade out)
            gainNode.gain.setValueAtTime(0.5, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.d);

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + note.d);

            activeOscillators.push(osc);
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