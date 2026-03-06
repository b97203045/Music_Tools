import { TEMPO_PRESETS, getTempoMarking } from './tempo-presets.js';
import { SOUND_PRESETS } from './sound-library.js';

const TIME_SIGNATURES = [
    { beats: 2, unit: 4 },
    { beats: 3, unit: 4 },
    { beats: 4, unit: 4 },
    { beats: 5, unit: 4 },
    { beats: 6, unit: 8 },
    { beats: 7, unit: 8 },
];

const SUBDIVISIONS = [
    { value: 1, label: '\u2669 Quarter' },
    { value: 2, label: '\u266A Eighth' },
    { value: 3, label: 'Triplet' },
    { value: 4, label: '\u266C Sixteenth' },
];

export class MetronomeUI {
    constructor(engine) {
        this.engine = engine;
        this.isMuted = false;
        this._previousVolume = engine.volume;
        this._beatDots = [];
    }

    init() {
        this._cacheElements();
        this._buildDynamicUI();
        this._bindEvents();
        this._bindEngineCallbacks();
        this._initKeyboardShortcuts();
        this._syncUI();
    }

    // --- DOM element caching ---

    _cacheElements() {
        this.els = {
            beatDots:      document.getElementById('beatDots'),
            bpmInput:      document.getElementById('bpmInput'),
            bpmSlider:     document.getElementById('bpmSlider'),
            tempoLabel:    document.getElementById('tempoLabel'),
            playBtn:       document.getElementById('playBtn'),
            tapBtn:        document.getElementById('tapBtn'),
            tsButtons:     document.getElementById('tsButtons'),
            subButtons:    document.getElementById('subButtons'),
            soundSelect:   document.getElementById('soundSelect'),
            volumeSlider:  document.getElementById('volumeSlider'),
            presetButtons: document.getElementById('presetButtons'),
        };
    }

    // --- Dynamic UI generation ---

    _buildDynamicUI() {
        this._buildBeatDots();
        this._buildSoundSelect();
        this._buildPresetButtons();
    }

    _buildBeatDots() {
        this.els.beatDots.innerHTML = '';
        this._beatDots = [];

        for (let i = 0; i < this.engine.beatsPerMeasure; i++) {
            const dot = document.createElement('div');
            dot.className = 'beat-dot';
            dot.dataset.beat = i;
            this.els.beatDots.appendChild(dot);
            this._beatDots.push(dot);
        }
    }

    _buildSoundSelect() {
        this.els.soundSelect.innerHTML = '';
        for (const [key, preset] of Object.entries(SOUND_PRESETS)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = preset.label;
            if (key === this.engine.soundPreset) option.selected = true;
            this.els.soundSelect.appendChild(option);
        }
    }

    _buildPresetButtons() {
        this.els.presetButtons.innerHTML = '';
        for (const preset of TEMPO_PRESETS) {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = preset.name;
            btn.dataset.bpm = preset.defaultBpm;
            btn.title = `${preset.minBpm}–${preset.maxBpm} BPM`;
            this.els.presetButtons.appendChild(btn);
        }
    }

    // --- Event binding ---

