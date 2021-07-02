import { CompositeTilemap } from '@pixi/tilemap'
import {
  Application,
  Container,
  Graphics,
  MIPMAP_MODES,
  SCALE_MODES,
  Sprite as PixiSprite,
  Spritesheet,
  Text,
  Texture,
} from 'pixi.js'

import System from '../../../common/engine/System'
import CameraFollow from '../components/CameraFollow'
import CardData from '../components/CardData'
import Creature from '../components/Creature'
import InputQueue from '../components/InputQueue'
import LatencyGraph from '../components/LatencyGraph'
import Sprite from '../components/Sprite'
import SpriteLoadQueue from '../components/SpriteLoadQueue'
import TileMap from '../components/TileMap'

import sheetData from '../misc/spriteData'

type AnimationData = {
  lastTime: number
  cumulativeTime: number
}

type MobData = {
  sprite: PixiSprite
  nametag: Text
}

export default class Renderer2d extends System {
  /** The Pixi.js application currently used for rendering */
  private app = new Application({
    resizeTo: window,
  })

  /** Current viewport scaling factor, useful for keeping sizes consistent */
  private scale = 4

  private viewRange = 8

  /**
   * The virtual camera container. There's no real camera system in Pixi but
   * a fine alternative is the usual graphics approach of simply offsetting
   * and scaling everything to simulate a camera moving.
   *
   * Containers work exceptionally well for this so everything in the "viewport"
   * of the cmaera will exist in this container. Things outside will float on top.
   */
  private world = new Container()
  /** Graphical representation of the background */
  private tileMap = new CompositeTilemap()
  /** A layer for high resolution non-pixel graphics */
  private uiLayer = new Container()

  /** A canvas used for rendering the latency graph since it's not easily represented by images */
  private latency = new Graphics()

  /** Stores visual representations by entity */
  private spriteMap = new Map<Sprite, MobData>()
  /** Stores textures by asset name */
  private textureMap = new Map<string, Texture>()
  /** Stores animation data for a sprite */
  private animationData = new Map<Sprite, AnimationData>()

  public start() {
    // Pixi doesn't initialize right away so wait a loop
    setTimeout(() => {
      // Add the canvas
      document.body.appendChild(this.app.view)

      // Set up the virtual camera container
      this.world.scale.x = this.scale
      this.world.scale.y = this.scale
      this.app.stage.addChild(this.world)

      // Set up the tile map
      this.world.addChild(this.tileMap)

      // Set up the non-pixel graphics layer
      this.app.stage.addChild(this.uiLayer)

      // Add the latency graph display
      this.app.stage.addChild(this.latency)
    })
  }

  public update() {
    this.updateViewport()
    this.loadTextureData()
    this.loadMapData()
    this.updateSprites()
    this.updateCamera()
    this.updateCardUses()
    this.updateLatencyGraph()
    this.cleanUpSprites()
  }

  /** Handles client window resizing and other viewport activity */
  private updateViewport() {
    // Adjust the scale to fit the current window size
    const idealSize = (this.viewRange * 2 + 1) * 16
    const actualSize = Math.max(window.innerWidth, window.innerHeight)
    this.scale = actualSize / idealSize

    // Resize world container to the updated scale
    this.world.scale.x = this.scale
    this.world.scale.y = this.scale
  }

  /** Handles image data transmitted over the socket */
  private loadTextureData() {
    // Load texture data sent by the server
    this.engine.with(SpriteLoadQueue, (queue) => {
      // For each image waiting to be processed...
      queue.data.forEach((sprite, i) => {
        // Create a data url image and pass it to Pixi
        const img = new Image()
        img.src = `data:image/png;base64,${sprite.data}`
        const tex = Texture.from(img, {
          // Set optiosn for pixel art
          mipmap: MIPMAP_MODES.OFF,
          anisotropicLevel: 0,
          scaleMode: SCALE_MODES.NEAREST,
        })

        console.log(`Loaded sheet ${sprite.name}`)

        // If the data is a tilemap
        // TODO: ew.
        if (sprite.name.startsWith('tilemap')) {
          this.tileMap.tileset([tex.baseTexture])
        }
        // If the data is a sprite sheet
        else {
          // Create a spritesheet so we can use parts of the image
          const sheet = new Spritesheet(tex, sheetData[sprite.name])
          sheet.parse(() => {
            // Add all the sheet entries to the cache
            for (let name in sheet.textures) {
              this.textureMap.set(name, sheet.textures[name])
            }
          })
        }

        // Record it in asset cache
        this.textureMap.set(sprite.name, tex)

        // Clear the entry from the queue
        queue.data.splice(i, 1)
      })
    })
  }

  /** Handles tile map data transmitted over the socket */
  private loadMapData() {
    // Load tile data sent by the server
    this.engine.with(TileMap, (tilemap) => {
      // Iterate chunks to load
      tilemap.toLoad.forEach((chunk, i) => {
        // Load all layers in the chunk
        chunk.layers.forEach((layer) => {
          // Load all tiles in the layer
          layer.forEach((tile, index) => {
            // Get the physical position of the tile
            // TODO: sync actual chunk size
            const x = chunk.x + (index % 16)
            const y = chunk.y + Math.floor(index / 16)

            // Get the texture position of the tile
            const u = (tile % 16) * 16
            const v = Math.floor(tile / 16) * 16

            this.tileMap.tile(
              0, // Tileset index
              x * 16, // Pixel position
              y * 16, // Pixel position
              {
                // Options
                u,
                v,
                tileWidth: 16,
                tileHeight: 16,
              },
            )
          })
        })

        // Remove the loaded chunk from the queue
        tilemap.toLoad.splice(i, 1)
      })
    })
  }

