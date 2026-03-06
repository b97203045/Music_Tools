import { MetronomeEngine } from './metronome-engine.js';
import { MetronomeUI } from './metronome-ui.js';

const engine = new MetronomeEngine();
const ui = new MetronomeUI(engine);
ui.init();
