import { ISpritesheetData } from '@pixi/spritesheet'

// TODO: This data should be dynamic
export default {
  'creatures/castle': {
    frames: {
      pikeman_stand_0: {
        frame: {
          x: 0,
          y: 16 * 0,
          w: 16,
          h: 16,
        },
      },
      pikeman_stand_1: {
        frame: {
          x: 16,
          y: 16 * 0,
          w: 16,
          h: 16,
        },
      },
      pikeman_stand_2: {
        frame: {
          x: 32,
          y: 16 * 0,
          w: 16,
          h: 16,
        },
      },
      pikeman_stand_3: {
        frame: {
          x: 48,
          y: 16 * 0,
          w: 16,
          h: 16,
        },
      },
      bowman_stand_0: {
        frame: {
          x: 0,
          y: 16 * 5,
          w: 16,
          h: 16,
        },
      },
      bowman_stand_1: {
        frame: {
          x: 16,
          y: 16 * 5,
          w: 16,
          h: 16,
        },
      },
      bowman_stand_2: {
        frame: {
          x: 32,
          y: 16 * 5,
          w: 16,
          h: 16,
        },
      },
      bowman_stand_3: {
        frame: {
          x: 48,
          y: 16 * 5,
          w: 16,
          h: 16,
        },
      },
      swordman_stand_0: {
        frame: {
          x: 0,
          y: 16 * 15,
          w: 16,
          h: 16,
        },
      },
      swordman_stand_1: {
        frame: {
          x: 16,
          y: 16 * 15,
          w: 16,
          h: 16,
        },
      },
      swordman_stand_2: {
        frame: {
          x: 32,
          y: 16 * 15,
          w: 16,
          h: 16,
        },
      },
      swordman_stand_3: {
        frame: {
          x: 48,
          y: 16 * 15,
          w: 16,
          h: 16,
        },
      },
      monk_stand_0: {
        frame: {
          x: 0,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
      monk_stand_1: {
        frame: {
          x: 16,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
      monk_stand_2: {
        frame: {
          x: 32,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
      monk_stand_3: {
        frame: {
          x: 48,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
    },
    meta: {
      scale: '1',
    },
  },
  'creatures/rampart': {
    frames: {
      deer_stand_0: {
        frame: {
          x: 0,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
      deer_stand_1: {
        frame: {
          x: 16,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
      deer_stand_2: {
        frame: {
          x: 32,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
      deer_stand_3: {
        frame: {
          x: 48,
          y: 16 * 20,
          w: 16,
          h: 16,
        },
      },
    },
    meta: {
      scale: '1',
    },
  },
  'items/misc1': {
    frames: {
      doodad_0: {
        frame: {
          x: 0,
          y: 0,
          w: 16,
          h: 16,
        },
      },
    },
    meta: {
      scale: '1',
    },
  },
} as Record<string, ISpritesheetData>
