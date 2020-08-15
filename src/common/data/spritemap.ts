export default {
  soldier: {
    _asset: 'creaturesCastle',
    idle: {
      row: 15,
      frames: 4,
    },
    walk: {
      row: 16,
      frames: 4,
      next: 'idle',
    },
    attack: {
      row: 17,
      frames: 4,
      fps: 8,
      loop: false,
      next: 'idle',
    },
    hit: {
      row: 18,
      frames: 4,
      fps: 8,
      loop: false,
      next: 'idle',
    },
    die: {
      row: 19,
      frames: 4,
      loop: false,
    },
  },
  deer: {
    _asset: 'creaturesRampart',
    idle: {
      row: 20,
      frames: 4,
    },
    walk: {
      row: 21,
      frames: 4,
      next: 'idle',
    },
    attack: {
      row: 22,
      frames: 4,
      fps: 8,
      loop: false,
      next: 'idle',
    },
    hit: {
      row: 23,
      frames: 4,
      fps: 8,
      loop: false,
      next: 'idle',
    },
    die: {
      row: 24,
      frames: 4,
      loop: false,
    },
  },
} as const
