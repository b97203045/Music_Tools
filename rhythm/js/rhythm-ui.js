import { PHASES } from './rhythm-engine.js';
import { renderPattern } from './rhythm-notation.js';

export class RhythmUI {
    constructor(engine) {
        this.engine = engine;
        this._elements = {};
    }

    init() {
        this._cacheElements();
        this._buildBeatDots();
        this._bindEvents();
        this._bindEngineCallbacks();
        this._updatePhaseUI(PHASES.IDLE);
    }

    // --- DOM Caching ---

    _cacheElements() {
        const $ = (id) => document.getElementById(id);
        this._elements = {
            phaseBanner: $('phase-banner'),
            beatDisplay: $('beat-display'),
            notationArea: $('notation-area'),
            scoreSection: $('score-section'),
            scoreGrade: $('score-grade'),
            scorePercent: $('score-percent'),
            scoreBreakdown: $('score-breakdown'),
            bpmInput: $('bpm-input'),
            bpmSlider: $('bpm-slider'),
            bpmDown1: $('bpm-down-1'),
            bpmDown5: $('bpm-down-5'),
            bpmUp1: $('bpm-up-1'),
            bpmUp5: $('bpm-up-5'),
            timeSigGroup: $('time-sig-group'),
            difficultyGroup: $('difficulty-group'),
            measuresGroup: $('measures-group'),
            btnStart: $('btn-start'),
            btnStop: $('btn-stop'),
            btnRetry: $('btn-retry'),
            btnNext: $('btn-next'),
        };
    }

    // --- Build Beat Dots ---

    _buildBeatDots() {
        const el = this._elements.beatDisplay;
        el.innerHTML = '';
        for (let i = 0; i < this.engine.beatsPerMeasure; i++) {
            const dot = document.createElement('div');
            dot.className = 'beat-dot' + (i === 0 ? ' downbeat' : '');
            dot.textContent = i + 1;
            el.appendChild(dot);
        }
    }

    // --- Event Binding ---

    _bindEvents() {
        const e = this._elements;

        // BPM controls
        e.bpmInput.addEventListener('change', () => {
            this.engine.setTempo(parseInt(e.bpmInput.value, 10));
            this._syncBpmUI();
        });

        e.bpmSlider.addEventListener('input', () => {
            this.engine.setTempo(parseInt(e.bpmSlider.value, 10));
            this._syncBpmUI();
        });

        e.bpmDown1.addEventListener('click', () => this._adjustBpm(-1));
        e.bpmDown5.addEventListener('click', () => this._adjustBpm(-5));
        e.bpmUp1.addEventListener('click', () => this._adjustBpm(1));
        e.bpmUp5.addEventListener('click', () => this._adjustBpm(5));

        // Time signature
        e.timeSigGroup.addEventListener('click', (ev) => {
            const btn = ev.target.closest('button');
            if (!btn) return;
            this._setActiveInGroup(e.timeSigGroup, btn);
            this.engine.setTimeSignature(
                parseInt(btn.dataset.beats, 10),
                parseInt(btn.dataset.unit, 10)
            );
            this._buildBeatDots();
        });

        // Difficulty
        e.difficultyGroup.addEventListener('click', (ev) => {
            const btn = ev.target.closest('button');
            if (!btn) return;
            this._setActiveInGroup(e.difficultyGroup, btn);
            this.engine.setDifficulty(btn.dataset.difficulty);
        });

        // Measures
        e.measuresGroup.addEventListener('click', (ev) => {
            const btn = ev.target.closest('button');
            if (!btn) return;
            this._setActiveInGroup(e.measuresGroup, btn);
            this.engine.setMeasureCount(parseInt(btn.dataset.measures, 10));
        });

        // Action buttons
        e.btnStart.addEventListener('click', () => this.engine.startSession());
        e.btnStop.addEventListener('click', () => this.engine.stop());
        e.btnRetry.addEventListener('click', () => this.engine.retry());
        e.btnNext.addEventListener('click', () => this.engine.next());

        // Keyboard
        document.addEventListener('keydown', (ev) => this._handleKeydown(ev));
    }

    _bindEngineCallbacks() {
        this.engine.onPhaseChange((phase) => this._updatePhaseUI(phase));

        this.engine.onBeat((beatInfo, time) => {
            // Flash beat dot with scheduled delay for visual sync
            const delay = Math.max(0, (time - this.engine.audioContext.currentTime) * 1000);
            setTimeout(() => this._flashBeatDot(beatInfo), delay);
        });

        this.engine.onScore((result) => {
            this._showScore(result);
        });
    }

    // --- Keyboard ---

