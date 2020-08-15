import Vue from 'vue'
import EditorState from '../src/editor/EditorState'

declare module 'vue/types/vue' {
  interface Vue {
    $state: EditorState
  }
}
