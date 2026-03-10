import { RhythmEngine } from './rhythm-engine.js';
import { RhythmUI } from './rhythm-ui.js';

const engine = new RhythmEngine();
const ui = new RhythmUI(engine);
ui.init();
