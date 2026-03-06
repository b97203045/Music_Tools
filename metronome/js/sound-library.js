/**
 * Sound presets for the metronome.
 * Each preset has a `label` and a `generate` function that creates and schedules
 * Web Audio nodes for a single click at a precise time.
 *
 * generate(audioContext, destination, beatType, time)
 *   - audioContext: AudioContext
 *   - destination: AudioNode to connect to (master gain)
 *   - beatType: 'downbeat' | 'beat' | 'subdivision'
 *   - time: AudioContext time to play at
 */

function createNoiseBuffer(audioContext, duration) {
    const sampleRate = audioContext.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

const BEAT_CONFIG = {
    downbeat:    { gainMultiplier: 1.0, freqMultiplier: 1.5 },
    beat:        { gainMultiplier: 0.75, freqMultiplier: 1.0 },
    subdivision: { gainMultiplier: 0.4, freqMultiplier: 0.7 },
};

export const SOUND_PRESETS = {
    click: {
        label: 'Click',
        generate(audioContext, destination, beatType, time) {
            const config = BEAT_CONFIG[beatType];
            const duration = 0.03;
            const noiseBuffer = createNoiseBuffer(audioContext, duration);

            const source = audioContext.createBufferSource();
            source.buffer = noiseBuffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000 * config.freqMultiplier + 2000;
            filter.Q.value = 1.5;

            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(config.gainMultiplier, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(destination);

            source.start(time);
            source.stop(time + duration);
        }
    },

    beep: {
        label: 'Beep',
        generate(audioContext, destination, beatType, time) {
            const config = BEAT_CONFIG[beatType];
            const duration = 0.06;

            const freqs = { downbeat: 880, beat: 660, subdivision: 440 };
            const freq = freqs[beatType];

            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(config.gainMultiplier * 0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);
            gain.connect(destination);

            osc.start(time);
            osc.stop(time + duration);
        }
    },

    woodblock: {
        label: 'Woodblock',
        generate(audioContext, destination, beatType, time) {
            const config = BEAT_CONFIG[beatType];
            const duration = 0.025;

            const noiseBuffer = createNoiseBuffer(audioContext, duration);
            const source = audioContext.createBufferSource();
            source.buffer = noiseBuffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800 * config.freqMultiplier + 400;
            filter.Q.value = 8;

            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(config.gainMultiplier * 0.8, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(destination);

            source.start(time);
            source.stop(time + duration);
        }
    },

    rimshot: {
        label: 'Rimshot',
        generate(audioContext, destination, beatType, time) {
            const config = BEAT_CONFIG[beatType];

            // Sine component — short tonal burst
            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 200 * config.freqMultiplier;

            const oscGain = audioContext.createGain();
            oscGain.gain.setValueAtTime(config.gainMultiplier * 0.4, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01);

            osc.connect(oscGain);
            oscGain.connect(destination);
            osc.start(time);
            osc.stop(time + 0.015);

            // Noise component — high-passed snap
            const noiseBuffer = createNoiseBuffer(audioContext, 0.02);
            const source = audioContext.createBufferSource();
            source.buffer = noiseBuffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 5000;

            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(config.gainMultiplier * 0.6, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

            source.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(destination);

            source.start(time);
            source.stop(time + 0.02);
        }
    },

    hihat: {
        label: 'Hi-Hat',
        generate(audioContext, destination, beatType, time) {
            const config = BEAT_CONFIG[beatType];
            const duration = beatType === 'downbeat' ? 0.08 : 0.04;

            const noiseBuffer = createNoiseBuffer(audioContext, duration);
            const source = audioContext.createBufferSource();
            source.buffer = noiseBuffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 7000;

            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(config.gainMultiplier * 0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(destination);

            source.start(time);
            source.stop(time + duration);
        }
    },
};
