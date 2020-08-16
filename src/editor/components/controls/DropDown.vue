<template>
  <div class="dropdown control" @click.stop="toggle">
    <div ref="header" class="layout-h">
      <div class="layout-fill">{{ value || placeholder || ''}}</div>
      <div>
        <i class="fa fa-angle-down"></i>
      </div>
    </div>

    <div ref="dropdown" class="dropdown-panel control" v-show="isOpen">
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
        isOpen: false,
      }
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
    },
  })
</script>

<style scoped>
  .dropdown {
    position: relative;
    min-height: 1.8em;
    line-height: 1.8em;
    padding: 0 0.5em;
    cursor: pointer;
  }

  .dropdown-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
  }

  .dropdown-panel > * {
    padding: 0 0.5em;
  }

  .dropdown-panel > *:hover {
    background: rgba(0, 0, 0, 0.25);
  }
</style>