<template>
  <div class="dropdown control" @click.stop="toggle" :style="{ width }">
    <div ref="header" class="layout-h">
      <div class="header layout-fill">{{ value || placeholder || ''}}</div>
      <div class="arrow control">
        <i class="fa fa-angle-down"></i>
      </div>
    </div>

    <div ref="dropdown" class="dropdown-panel control" v-show="isOpen" :style="{ width }">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    props: {
      placeholder: String,
      value: String,
    },

    data() {
      return {
        width: undefined as string | undefined,
        isOpen: false,
      }
    },

    created() {
      this.calculateSize()
    },

    methods: {
      toggle() {
        // If clicking the header when already open...
        if (this.isOpen) {
          // Close
          this.isOpen = false
          return
        }

        this.isOpen = true

        const click = (ev: PointerEvent) => {
          // Guards
          if (ev.target && ev.target instanceof HTMLElement) {
            // Clicked a valid option...
            if (
              this.$refs.dropdown instanceof HTMLElement &&
              this.$refs.dropdown.contains(ev.target)
            ) {
              // Check for value attribute
              const attr = ev.target.attributes.getNamedItem('value')

              if (attr != null) {
                this.$emit('input', attr.value)
              }
              // Default to innerText like select
              else {
                this.$emit('input', ev.target.innerText)
              }

              this.isOpen = false
            }
            // Clicked somewhere outside...
            else if (!this.$el.contains(ev.target)) {
              this.isOpen = false
            }

            window.removeEventListener('pointerdown', click)
          }
        }

        window.addEventListener('pointerdown', click)
      },
      calculateSize() {
        this.isOpen = true

        this.$nextTick(() => {
          if (
            this.$refs.header instanceof HTMLElement &&
            this.$refs.dropdown instanceof HTMLElement
          ) {
            const headerSize = this.$refs.header.getBoundingClientRect()
            const panelSize = this.$refs.dropdown.getBoundingClientRect()
            this.width = `${Math.max(headerSize.width, panelSize.width)}px`
          }

          this.isOpen = false
        })
      },
    },
  })
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    min-height: 2.5em;
    line-height: 2.5em;
    cursor: default;
  }

  .header {
    padding: 0 1.2em;
  }

  .arrow {
    width: 2.5em;
    flex: 0 0 2.5em;
    text-align: center;
  }

  .dropdown-panel {
    position: absolute;
    top: 100%;
    left: 0;
  }

  .dropdown-panel > * {
    padding: 0 1.2em;
  }

  .dropdown-panel > *:hover {
    background: rgba(0, 0, 0, 0.25);
  }
</style>