    _bindEvents() {
        // Play / Stop
        this.els.playBtn.addEventListener('click', () => this.engine.toggle());

        // Tap tempo
        this.els.tapBtn.addEventListener('click', () => this.engine.tapTempo());

        // BPM input
        this.els.bpmInput.addEventListener('change', () => {
            this.engine.setTempo(parseInt(this.els.bpmInput.value, 10) || 120);
            this._syncUI();
        });

        // BPM slider
        this.els.bpmSlider.addEventListener('input', () => {
            this.engine.setTempo(parseInt(this.els.bpmSlider.value, 10));
            this._syncUI();
        });

        // BPM adjust buttons (±1, ±5)
        document.querySelectorAll('.bpm-adjust').forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = parseInt(btn.dataset.delta, 10);
                this.engine.setTempo(this.engine.tempo + delta);
                this._syncUI();
            });
        });

        // Time signature buttons
        this.els.tsButtons.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const beats = parseInt(btn.dataset.beats, 10);
            const unit = parseInt(btn.dataset.unit, 10);
            this.engine.setTimeSignature(beats, unit);
            this._buildBeatDots();
            this._updateActiveButton(this.els.tsButtons, btn);
        });

        // Subdivision buttons
        this.els.subButtons.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const sub = parseInt(btn.dataset.sub, 10);
            this.engine.setSubdivision(sub);
            this._updateActiveButton(this.els.subButtons, btn);
        });

        // Sound select
        this.els.soundSelect.addEventListener('change', () => {
            this.engine.setSoundPreset(this.els.soundSelect.value);
        });

        // Volume slider
        this.els.volumeSlider.addEventListener('input', () => {
            const vol = parseInt(this.els.volumeSlider.value, 10) / 100;
            this.engine.setVolume(vol);
            this.isMuted = false;
        });

        // Tempo preset buttons
        this.els.presetButtons.addEventListener('click', (e) => {
            const btn = e.target.closest('.preset-btn');
            if (!btn) return;
            const bpm = parseInt(btn.dataset.bpm, 10);
            this.engine.setTempo(bpm);
            this._syncUI();
        });
    }

    _bindEngineCallbacks() {
        this.engine.onStateChange((isPlaying) => {
            this.els.playBtn.textContent = isPlaying ? 'STOP' : 'PLAY';
            this.els.playBtn.classList.toggle('playing', isPlaying);
        });

        this.engine.onBeat((beatInfo, scheduledTime) => {
            // Only flash dots on main beats (not subdivisions)
            if (beatInfo.subBeat !== 0) return;

            const delay = (scheduledTime - this.engine.audioContext.currentTime) * 1000;
            setTimeout(() => {
                requestAnimationFrame(() => {
                    this._flashBeatDot(beatInfo.measureBeat, beatInfo.type);
                });
            }, Math.max(0, delay));
        });

        this.engine.onTempoChange(() => {
            this._syncUI();
        });
    }

    // --- Visual beat display ---

    _flashBeatDot(beatIndex, type) {
        // Remove active from all dots
        for (const dot of this._beatDots) {
            dot.classList.remove('active', 'downbeat');
        }

        const dot = this._beatDots[beatIndex];
        if (!dot) return;

        dot.classList.add('active');
        if (type === 'downbeat') dot.classList.add('downbeat');

        // Remove class after animation ends
        const onEnd = () => {
            dot.classList.remove('active', 'downbeat');
            dot.removeEventListener('animationend', onEnd);
        };
        dot.addEventListener('animationend', onEnd);
    }

    // --- Keyboard shortcuts ---

    _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't intercept when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.engine.toggle();
                    break;

                case 'ArrowUp':
                case 'ArrowRight':
                    e.preventDefault();
                    this.engine.setTempo(this.engine.tempo + (e.shiftKey ? 5 : 1));
                    this._syncUI();
                    break;

                case 'ArrowDown':
                case 'ArrowLeft':
                    e.preventDefault();
                    this.engine.setTempo(this.engine.tempo - (e.shiftKey ? 5 : 1));
                    this._syncUI();
                    break;

                case 'KeyT':
                    this.engine.tapTempo();
                    break;

                case 'KeyM':
                    this._toggleMute();
                    break;

                case 'Digit1':
                    this._selectSubdivision(1);
                    break;
                case 'Digit2':
                    this._selectSubdivision(2);
                    break;
                case 'Digit3':
                    this._selectSubdivision(3);
                    break;
                case 'Digit4':
                    this._selectSubdivision(4);
                    break;

                case 'BracketLeft':
                    this._cycleTimeSignature(-1);
                    break;
                case 'BracketRight':
                    this._cycleTimeSignature(1);
                    break;
            }
        });
    }

    _toggleMute() {
        if (this.isMuted) {
            this.engine.setVolume(this._previousVolume);
            this.els.volumeSlider.value = Math.round(this._previousVolume * 100);
            this.isMuted = false;
        } else {
            this._previousVolume = this.engine.volume;
            this.engine.setVolume(0);
            this.els.volumeSlider.value = 0;
            this.isMuted = true;
        }
    }

    _selectSubdivision(sub) {
        this.engine.setSubdivision(sub);
        const btns = this.els.subButtons.querySelectorAll('button');
        for (const btn of btns) {
            btn.classList.toggle('active', parseInt(btn.dataset.sub, 10) === sub);
        }
    }

    _cycleTimeSignature(direction) {
        const currentIndex = TIME_SIGNATURES.findIndex(
            ts => ts.beats === this.engine.beatsPerMeasure && ts.unit === this.engine.beatUnit
        );
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = TIME_SIGNATURES.length - 1;
        if (newIndex >= TIME_SIGNATURES.length) newIndex = 0;

        const ts = TIME_SIGNATURES[newIndex];
        this.engine.setTimeSignature(ts.beats, ts.unit);
        this._buildBeatDots();

        const btns = this.els.tsButtons.querySelectorAll('button');
        for (const btn of btns) {
            btn.classList.toggle('active',
                parseInt(btn.dataset.beats, 10) === ts.beats &&
                parseInt(btn.dataset.unit, 10) === ts.unit
            );
        }
    }

    // --- UI sync ---

    _syncUI() {
        this.els.bpmInput.value = this.engine.tempo;
        this.els.bpmSlider.value = this.engine.tempo;
        this.els.tempoLabel.textContent = getTempoMarking(this.engine.tempo);

        // Highlight active tempo preset
        const presetBtns = this.els.presetButtons.querySelectorAll('.preset-btn');
        const marking = getTempoMarking(this.engine.tempo);
        for (const btn of presetBtns) {
            btn.classList.toggle('active', btn.textContent === marking);
        }
    }

    _updateActiveButton(container, activeBtn) {
        for (const btn of container.querySelectorAll('button')) {
            btn.classList.toggle('active', btn === activeBtn);
        }
    }
}
