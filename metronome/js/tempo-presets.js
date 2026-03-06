export const TEMPO_PRESETS = [
    { name: 'Grave',        minBpm: 20,  maxBpm: 40,  defaultBpm: 35  },
    { name: 'Largo',        minBpm: 40,  maxBpm: 55,  defaultBpm: 48  },
    { name: 'Larghetto',    minBpm: 55,  maxBpm: 65,  defaultBpm: 60  },
    { name: 'Adagio',       minBpm: 65,  maxBpm: 75,  defaultBpm: 70  },
    { name: 'Andante',      minBpm: 75,  maxBpm: 85,  defaultBpm: 80  },
    { name: 'Andantino',    minBpm: 85,  maxBpm: 97,  defaultBpm: 90  },
    { name: 'Moderato',     minBpm: 97,  maxBpm: 110, defaultBpm: 105 },
    { name: 'Allegretto',   minBpm: 110, maxBpm: 125, defaultBpm: 116 },
    { name: 'Allegro',      minBpm: 125, maxBpm: 150, defaultBpm: 138 },
    { name: 'Vivace',       minBpm: 150, maxBpm: 170, defaultBpm: 160 },
    { name: 'Presto',       minBpm: 170, maxBpm: 200, defaultBpm: 185 },
    { name: 'Prestissimo',  minBpm: 200, maxBpm: 600, defaultBpm: 220 },
];

/**
 * Returns the tempo marking name for a given BPM value.
 */
export function getTempoMarking(bpm) {
    for (const preset of TEMPO_PRESETS) {
        if (bpm >= preset.minBpm && bpm <= preset.maxBpm) {
            return preset.name;
        }
    }
    if (bpm < TEMPO_PRESETS[0].minBpm) return TEMPO_PRESETS[0].name;
    return TEMPO_PRESETS[TEMPO_PRESETS.length - 1].name;
}
