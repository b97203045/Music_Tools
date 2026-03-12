import { SOUND_PRESETS } from '../../metronome/js/sound-library.js';
import { buildPattern, getPatternDurationBeats } from './rhythm-patterns.js';

const SCHEDULE_AHEAD_TIME = 0.1;   // seconds
const LOOKAHEAD_INTERVAL = 25;     // ms

// Scoring thresholds in seconds
const PERFECT_THRESHOLD = 0.050;
const GOOD_THRESHOLD    = 0.100;
const OK_THRESHOLD      = 0.150;

const PHASES = {
    IDLE: 'idle',
    COUNT_IN: 'countIn',
    DEMO: 'demo',
    IMITATING: 'imitating',
    RESULT: 'result',
};

/**
 * Generate a clap sound (distinct from metronome click).
 * White noise filtered to a mid-frequency band with short decay.
 */
function generateClap(audioContext, destination, time) {
    const duration = 0.06;
    const sampleRate = audioContext.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.7;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    source.start(time);
    source.stop(time + duration);
}

export class RhythmEngine {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;

        // Settings
        this.tempo = 80;
        this.beatsPerMeasure = 4;
        this.beatUnit = 4;
        this.difficulty = 'beginner';
        this.measureCount = 1;
        this.soundPreset = 'click';
        this.volume = 0.8;

        // State
        this.phase = PHASES.IDLE;
        this.currentPattern = null;
        this.userHits = [];         // { beatPosition, timestamp }
        this.anchorTime = null;     // AudioContext time of the recording window start (measure downbeat)
        this._recordingEndTime = null;

        // Scheduler state
        this._nextNoteTime = 0;
        this._globalBeatIndex = 0;  // continuous beat counter from session start
        this._phaseStartBeat = 0;   // beat index where current phase started
        this._sessionStartTime = 0; // AudioContext time when beat 0 was scheduled
        this._timerWorker = null;

