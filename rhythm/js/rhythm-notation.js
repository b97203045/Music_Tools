/**
 * SVG rhythm notation renderer.
 *
 * Renders patterns on a single-line percussion staff with:
 * - x-shaped note heads, stems, flags/beams
 * - Rest symbols for gaps
 * - Barlines and time signature
 * - Color-coded feedback overlay
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Layout constants
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 15;
const STAFF_Y = 45;
const BEAT_WIDTH = 60;       // pixels per beat
const NOTE_HEAD_SIZE = 7;
const STEM_HEIGHT = 28;
const FLAG_WIDTH = 8;

// Colors
const COLOR_DEFAULT = '#e0e0e0';
const COLOR_PERFECT = '#4caf50';
const COLOR_GOOD = '#8bc34a';
const COLOR_OK = '#f5a623';
const COLOR_MISSED = '#e94560';
const COLOR_EXTRA = '#6a6a80';

const RATING_COLORS = {
    perfect: COLOR_PERFECT,
    good: COLOR_GOOD,
    ok: COLOR_OK,
    missed: COLOR_MISSED,
};

/**
 * Compute rest segments from the note array for a given measure span.
 * Returns array of { onset, duration, type } for rests.
 */
function computeRests(notes, beatsPerMeasure, measures) {
    const totalBeats = beatsPerMeasure * measures;
    const events = notes
        .map(n => ({ start: n.onset, end: n.onset + n.duration }))
        .sort((a, b) => a.start - b.start);

    const rests = [];
    let cursor = 0;

    for (const ev of events) {
        if (ev.start > cursor + 0.001) {
            const gap = ev.start - cursor;
            rests.push(...breakRestIntoValues(cursor, gap));
        }
        cursor = Math.max(cursor, ev.end);
    }

    if (cursor < totalBeats - 0.001) {
        rests.push(...breakRestIntoValues(cursor, totalBeats - cursor));
    }

    return rests;
}

function breakRestIntoValues(onset, duration) {
    const rests = [];
    let remaining = duration;
    let pos = onset;

    const values = [4, 2, 1, 0.5, 0.25];
    for (const v of values) {
        while (remaining >= v - 0.001) {
            let type;
            if (v >= 4) type = 'whole-rest';
            else if (v >= 2) type = 'half-rest';
            else if (v >= 1) type = 'quarter-rest';
            else if (v >= 0.5) type = 'eighth-rest';
            else type = 'sixteenth-rest';

            rests.push({ onset: pos, duration: v, type, isRest: true });
            pos += v;
            remaining -= v;
        }
    }

    return rests;
}

function getX(onset) {
    return MARGIN_LEFT + onset * BEAT_WIDTH;
}

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

/**
 * Draw a note head (x shape for percussion).
 */
function drawNoteHead(svg, x, y, color) {
    const s = NOTE_HEAD_SIZE;
    const g = createSVGElement('g', { stroke: color, 'stroke-width': '2', 'stroke-linecap': 'round' });
    g.appendChild(createSVGElement('line', { x1: x - s, y1: y - s, x2: x + s, y2: y + s }));
    g.appendChild(createSVGElement('line', { x1: x + s, y1: y - s, x2: x - s, y2: y + s }));
    svg.appendChild(g);
}

/**
 * Draw a stem.
 */
function drawStem(svg, x, y, color) {
    svg.appendChild(createSVGElement('line', {
        x1: x + NOTE_HEAD_SIZE, y1: y,
        x2: x + NOTE_HEAD_SIZE, y2: y - STEM_HEIGHT,
        stroke: color, 'stroke-width': '1.5',
    }));
}

/**
 * Draw flag(s) for eighth/sixteenth notes.
 */
