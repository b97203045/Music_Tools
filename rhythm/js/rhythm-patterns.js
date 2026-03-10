/**
 * Rhythm pattern library.
 *
 * Each pattern is an object:
 *   {
 *     notes: [{ onset, duration, type }],  // onset & duration in beat units
 *     timeSignature: [beatsPerMeasure, beatUnit],
 *     measures: number
 *   }
 *
 * onset: beat position (0-based, 0 = beat 1)
 * duration: in quarter-note units (1 = quarter, 0.5 = eighth, etc.)
 * type: display name for notation ('whole','half','quarter','eighth','sixteenth',
 *       'dotted-half','dotted-quarter','dotted-eighth',
 *       'quarter-rest','eighth-rest','half-rest','whole-rest','sixteenth-rest')
 *
 * Rest types are NOT included in the notes array — rests are implied by gaps.
 * The notes array only contains *struck* notes.
 */

// ─── 4/4 patterns ──────────────────────────────────────────────

const FOUR_FOUR_BEGINNER = [
    // All quarters
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Half + two quarters
    { notes: [
        { onset: 0, duration: 2, type: 'half' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Two quarters + half
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Two halves
    { notes: [
        { onset: 0, duration: 2, type: 'half' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Whole note
    { notes: [
        { onset: 0, duration: 4, type: 'whole' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter rest on beat 1
    { notes: [
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter rest on beat 3
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Half + half rest (beats 1-2 sound, 3-4 silent)
    { notes: [
        { onset: 0, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter rest on beat 4
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Half, quarter, quarter rest
    { notes: [
        { onset: 0, duration: 2, type: 'half' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter rest, half, quarter
    { notes: [
        { onset: 1, duration: 2, type: 'half' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter, quarter rest, quarter, quarter
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },
];

const FOUR_FOUR_INTERMEDIATE = [
    // Two eighths + two quarters + half
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter + two eighths + quarter + quarter
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Four eighths + half
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Dotted quarter + eighth + half
    { notes: [
        { onset: 0, duration: 1.5, type: 'dotted-quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Half + dotted quarter + eighth
    { notes: [
        { onset: 0, duration: 2, type: 'half' },
        { onset: 2, duration: 1.5, type: 'dotted-quarter' },
        { onset: 3.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [4, 4], measures: 1 },

    // Simple syncopation: eighth + quarter + eighth + half
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 1, type: 'quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Eighth rest + eighth + quarter + two eighths + quarter
    { notes: [
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 0.5, type: 'eighth' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Quarter + eighth rest + eighth + quarter + quarter
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Two eighths + quarter + two eighths + quarter
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 0.5, type: 'eighth' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // All eighths
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 0.5, type: 'eighth' },
        { onset: 3, duration: 0.5, type: 'eighth' },
        { onset: 3.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [4, 4], measures: 1 },

    // Dotted quarter + eighth + dotted quarter + eighth
    { notes: [
        { onset: 0, duration: 1.5, type: 'dotted-quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1.5, type: 'dotted-quarter' },
        { onset: 3.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [4, 4], measures: 1 },

    // Syncopation: quarter + quarter + eighth + quarter + eighth
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 1, type: 'quarter' },
        { onset: 3.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [4, 4], measures: 1 },
];

const FOUR_FOUR_ADVANCED = [
    // Four sixteenths + two eighths + half
    { notes: [
        { onset: 0, duration: 0.25, type: 'sixteenth' },
        { onset: 0.25, duration: 0.25, type: 'sixteenth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Dotted eighth + sixteenth + quarter + dotted eighth + sixteenth + quarter
    { notes: [
        { onset: 0, duration: 0.75, type: 'dotted-eighth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 0.75, type: 'dotted-eighth' },
        { onset: 2.75, duration: 0.25, type: 'sixteenth' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Sixteenth rest + 3 sixteenths + two eighths + quarter + quarter
    { notes: [
        { onset: 0.25, duration: 0.25, type: 'sixteenth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Complex syncopation: eighth + sixteenth + sixteenth + quarter + eighth + quarter + eighth
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 1, type: 'quarter' },
        { onset: 3.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [4, 4], measures: 1 },

    // Four sixteenths + four sixteenths + half
    { notes: [
        { onset: 0, duration: 0.25, type: 'sixteenth' },
        { onset: 0.25, duration: 0.25, type: 'sixteenth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.25, type: 'sixteenth' },
        { onset: 1.25, duration: 0.25, type: 'sixteenth' },
        { onset: 1.5, duration: 0.25, type: 'sixteenth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Dotted quarter + eighth + four sixteenths + quarter
    { notes: [
        { onset: 0, duration: 1.5, type: 'dotted-quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 0.25, type: 'sixteenth' },
        { onset: 2.25, duration: 0.25, type: 'sixteenth' },
        { onset: 2.5, duration: 0.25, type: 'sixteenth' },
        { onset: 2.75, duration: 0.25, type: 'sixteenth' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Two eighths + sixteenth rest + 3 sixteenths + two eighths + quarter
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1.25, duration: 0.25, type: 'sixteenth' },
        { onset: 1.5, duration: 0.25, type: 'sixteenth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 0.5, type: 'eighth' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Eighth + 2 sixteenths + eighth + 2 sixteenths + half
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.25, type: 'sixteenth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
        { onset: 2, duration: 2, type: 'half' },
    ], timeSignature: [4, 4], measures: 1 },

    // Dotted eighth + sixteenth + dotted eighth + sixteenth + dotted eighth + sixteenth + quarter
    { notes: [
        { onset: 0, duration: 0.75, type: 'dotted-eighth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.75, type: 'dotted-eighth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
        { onset: 2, duration: 0.75, type: 'dotted-eighth' },
        { onset: 2.75, duration: 0.25, type: 'sixteenth' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },

    // Sixteenth + eighth + sixteenth + quarter + quarter + quarter
    { notes: [
        { onset: 0, duration: 0.25, type: 'sixteenth' },
        { onset: 0.25, duration: 0.5, type: 'eighth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
        { onset: 3, duration: 1, type: 'quarter' },
    ], timeSignature: [4, 4], measures: 1 },
];

// ─── 3/4 patterns ──────────────────────────────────────────────

const THREE_FOUR_BEGINNER = [
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 2, type: 'half' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 2, type: 'half' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 2, type: 'half' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },
];

const THREE_FOUR_INTERMEDIATE = [
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1.5, type: 'dotted-quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1.5, type: 'dotted-quarter' },
        { onset: 2.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },
];

const THREE_FOUR_ADVANCED = [
    { notes: [
        { onset: 0, duration: 0.25, type: 'sixteenth' },
        { onset: 0.25, duration: 0.25, type: 'sixteenth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 0.75, type: 'dotted-eighth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.75, type: 'dotted-eighth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 1, type: 'quarter' },
        { onset: 2, duration: 0.5, type: 'eighth' },
        { onset: 2.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [3, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 0.25, type: 'sixteenth' },
        { onset: 1.25, duration: 0.25, type: 'sixteenth' },
        { onset: 1.5, duration: 0.25, type: 'sixteenth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
        { onset: 2, duration: 1, type: 'quarter' },
    ], timeSignature: [3, 4], measures: 1 },
];

// ─── 2/4 patterns ──────────────────────────────────────────────

const TWO_FOUR_BEGINNER = [
    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 1, type: 'quarter' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 2, type: 'half' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 1, duration: 1, type: 'quarter' },
    ], timeSignature: [2, 4], measures: 1 },
];

const TWO_FOUR_INTERMEDIATE = [
    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 1, type: 'quarter' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1.5, type: 'dotted-quarter' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0.5, duration: 0.5, type: 'eighth' },
        { onset: 1, duration: 1, type: 'quarter' },
    ], timeSignature: [2, 4], measures: 1 },
];

const TWO_FOUR_ADVANCED = [
    { notes: [
        { onset: 0, duration: 0.25, type: 'sixteenth' },
        { onset: 0.25, duration: 0.25, type: 'sixteenth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 1, type: 'quarter' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 0.75, type: 'dotted-eighth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.75, type: 'dotted-eighth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 0.5, type: 'eighth' },
        { onset: 0.5, duration: 0.25, type: 'sixteenth' },
        { onset: 0.75, duration: 0.25, type: 'sixteenth' },
        { onset: 1, duration: 0.5, type: 'eighth' },
        { onset: 1.5, duration: 0.5, type: 'eighth' },
    ], timeSignature: [2, 4], measures: 1 },

    { notes: [
        { onset: 0, duration: 1, type: 'quarter' },
        { onset: 1, duration: 0.25, type: 'sixteenth' },
        { onset: 1.25, duration: 0.25, type: 'sixteenth' },
        { onset: 1.5, duration: 0.25, type: 'sixteenth' },
        { onset: 1.75, duration: 0.25, type: 'sixteenth' },
    ], timeSignature: [2, 4], measures: 1 },
];

// ─── Pattern registry ──────────────────────────────────────────

const PATTERN_POOL = {
    '4/4': { beginner: FOUR_FOUR_BEGINNER, intermediate: FOUR_FOUR_INTERMEDIATE, advanced: FOUR_FOUR_ADVANCED },
    '3/4': { beginner: THREE_FOUR_BEGINNER, intermediate: THREE_FOUR_INTERMEDIATE, advanced: THREE_FOUR_ADVANCED },
    '2/4': { beginner: TWO_FOUR_BEGINNER, intermediate: TWO_FOUR_INTERMEDIATE, advanced: TWO_FOUR_ADVANCED },
};

/**
 * Build a multi-measure pattern by concatenating single-measure patterns.
 * For 1-measure requests, returns a single pattern directly.
 * For multi-measure, picks `measureCount` patterns and offsets their onsets.
 */
function buildPattern(difficulty, beatsPerMeasure, beatUnit, measureCount) {
    const key = `${beatsPerMeasure}/${beatUnit}`;
    const pool = PATTERN_POOL[key]?.[difficulty];
    if (!pool || pool.length === 0) {
        return null;
    }

    if (measureCount === 1) {
        const pattern = pool[Math.floor(Math.random() * pool.length)];
        return { ...pattern };
    }

    // Pick measureCount patterns (allow repeats but avoid immediate repetition)
    const picked = [];
    let lastIndex = -1;
    for (let m = 0; m < measureCount; m++) {
        let idx;
        do {
            idx = Math.floor(Math.random() * pool.length);
        } while (pool.length > 1 && idx === lastIndex);
        picked.push(pool[idx]);
        lastIndex = idx;
    }

    // Concatenate notes with offset
    const allNotes = [];
    for (let m = 0; m < picked.length; m++) {
        const offset = m * beatsPerMeasure;
        for (const note of picked[m].notes) {
            allNotes.push({
                onset: note.onset + offset,
                duration: note.duration,
                type: note.type,
            });
        }
    }

    return {
        notes: allNotes,
        timeSignature: [beatsPerMeasure, beatUnit],
        measures: measureCount,
    };
}

/**
 * Get the total duration in beats for a pattern.
 */
function getPatternDurationBeats(pattern) {
    return pattern.measures * pattern.timeSignature[0];
}

export { buildPattern, getPatternDurationBeats, PATTERN_POOL };
