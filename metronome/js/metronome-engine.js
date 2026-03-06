import { SOUND_PRESETS } from './sound-library.js';

const MIN_BPM = 20;
const MAX_BPM = 600;
const SCHEDULE_AHEAD_TIME = 0.1;   // seconds
const LOOKAHEAD_INTERVAL = 25;     // ms

export class MetronomeEngine {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;

        this.isPlaying = false;
        this.tempo = 120;
        this.beatsPerMeasure = 4;
        this.beatUnit = 4;
        this.subdivision = 1;
        this.soundPreset = 'click';
        this.volume = 0.8;

        this._nextNoteTime = 0;
        this._currentBeat = 0;
        this._timerWorker = null;
        this._lastTapTime = null;
        this._tapIntervals = [];

        this._onBeatCallbacks = [];
        this._onStateChangeCallbacks = [];
        this._onTempoChangeCallbacks = [];
    }

    // --- Observer registration ---

    onBeat(callback) {
        this._onBeatCallbacks.push(callback);
    }

    onStateChange(callback) {
        this._onStateChangeCallbacks.push(callback);
    }

    onTempoChange(callback) {
        this._onTempoChangeCallbacks.push(callback);
    }

    // --- Public API ---

    start() {
        if (this.isPlaying) return;

        this._initAudioContext();
        this.audioContext.resume();

        this._currentBeat = 0;
        this._nextNoteTime = this.audioContext.currentTime;
        this.isPlaying = true;

        this._startWorker();
        this._notifyStateChange();
    }

    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this._stopWorker();
        this._notifyStateChange();
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    setTempo(bpm) {
        this.tempo = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm)));
        this._notifyTempoChange();
    }

    setTimeSignature(beats, unit) {
        this.beatsPerMeasure = beats;
        this.beatUnit = unit;
        if (this.isPlaying) {
            this._currentBeat = 0;
        }
    }

    setSubdivision(sub) {
        this.subdivision = sub;
        if (this.isPlaying) {
            this._currentBeat = 0;
        }
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    setSoundPreset(key) {
        if (SOUND_PRESETS[key]) {
            this.soundPreset = key;
        }
    }

    tapTempo() {
        const now = performance.now();

        if (this._lastTapTime && (now - this._lastTapTime) < 2000) {
            this._tapIntervals.push(now - this._lastTapTime);
            if (this._tapIntervals.length > 4) {
                this._tapIntervals.shift();
            }
            const avgInterval = this._tapIntervals.reduce((a, b) => a + b, 0) / this._tapIntervals.length;
            const bpm = Math.round(60000 / avgInterval);
            this.setTempo(bpm);
        } else {
            this._tapIntervals = [];
        }

        this._lastTapTime = now;
    }

    // --- Private: Audio Context ---

    _initAudioContext() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);
    }

    // --- Private: Worker Management ---

    _startWorker() {
        if (!this._timerWorker) {
            try {
                this._timerWorker = new Worker(
                    new URL('./metronome-worker.js', import.meta.url),
                    { type: 'classic' }
                );
                this._timerWorker.onmessage = () => this._scheduler();
            } catch {
                // Fallback: use main-thread setInterval if Worker fails
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

    // --- Private: Scheduler (the lookahead pattern) ---

    _scheduler() {
        while (this._nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
            const beatInfo = this._classifyBeat(this._currentBeat);

            this._scheduleNote(beatInfo, this._nextNoteTime);
            this._notifyBeat(beatInfo, this._nextNoteTime);

            this._advanceBeat();
        }
    }

    _advanceBeat() {
        const secondsPerBeat = 60.0 / this.tempo;
        const secondsPerSubNote = secondsPerBeat / this.subdivision;
        this._nextNoteTime += secondsPerSubNote;

        this._currentBeat++;
        const totalSubBeats = this.beatsPerMeasure * this.subdivision;
        if (this._currentBeat >= totalSubBeats) {
            this._currentBeat = 0;
        }
    }

    _classifyBeat(beatIndex) {
        const subBeatInBeat = beatIndex % this.subdivision;
        const mainBeat = Math.floor(beatIndex / this.subdivision);

        let type;
        if (beatIndex === 0) {
            type = 'downbeat';
        } else if (subBeatInBeat === 0) {
            type = 'beat';
        } else {
            type = 'subdivision';
        }

        return { type, measureBeat: mainBeat, subBeat: subBeatInBeat };
    }

    _scheduleNote(beatInfo, time) {
        const preset = SOUND_PRESETS[this.soundPreset];
        if (preset) {
            preset.generate(this.audioContext, this.gainNode, beatInfo.type, time);
        }
    }

    // --- Private: Notifications ---

    _notifyBeat(beatInfo, time) {
        for (const cb of this._onBeatCallbacks) {
            cb(beatInfo, time);
        }
    }

    _notifyStateChange() {
        for (const cb of this._onStateChangeCallbacks) {
            cb(this.isPlaying);
        }
    }

    _notifyTempoChange() {
        for (const cb of this._onTempoChangeCallbacks) {
            cb(this.tempo);
        }
    }
}