function drawFlags(svg, x, y, count, color) {
    const stemX = x + NOTE_HEAD_SIZE;
    const stemTop = y - STEM_HEIGHT;

    for (let i = 0; i < count; i++) {
        const flagY = stemTop + i * 7;
        const path = `M ${stemX} ${flagY} Q ${stemX + FLAG_WIDTH} ${flagY + 5} ${stemX + 2} ${flagY + 12}`;
        svg.appendChild(createSVGElement('path', {
            d: path, fill: 'none', stroke: color, 'stroke-width': '1.5',
        }));
    }
}

/**
 * Draw a rest symbol.
 */
function drawRest(svg, x, y, type, color) {
    const textAttrs = {
        x, y: y + 5, fill: color,
        'font-size': '18', 'text-anchor': 'middle', 'font-family': 'serif',
    };

    let symbol;
    switch (type) {
        case 'whole-rest':
            // Rectangle below staff line
            svg.appendChild(createSVGElement('rect', {
                x: x - 8, y: y - 2, width: 16, height: 6,
                fill: color,
            }));
            return;
        case 'half-rest':
            // Rectangle above staff line
            svg.appendChild(createSVGElement('rect', {
                x: x - 8, y: y - 8, width: 16, height: 6,
                fill: color,
            }));
            return;
        case 'quarter-rest':
            symbol = '\u{1D13D}'; // Or use a simple zigzag path
            // Simplified quarter rest as zigzag
            svg.appendChild(createSVGElement('path', {
                d: `M ${x - 3} ${y - 12} L ${x + 4} ${y - 5} L ${x - 3} ${y + 2} L ${x + 4} ${y + 9}`,
                fill: 'none', stroke: color, 'stroke-width': '2', 'stroke-linecap': 'round',
            }));
            return;
        case 'eighth-rest':
            // Dot + diagonal line
            svg.appendChild(createSVGElement('circle', {
                cx: x + 2, cy: y - 7, r: 2.5, fill: color,
            }));
            svg.appendChild(createSVGElement('line', {
                x1: x + 2, y1: y - 7, x2: x - 4, y2: y + 6,
                stroke: color, 'stroke-width': '1.5',
            }));
            return;
        case 'sixteenth-rest':
            // Two dots + diagonal line
            svg.appendChild(createSVGElement('circle', {
                cx: x + 2, cy: y - 10, r: 2.5, fill: color,
            }));
            svg.appendChild(createSVGElement('circle', {
                cx: x + 4, cy: y - 3, r: 2.5, fill: color,
            }));
            svg.appendChild(createSVGElement('line', {
                x1: x + 2, y1: y - 10, x2: x - 4, y2: y + 6,
                stroke: color, 'stroke-width': '1.5',
            }));
            return;
    }
}

/**
 * Draw a single note with appropriate notation.
 */
function drawNote(svg, note, color) {
    const x = getX(note.onset);
    const y = STAFF_Y;

    if (note.isRest) {
        drawRest(svg, x + BEAT_WIDTH * note.duration / 2, y, note.type, color);
        return;
    }

    const type = note.type;

    // Note head
    drawNoteHead(svg, x, y, color);

    // Stem (everything except whole notes)
    if (type !== 'whole') {
        drawStem(svg, x, y, color);
    }

    // Flags
    if (type === 'eighth' || type === 'dotted-eighth') {
        drawFlags(svg, x, y, 1, color);
    } else if (type === 'sixteenth') {
        drawFlags(svg, x, y, 2, color);
    }

    // Dot for dotted notes
    if (type.startsWith('dotted-')) {
        svg.appendChild(createSVGElement('circle', {
            cx: x + NOTE_HEAD_SIZE + 5, cy: y + 5, r: 2.5, fill: color,
        }));
    }
}

/**
 * Render a pattern to an SVG element.
 *
 * @param {HTMLElement} container - DOM element to insert SVG into
 * @param {Object} pattern - Pattern object from rhythm-patterns.js
 * @param {Object|null} feedback - Result from engine.evaluate(), or null for plain display
 * @returns {SVGElement} The created SVG
 */
