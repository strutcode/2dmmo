<template>
  <div>
    <form method="GET" action="/game">
      <div>
        <label for="name">Display Name</label>
      </div>
      <div>
        <input type="text" name="name" value="Soandso" />
      </div>

      <div class="spacer"></div>

      <div>
        <label for="name">Avatar</label>
      </div>
      <div class="charSelect">
        <div class="option">
          <div :style="imageStyle[0]"></div>
          <input type="radio" name="sprite" value="swordman" checked />
        </div>
        <div class="option">
          <div :style="imageStyle[1]"></div>
          <input type="radio" name="sprite" value="pikeman" />
        </div>
        <div class="option">
          <div :style="imageStyle[2]"></div>
          <input type="radio" name="sprite" value="bowman" />
        </div>
        <div class="option">
          <div :style="imageStyle[3]"></div>
          <input type="radio" name="sprite" value="monk" />
        </div>
      </div>

      <div class="spacer"></div>

      <div>
        <button type="submit">Launch Game</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import background from '../assets/Castle(AllFrame).png'
  console.log(`url(${background})`)

  export default Vue.extend({
    computed: {
      imageStyle() {
        const tileSize = 64
        const props = [
          {
            backgroundPosition: `0px -${tileSize * 15}px`,
          },
          {
            backgroundPosition: '0px 0px',
          },
          {
            backgroundPosition: `0px -${tileSize * 5}px`,
          },
          {
            backgroundPosition: `0px -${tileSize * 20}px`,
          },
        ]

        return props.map((o) => ({
          width: '64px',
          height: '64px',
          backgroundImage: `url("${background}")`,
          backgroundSize: '400%',
          ...o,
        }))
      },
    },
  })
</script>

<style scoped>
  .spacer {
    height: 1.5rem;
  }

  .charSelect {
    display: flex;
    flex-flow: row wrap;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
  }

  .charSelect > div {
    text-align: center;
    margin-right: 1.5rem;
  }
</style>