        // Callbacks
        this._onPhaseChangeCallbacks = [];
        this._onBeatCallbacks = [];
        this._onScoreCallbacks = [];
    }

    // --- Observer registration ---

    onPhaseChange(callback) { this._onPhaseChangeCallbacks.push(callback); }
    onBeat(callback) { this._onBeatCallbacks.push(callback); }
    onScore(callback) { this._onScoreCallbacks.push(callback); }

    // --- Public API ---

    get secondsPerBeat() {
        return 60.0 / this.tempo;
    }

    setTempo(bpm) {
        this.tempo = Math.max(20, Math.min(600, Math.round(bpm)));
    }

    setTimeSignature(beats, unit) {
        this.beatsPerMeasure = beats;
        this.beatUnit = unit;
    }

    setDifficulty(level) {
        this.difficulty = level;
    }

    setMeasureCount(count) {
        this.measureCount = Math.max(1, Math.min(4, count));
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    startSession() {
        this._initAudioContext();
        this.audioContext.resume();

        // Generate pattern
        this.currentPattern = buildPattern(
            this.difficulty, this.beatsPerMeasure, this.beatUnit, this.measureCount
        );

        if (!this.currentPattern) {
            return;
        }

        // Reset state
        this.userHits = [];
        this.anchorTime = null;
        this._recordingEndTime = null;
        this._globalBeatIndex = 0;
        this._phaseStartBeat = 0;
        this._nextNoteTime = this.audioContext.currentTime + 0.05; // tiny buffer
        this._sessionStartTime = this._nextNoteTime; // save when beat 0 starts

        this._setPhase(PHASES.COUNT_IN);
        this._startWorker();
    }

    stop() {
        this._stopWorker();
        this._setPhase(PHASES.IDLE);
    }

    recordHit(timestamp) {
        if (this.phase !== PHASES.IMITATING) return;
        // anchorTime and _recordingEndTime are pre-set when IMITATING phase begins

        const beatPosition = (timestamp - this.anchorTime) / this.secondsPerBeat;
        this.userHits.push({ beatPosition, timestamp });
    }

    retry() {
        if (this.phase !== PHASES.RESULT) return;
        // Re-run same pattern
        this._initAudioContext();
        this.audioContext.resume();

        this.userHits = [];
        this.anchorTime = null;
        this._recordingEndTime = null;
        this._globalBeatIndex = 0;
        this._phaseStartBeat = 0;
        this._nextNoteTime = this.audioContext.currentTime + 0.05;
        this._sessionStartTime = this._nextNoteTime;

        this._setPhase(PHASES.COUNT_IN);
        this._startWorker();
    }

    next() {
        if (this.phase !== PHASES.RESULT) return;
        this.startSession();
    }

    evaluate() {
        if (!this.currentPattern) return null;

        const expectedOnsets = this.currentPattern.notes.map(n => n.onset);
        const userBeats = this.userHits.map(h => h.beatPosition);
        const toleranceBeats = OK_THRESHOLD / this.secondsPerBeat;

        const matched = new Set();        // indices of matched user hits
        const noteResults = [];           // per-note feedback

        for (let i = 0; i < expectedOnsets.length; i++) {
            const expected = expectedOnsets[i];
            let bestIdx = -1;
            let bestDist = Infinity;

            for (let j = 0; j < userBeats.length; j++) {
                if (matched.has(j)) continue;
                const dist = Math.abs(userBeats[j] - expected);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = j;
                }
            }

            const distSeconds = bestDist * this.secondsPerBeat;

            if (bestIdx !== -1 && distSeconds <= OK_THRESHOLD) {
                matched.add(bestIdx);
                let rating, points;
                if (distSeconds <= PERFECT_THRESHOLD) {
                    rating = 'perfect'; points = 100;
                } else if (distSeconds <= GOOD_THRESHOLD) {
                    rating = 'good'; points = 75;
                } else {
                    rating = 'ok'; points = 50;
                }
                noteResults.push({
                    noteIndex: i,
                    onset: expected,
                    rating,
                    points,
                    errorMs: Math.round(distSeconds * 1000),
                    userBeat: userBeats[bestIdx],
                });
            } else {
                noteResults.push({
                    noteIndex: i,
                    onset: expected,
                    rating: 'missed',
                    points: 0,
                    errorMs: null,
                    userBeat: null,
                });
            }
        }

        // Extra hits
        const extraHits = [];
        for (let j = 0; j < userBeats.length; j++) {
            if (!matched.has(j)) {
                extraHits.push({ beatPosition: userBeats[j] });
            }
        }

        const maxPoints = expectedOnsets.length * 100;
        const earnedPoints = noteResults.reduce((sum, r) => sum + r.points, 0);
        const penalty = extraHits.length * 10;
        const finalScore = Math.max(0, Math.round(((earnedPoints - penalty) / maxPoints) * 100));

        let grade;
        if (finalScore >= 90) grade = 'A';
        else if (finalScore >= 75) grade = 'B';
        else if (finalScore >= 60) grade = 'C';
        else if (finalScore >= 40) grade = 'D';
        else grade = 'F';

        const counts = { perfect: 0, good: 0, ok: 0, missed: 0 };
        for (const r of noteResults) counts[r.rating]++;

        return {
            score: finalScore,
            grade,
            noteResults,
            extraHits,
            counts,
            totalNotes: expectedOnsets.length,
        };
    }

    // --- Private: Audio Context ---

    _initAudioContext() {
        if (this.audioContext) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);
    }

    // --- Private: Worker ---

    _startWorker() {
        if (!this._timerWorker) {
            try {
                this._timerWorker = new Worker(
                    new URL('./rhythm-worker.js', import.meta.url),
                    { type: 'classic' }
                );
                this._timerWorker.onmessage = () => this._scheduler();
            } catch {
                this._fallbackTimerId = setInterval(() => this._scheduler(), LOOKAHEAD_INTERVAL);
                return;
            }
        }
        this._timerWorker.postMessage({ command: 'start', interval: LOOKAHEAD_INTERVAL });
    }

    _stopWorker() {
        if (this._timerWorker) {
            this._timerWorker.postMessage({ command: 'stop' });
        }
        if (this._fallbackTimerId) {
            clearInterval(this._fallbackTimerId);
            this._fallbackTimerId = null;
        }
    }

    // --- Private: Scheduler ---

    _scheduler() {
        while (this._nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
            this._processCurrentBeat(this._nextNoteTime);
            this._advanceBeat();
        }

        // Check if recording window has elapsed
        if (this.phase === PHASES.IMITATING && this._recordingEndTime !== null) {
            if (this.audioContext.currentTime >= this._recordingEndTime) {
                this._stopWorker();
                const result = this.evaluate();
                this._setPhase(PHASES.RESULT);
                this._notifyScore(result);
            }
        }
    }

    _processCurrentBeat(time) {
        const beatInPhase = this._globalBeatIndex - this._phaseStartBeat;
        const measureBeat = this._globalBeatIndex % this.beatsPerMeasure;
        const isDownbeat = measureBeat === 0;
        const beatType = isDownbeat ? 'downbeat' : 'beat';

        switch (this.phase) {
            case PHASES.COUNT_IN: {
                // 1 measure of metronome
                this._scheduleMetronomeClick(beatType, time);
                this._notifyBeat({ type: beatType, measureBeat, phase: this.phase }, time);

                if (beatInPhase >= this.beatsPerMeasure - 1) {
                    // Transition to DEMO after this beat
                    this._phaseStartBeat = this._globalBeatIndex + 1;
                    this._setPhase(PHASES.DEMO);
                }
                break;
            }

            case PHASES.DEMO: {
                const totalDemoBeats = getPatternDurationBeats(this.currentPattern);

                // Schedule metronome click
                this._scheduleMetronomeClick(beatType, time);

                // Schedule clap for pattern notes that fall on this beat's window [beatInPhase, beatInPhase+1)
                const beatInDemo = beatInPhase;
                if (beatInDemo < totalDemoBeats) {
                    for (const note of this.currentPattern.notes) {
                        if (Math.abs(note.onset - beatInDemo) < 0.001) {
                            // Note falls exactly on this beat
                            generateClap(this.audioContext, this.gainNode, time);
                        } else if (note.onset > beatInDemo && note.onset < beatInDemo + 1) {
                            // Sub-beat note: schedule at exact time offset
                            const exactTime = time + (note.onset - beatInDemo) * this.secondsPerBeat;
                            generateClap(this.audioContext, this.gainNode, exactTime);
                        }
                    }
                }

                this._notifyBeat({ type: beatType, measureBeat, phase: this.phase }, time);

                if (beatInPhase >= totalDemoBeats - 1) {
                    this._phaseStartBeat = this._globalBeatIndex + 1;
                    // Pre-set anchor and recording window at the known IMITATING downbeat
                    const imitatingStartTime = this._nextNoteTime + this.secondsPerBeat;
                    this.anchorTime = imitatingStartTime;
                    this._recordingEndTime = imitatingStartTime +
                        totalDemoBeats * this.secondsPerBeat;
                    this._setPhase(PHASES.IMITATING);
                }
                break;
            }

            case PHASES.IMITATING: {
                // Metronome keeps playing
                this._scheduleMetronomeClick(beatType, time);
                this._notifyBeat({ type: beatType, measureBeat, phase: this.phase }, time);
                break;
            }
        }
    }

    _advanceBeat() {
        this._nextNoteTime += this.secondsPerBeat;
        this._globalBeatIndex++;
    }

    _scheduleMetronomeClick(beatType, time) {
        const preset = SOUND_PRESETS[this.soundPreset];
        if (preset) {
            preset.generate(this.audioContext, this.gainNode, beatType, time);
        }
    }

    // --- Private: Phase & Notifications ---

    _setPhase(phase) {
        this.phase = phase;
        for (const cb of this._onPhaseChangeCallbacks) {
            cb(phase);
        }
    }

    _notifyBeat(beatInfo, time) {
        for (const cb of this._onBeatCallbacks) {
            cb(beatInfo, time);
        }
    }

    _notifyScore(result) {
        for (const cb of this._onScoreCallbacks) {
            cb(result);
        }
    }
}

export { PHASES };