  /** Handles visuals of dynamic entities (sprites) */
  private updateSprites() {
    // Update sprites
    this.engine.getAllComponents(Sprite).forEach((sprite) => {
      // If no graphics representation exists for this component yet, create it
      if (!this.spriteMap.has(sprite)) {
        // Default to a plain white texture
        const newSprite = PixiSprite.from(Texture.WHITE)

        // Add it to the virtual camera
        this.world.addChild(newSprite)

        sprite.entity.with(Creature, (meta) => {
          // Create a floating name tag
          const nametag = new Text(meta?.name ?? 'Soandso', {
            fontSize: 4 * this.scale,
            fill: 0xffffff,
            fontWeight: '600',
            dropShadow: true,
            dropShadowDistance: 2,
            dropShadowBlur: 3,
            dropShadowAlpha: 1,
            align: 'center',
          })

          // Add it to the non-pixel layer
          this.uiLayer.addChild(nametag)

          // Save everything to the data map
          this.spriteMap.set(sprite, {
            sprite: newSprite,
            nametag,
          })
        })
      }

      // Simple animation
      {
        // Get data or default
        const animData = this.animationData.get(sprite) || {
          lastTime: performance.now(),
          cumulativeTime: 0,
        }

        // Advance time
        const nextTime = performance.now()
        animData.cumulativeTime += nextTime - animData.lastTime
        animData.lastTime = nextTime

        // Update frame
        const frameTime = 1000 / sprite.fps
        const remainder = animData.cumulativeTime % frameTime
        sprite.currentFrame += Math.floor(animData.cumulativeTime / frameTime)

        // Simple dynamic looping mechanism
        if (!this.textureMap.has(`${sprite.name}_${sprite.currentFrame}`)) {
          // Reset the frame to 0 if there's no texture for the current animation frame
          sprite.currentFrame = 0
        }

        // Update data
        animData.cumulativeTime = remainder
        this.animationData.set(sprite, animData)
      }

      // Process inputs for optimistic movement. These may later be overidden by the server.
      sprite.entity.with(InputQueue, (queue) => {
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
      })

      // Get the graphics representation for this component
      const mobData = this.spriteMap.get(sprite)
      if (mobData) {
        const spriteName = `${sprite.name}_${sprite.currentFrame}`
        const pixiSprite = mobData.sprite

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

        // Update the nametag
        const nametag = mobData.nametag

        nametag.x = sprite.x * this.scale + 8 * this.scale - nametag.width / 2
        nametag.y = sprite.y * this.scale - 2 * this.scale
      }
    })
  }

  /** Handles camera updates to view different parts of the world */
  private updateCamera() {
    // Update the camera
    this.engine.with(CameraFollow, (target) => {
      // Use the sprite component for positioning
      target.entity.with(Sprite, (sprite) => {
        // Set the top/left corner to the sprite coordinates
        this.world.x = -sprite.x * this.scale
        this.world.y = -sprite.y * this.scale

        // Offset by half the sprite's size so the corner is in the center of it
        this.world.x -= (sprite.width / 2) * this.scale
        this.world.y -= (sprite.height / 2) * this.scale

        // Offset by half the viewport size to center the target in the viewport
        this.world.x += this.app.view.width / 2
        this.world.y += this.app.view.height / 2

        // Offset the high res graphics layer by the same amount
        this.uiLayer.x = this.world.x
        this.uiLayer.y = this.world.y
      })
    })
  }

  /** Updates the visual latency graph */
  private updateLatencyGraph() {
    // Build the latency graph
    this.engine.with(LatencyGraph, (graph) => {
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
        const percent = Math.min(point / max, 1)

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
    })
  }

  private updateCardUses() {
    this.engine.with(CardData, (data) => {
      data.useQueue.forEach((use) => {
        if (use.tileX != null || use.tileY != null) {
          return
        }

        use.tileX = Math.floor((-this.world.x + use.windowX) / this.scale / 16)
        use.tileY = Math.floor((-this.world.y + use.windowY) / this.scale / 16)

        this.engine.forEachComponent(Sprite, (sprite) => {
          if (
            Math.floor(sprite.x / 16) === use.tileX &&
            Math.floor(sprite.y / 16) === use.tileY
          ) {
            use.entityId = sprite.entity.id
          }
        })
      })
    })
  }

  /** Removes third party resources tied to engine sprites */
  private cleanUpSprites() {
    // Clean up graphics representations for any destroyed components
    this.engine.forEachDeleted(Sprite, (component) => {
      const mobData = this.spriteMap.get(component)

      if (mobData) {
        // Destroy the representations
        mobData.sprite.destroy()
        mobData.nametag.destroy()

        // Remove it from the records
        this.spriteMap.delete(component)
      }
    })
  }
}