    _handleKeydown(ev) {
        // Don't capture if typing in an input
        if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') return;

        const phase = this.engine.phase;

        if (ev.code === 'Space') {
            ev.preventDefault();
            if (phase === PHASES.IDLE) {
                this.engine.startSession();
            } else if (phase !== PHASES.RESULT) {
                this.engine.stop();
            }
            return;
        }

        if (phase === PHASES.RESULT) {
            if (ev.code === 'KeyR') {
                ev.preventDefault();
                this.engine.retry();
            } else if (ev.code === 'KeyN') {
                ev.preventDefault();
                this.engine.next();
            }
            return;
        }

        // Any key = hit during IMITATING
        if (phase === PHASES.IMITATING) {
            ev.preventDefault();
            this.engine.recordHit(this.engine.audioContext.currentTime);
            this._flashHitIndicator();
        }
    }

    // --- UI Updates ---

    _updatePhaseUI(phase) {
        const e = this._elements;
        const banner = e.phaseBanner;

        // Reset classes
        banner.className = 'phase-banner';

        // Show/hide buttons
        e.btnStart.classList.toggle('hidden', phase !== PHASES.IDLE);
        e.btnStop.classList.toggle('hidden', phase === PHASES.IDLE || phase === PHASES.RESULT);
        e.btnRetry.classList.toggle('hidden', phase !== PHASES.RESULT);
        e.btnNext.classList.toggle('hidden', phase !== PHASES.RESULT);
        e.scoreSection.classList.toggle('hidden', phase !== PHASES.RESULT);

        // Disable settings during active session
        const settingsDisabled = phase !== PHASES.IDLE && phase !== PHASES.RESULT;
        document.querySelectorAll('.settings-section button, .settings-section input').forEach(el => {
            el.disabled = settingsDisabled;
        });

        switch (phase) {
            case PHASES.IDLE:
                banner.textContent = 'Press Start to begin';
                e.notationArea.innerHTML = '';
                break;
            case PHASES.COUNT_IN:
                banner.textContent = 'Listen...';
                banner.classList.add('listen');
                e.notationArea.innerHTML = '';
                e.scoreSection.classList.add('hidden');
                break;
            case PHASES.DEMO:
                banner.textContent = 'Listen to the pattern...';
                banner.classList.add('demo');
                break;
            case PHASES.IMITATING:
                banner.textContent = 'Your turn! Press any key';
                banner.classList.add('your-turn');
                break;
            case PHASES.RESULT:
                banner.textContent = 'Results';
                banner.classList.add('result');
                // Render notation with feedback
                if (this.engine.currentPattern) {
                    const result = this.engine.evaluate();
                    renderPattern(e.notationArea, this.engine.currentPattern, result);
                }
                break;
        }
    }

    _flashBeatDot(beatInfo) {
        const dots = this._elements.beatDisplay.children;
        const idx = beatInfo.measureBeat;
        if (idx >= dots.length) return;

        // Remove active from all
        for (const dot of dots) {
            dot.classList.remove('active');
        }

        const dot = dots[idx];
        dot.classList.add('active');

        // Remove after animation
        const handler = () => {
            dot.classList.remove('active');
            dot.removeEventListener('animationend', handler);
        };
        dot.addEventListener('animationend', handler);
    }

    _flashHitIndicator() {
        const banner = this._elements.phaseBanner;
        banner.style.transform = 'scale(1.03)';
        setTimeout(() => {
            banner.style.transform = '';
        }, 80);
    }

    _showScore(result) {
        if (!result) return;
        const e = this._elements;

        // Grade
        e.scoreGrade.textContent = result.grade;
        e.scoreGrade.className = 'score-grade grade-' + result.grade.toLowerCase();

        // Percent
        e.scorePercent.textContent = result.score + '%';

        // Breakdown
        e.scoreBreakdown.innerHTML = '';
        const stats = [
            { label: 'Perfect', value: result.counts.perfect, color: '#4caf50' },
            { label: 'Good', value: result.counts.good, color: '#8bc34a' },
            { label: 'OK', value: result.counts.ok, color: '#f5a623' },
            { label: 'Missed', value: result.counts.missed, color: '#e94560' },
            { label: 'Extra', value: result.extraHits.length, color: '#6a6a80' },
        ];

        for (const stat of stats) {
            const div = document.createElement('div');
            div.className = 'stat';
            div.innerHTML = `<span class="stat-value" style="color:${stat.color}">${stat.value}</span><span>${stat.label}</span>`;
            e.scoreBreakdown.appendChild(div);
        }

        e.scoreSection.classList.remove('hidden');
    }

    // --- Helpers ---

    _adjustBpm(delta) {
        this.engine.setTempo(this.engine.tempo + delta);
        this._syncBpmUI();
    }

    _syncBpmUI() {
        this._elements.bpmInput.value = this.engine.tempo;
        this._elements.bpmSlider.value = this.engine.tempo;
    }

    _setActiveInGroup(group, activeBtn) {
        for (const btn of group.querySelectorAll('button')) {
            btn.classList.toggle('active', btn === activeBtn);
        }
    }
}