export function renderPattern(container, pattern, feedback = null) {
    container.innerHTML = '';

    const [beatsPerMeasure, beatUnit] = pattern.timeSignature;
    const totalBeats = pattern.measures * beatsPerMeasure;
    const width = MARGIN_LEFT + totalBeats * BEAT_WIDTH + MARGIN_RIGHT;
    const height = 90;

    const svg = createSVGElement('svg', {
        viewBox: `0 0 ${width} ${height}`,
        width: '100%',
        height: 'auto',
    });

    // Staff line
    svg.appendChild(createSVGElement('line', {
        x1: MARGIN_LEFT - 10, y1: STAFF_Y,
        x2: width - MARGIN_RIGHT, y2: STAFF_Y,
        stroke: '#3a3a5a', 'stroke-width': '1',
    }));

    // Time signature
    const tsGroup = createSVGElement('g', {
        fill: '#a0a0b0', 'font-size': '16', 'font-weight': 'bold',
        'font-family': 'serif', 'text-anchor': 'middle',
    });
    tsGroup.appendChild(createSVGElement('text', { x: 20, y: STAFF_Y - 6 }));
    tsGroup.lastChild.textContent = beatsPerMeasure;
    tsGroup.appendChild(createSVGElement('text', { x: 20, y: STAFF_Y + 14 }));
    tsGroup.lastChild.textContent = beatUnit;
    svg.appendChild(tsGroup);

    // Barlines
    for (let m = 0; m <= pattern.measures; m++) {
        const bx = MARGIN_LEFT + m * beatsPerMeasure * BEAT_WIDTH - (m === 0 ? 10 : 0);
        svg.appendChild(createSVGElement('line', {
            x1: m === 0 ? MARGIN_LEFT - 10 : bx,
            y1: STAFF_Y - 15,
            x2: m === 0 ? MARGIN_LEFT - 10 : bx,
            y2: STAFF_Y + 15,
            stroke: '#3a3a5a', 'stroke-width': m === pattern.measures ? '2' : '1',
        }));
    }

    // Beat guides (subtle dots under each beat)
    for (let b = 0; b < totalBeats; b++) {
        const bx = getX(b);
        svg.appendChild(createSVGElement('circle', {
            cx: bx, cy: STAFF_Y + 22, r: 1.5, fill: '#2a2a4a',
        }));
        // Beat number
        svg.appendChild(createSVGElement('text', {
            x: bx, y: STAFF_Y + 35, fill: '#4a4a6a',
            'font-size': '10', 'text-anchor': 'middle',
        })).textContent = (b % beatsPerMeasure) + 1;
    }

    // Compute rests
    const rests = computeRests(pattern.notes, beatsPerMeasure, pattern.measures);

    // Build a feedback color map (noteIndex → color)
    const noteColorMap = {};
    if (feedback) {
        for (const nr of feedback.noteResults) {
            noteColorMap[nr.noteIndex] = RATING_COLORS[nr.rating] || COLOR_DEFAULT;
        }
    }

    // Draw notes
    for (let i = 0; i < pattern.notes.length; i++) {
        const color = noteColorMap[i] || COLOR_DEFAULT;
        drawNote(svg, pattern.notes[i], color);
    }

    // Draw rests
    for (const rest of rests) {
        drawRest(svg, getX(rest.onset) + BEAT_WIDTH * rest.duration / 2, STAFF_Y, rest.type, '#6a6a80');
    }

    // Draw extra hit markers (if feedback)
    if (feedback) {
        for (const extra of feedback.extraHits) {
            const ex = getX(extra.beatPosition);
            // Small gray arrow above staff
            svg.appendChild(createSVGElement('path', {
                d: `M ${ex} ${STAFF_Y - 25} L ${ex - 4} ${STAFF_Y - 32} L ${ex + 4} ${STAFF_Y - 32} Z`,
                fill: COLOR_EXTRA,
            }));
        }
    }

    container.appendChild(svg);
    return svg;
}
