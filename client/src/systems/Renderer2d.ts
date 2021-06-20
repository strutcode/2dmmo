import {
  Application,
  Container,
  Graphics,
  ISpritesheetData,
  Sprite as PixiSprite,
  Spritesheet,
  Texture,
} from 'pixi.js'

import Entity from '../../../common/engine/Entity'
import System from '../../../common/engine/System'
import CameraFollow from '../components/CameraFollow'
import InputQueue from '../components/InputQueue'
import LatencyGraph from '../components/LatencyGraph'
import Sprite from '../components/Sprite'
import SpriteLoadQueue from '../components/SpriteLoadQueue'

const sheetData: Record<string, ISpritesheetData> = {
  'tilemap/grass': {
    frames: {
      0_0: {
        frame: {
          x: 0,
          y: 0,
          w: 16,
          h: 16,
        },
      },
      1_0: {
        frame: {
          x: 16,
          y: 0,
          w: 16,
          h: 16,
        },
      },
      0_1: {
        frame: {
          x: 0,
          y: 16,
          w: 16,
          h: 16,
        },
      },
      1_1: {
        frame: {
          x: 16,
          y: 16,
          w: 16,
          h: 16,
        },
      },
    },
    meta: {
      scale: '1',
    },
  },
  'creatures/castle': {
    frames: {
      soldier_stand_0: {
        frame: {
          x: 0,
          y: 16 * 16,
          w: 16,
          h: 16,
        },
      },
      soldier_stand_1: {
        frame: {
          x: 16,
          y: 16 * 16,
          w: 16,
          h: 16,
        },
      },
      soldier_stand_2: {
        frame: {
          x: 32,
          y: 16 * 16,
          w: 16,
          h: 16,
        },
      },
      soldier_stand_3: {
        frame: {
          x: 48,
          y: 16 * 16,
          w: 16,
          h: 16,
        },
      },
    },
    meta: {
      scale: '1',
    },
  },
}

export default class Renderer2d extends System {
  /** The Pixi.js application currently used for rendering */
  private app = new Application({
    resizeTo: window,
  })

  /**
   * The virtual camera container. There's no real camera system in Pixi but
   * a fine alternative is the usual graphics approach of simply offsetting
   * and scaling everything to simulate a camera moving.
   *
   * Containers work exceptionally well for this so everything in the "viewport"
   * of the cmaera will exist in this container. Things outside will float on top.
   */
  private world = new Container()

  /** A canvas used for rendering the latency graph since it's not easily represented by images */
  private latency = new Graphics()

  /** Stores visual representations by entity */
  private spriteMap = new Map<Entity, PixiSprite>()
  /** Stores textures by asset name */
  private textureMap = new Map<string, Texture>()

  public start() {
    // Pixi doesn't initialize right away so wait a loop
    setTimeout(() => {
      // Add the canvas
      document.body.appendChild(this.app.view)

      // Set up the virtual camera container
      this.world.scale.x = 4
      this.world.scale.y = 4
      this.app.stage.addChild(this.world)

      // Add the latency graph display
      this.app.stage.addChild(this.latency)
    })
  }

  public update() {
    // Load texture data sent by the server
    const queue = this.engine.getComponent(SpriteLoadQueue)
    if (queue) {
      // For each image waiting to be processed...
      queue.data.forEach((sprite, i) => {
        // Create a data url image and pass it to Pixi
        const img = new Image()
        img.src = `data:image/png;base64,${sprite.data}`
        const tex = Texture.from(img)

        const sheet = new Spritesheet(tex, sheetData[sprite.name])

        sheet.parse(() => {
          // Add all the sheet entries to the cache
          for (let name in sheet.textures) {
            this.textureMap.set(name, sheet.textures[name])
          }
        })

        // Record it in asset cache
        this.textureMap.set(sprite.name, tex)

        // Clear the entry from the queue
        queue.data.splice(i, 1)
      })
    }

    // Update sprites
    this.engine.getAllComponents(Sprite).forEach((sprite) => {
      // If no graphics representation exists for this component yet, create it
      if (!this.spriteMap.has(sprite.entity)) {
        // Default to a plain white texture
        const newSprite = PixiSprite.from(Texture.WHITE)

        // Add it to the virtual camera
        this.world.addChild(newSprite)

        // Save it to the data map
        this.spriteMap.set(sprite.entity, newSprite)
      }

      // Process inputs for optimistic movement. These may later be overidden by the server.
      const queue = sprite.entity.getComponent(InputQueue)
      if (queue) {
        queue.actions.forEach((action) => {
          if (action === 'up') {
            sprite.y -= 16
          } else if (action === 'down') {
            sprite.y += 16
          } else if (action === 'left') {
            sprite.x -= 16
          } else if (action === 'right') {
            sprite.x += 16
          }
        })
      }

      // Get the graphics representation for this component
      const pixiSprite = this.spriteMap.get(sprite.entity)
      if (pixiSprite) {
        const spriteName = `${sprite.name}_${sprite.currentFrame}`

        // If the asset is loaded, assign the texture
        if (this.textureMap.has(spriteName)) {
          pixiSprite.texture = this.textureMap.get(spriteName) as Texture
        }

        // Synchronize the properties
        pixiSprite.x = sprite.x
        pixiSprite.y = sprite.y
        pixiSprite.rotation = sprite.r
        pixiSprite.width = sprite.width
        pixiSprite.height = sprite.height
      }
    })

    // Update the camera
    const target = this.engine.getComponent(CameraFollow)
    if (target) {
      // Get the sprite on the same component to use for positioning
      const targetSprite = target.entity.getComponent(Sprite)

      if (targetSprite) {
        // Offset everything in the world by the poisition of the followed sprite minus half the viewport size to center it
        this.world.x =
          this.app.view.width / 2 - targetSprite.x * this.world.scale.x
        this.world.y =
          this.app.view.height / 2 - targetSprite.y * this.world.scale.y
      }
    }

    // Build the latency graph
    const graph = this.engine.getComponent(LatencyGraph)
    if (graph) {
      // Set the position to the bottom right corner eadch frame in case of resize
      this.latency.x = this.app.view.width - 100
      this.latency.y = this.app.view.height - 50

      // Clear the previously drawn graph to transparent
      this.latency.clear()

      // TODO: Won't draw without this for some reason. wtf pixi.
      this.latency.beginFill(0xffffff, 0)
      this.latency.drawRect(0, 0, 100, 50)
      this.latency.endFill()

      // Get the data and normalize
      const history = graph.historyWindow
      const max = 100
      const barWidth = this.latency.width / 50

      // Actually draw the graph
      // Start from the latest entry on the right in case there's not a full graph worth of data
      this.latency.beginFill(0xff0000)
      history.reverse().forEach((point, n) => {
        // Get the size of the bar relative to the graph height
        const percent = point / max

        this.latency.drawRect(
          // n bar widths from the right
          this.latency.width - barWidth * n,
          // `percent` from the bottom
          this.latency.height - this.latency.height * percent,
          // The calculated width
          barWidth,
          // `percent` of the graph height as the height
          this.latency.height * percent,
        )
      })
      this.latency.endFill()
    }

    // Clean up graphics representations for any destroyed components
    // TODO: Don't do this. Need a much better system
    this.spriteMap.forEach((pixiSprite, entity) => {
      // If entity no longer exists
      if (!this.engine.getEntity(entity.id)) {
        // Destroy the representation
        pixiSprite.destroy()
        // Remove it from the records
        this.spriteMap.delete(entity)
      }
    })
  }
}
