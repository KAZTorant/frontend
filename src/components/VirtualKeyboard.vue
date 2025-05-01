<template>
    <div class="virtual-keyboard" v-show="isVisible">
      <div class="keyboard-container">
        <div class="keyboard-row">
          <button v-for="key in row1" :key="key" @click="addChar(key)" class="keyboard-key">{{ key }}</button>
        </div>
        <div class="keyboard-row">
          <button v-for="key in row2" :key="key" @click="addChar(key)" class="keyboard-key">{{ key }}</button>
        </div>
        <div class="keyboard-row">
          <button v-for="key in row3" :key="key" @click="addChar(key)" class="keyboard-key">{{ key }}</button>
        </div>
        <div class="keyboard-row">
          <button @click="toggleCaps" class="keyboard-key special-key" :class="{ 'active': capsLock }">
            <font-awesome-icon icon="arrow-up" />
          </button>
          <button v-for="key in row4" :key="key" @click="addChar(key)" class="keyboard-key">{{ key }}</button>
          <button @click="backspace" class="keyboard-key special-key">
            <font-awesome-icon icon="backspace" />
          </button>
        </div>
        <div class="keyboard-row">
          <button @click="toggleSymbols" class="keyboard-key special-key">
            {{ showSymbols ? 'ABC' : '!?#' }}
          </button>
          <button @click="addChar(' ')" class="keyboard-key space-key">Boşluq</button>
          <button @click="addChar('\n')" class="keyboard-key special-key">Enter</button>
          <button @click="hideKeyboard" class="keyboard-key special-key">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'VirtualKeyboard',
    props: {
      targetElement: {
        type: Object,
        default: null
      },
      isVisible: {
        type: Boolean,
        default: false
      },
      theme: {
        type: String,
        default: 'light',
        validator: (value) => ['light', 'dark', 'blue'].includes(value)
      }
    },
    data() {
      return {
        capsLock: false,
        showSymbols: false,
        standardRow1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        standardRow2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ö', 'ğ'],
        standardRow3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ı', 'ə'],
        standardRow4: ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ç', 'ş'],
        symbolRow1: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '™'],
        symbolRow2: ['-', '_', '=', '+', '[', ']', '{', '}', '\\', '|', '®'],
        symbolRow3: [';', ':', '\'', '"', ',', '.', '<', '>', '/', '?', '©'],
        symbolRow4: ['~', '`', '€', '£', '¥', '₺', '₽', '¢']
      }
    },
    computed: {
      row1() {
        return this.showSymbols ? this.symbolRow1 : this.standardRow1;
      },
      row2() {
        return this.showSymbols ? this.symbolRow2 : this.mapCapsIfNeeded(this.standardRow2);
      },
      row3() {
        return this.showSymbols ? this.symbolRow3 : this.mapCapsIfNeeded(this.standardRow3);
      },
      row4() {
        return this.showSymbols ? this.symbolRow4 : this.mapCapsIfNeeded(this.standardRow4);
      },
      themeClass() {
        return `theme-${this.theme}`;
      }
    },
    mounted() {
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener('click', this.handleOutsideClick);
    },
    beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape);
    document.removeEventListener('click', this.handleOutsideClick);
    },
    methods: {
      handleEscape(event) {
        if (event.key === 'Escape') {
          this.hideKeyboard();
        }
      },
      handleOutsideClick(event) {
        if (!this.$el.contains(event.target) && event.target !== this.targetElement) {
          this.hideKeyboard();
        }
      },
      mapCapsIfNeeded(row) {
        if (!this.capsLock) return row;
        return row.map(key => key.toUpperCase());
      },
      toggleCaps() {
        this.capsLock = !this.capsLock;
      },
      toggleSymbols() {
        this.showSymbols = !this.showSymbols;
      },
      addChar(char) {
        if (!this.targetElement) return;
        
        const start = this.targetElement.selectionStart;
        const end = this.targetElement.selectionEnd;
        const text = this.targetElement.value;
        
        this.targetElement.value = text.substring(0, start) + char + text.substring(end);
        
        // Set cursor position after inserted character
        this.$nextTick(() => {
          this.targetElement.selectionStart = start + char.length;
          this.targetElement.selectionEnd = start + char.length;
          this.targetElement.focus();
        });
        
        // Emit input event to trigger v-model updates
        this.targetElement.dispatchEvent(new Event('input'));
        
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }
      },
      backspace() {
        if (!this.targetElement) return;
        
        const start = this.targetElement.selectionStart;
        const end = this.targetElement.selectionEnd;
        const text = this.targetElement.value;
        
        if (start === end && start > 0) {
          // If no selection, delete character before cursor
          this.targetElement.value = text.substring(0, start - 1) + text.substring(end);
          
          this.$nextTick(() => {
            this.targetElement.selectionStart = start - 1;
            this.targetElement.selectionEnd = start - 1;
            this.targetElement.focus();
          });
        } else if (start !== end) {
          // If text is selected, delete selection
          this.targetElement.value = text.substring(0, start) + text.substring(end);
          
          this.$nextTick(() => {
            this.targetElement.selectionStart = start;
            this.targetElement.selectionEnd = start;
            this.targetElement.focus();
          });
        }
        
        // Emit input event to trigger v-model updates
        this.targetElement.dispatchEvent(new Event('input'));
        
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
      },
      hideKeyboard() {
        this.$emit('hide-keyboard');
      }
    }
  }
  </script>
  
  <style scoped>
.virtual-keyboard {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  z-index: 99999;
  background: rgba(245, 245, 245, 0.97);
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.15);
  border-top: 1px solid #ddd;
  border-radius: 20px 20px 0 0;
  padding: 8px 6px; /* Azaldılmış padding */
  animation: slideIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.virtual-keyboard.theme-dark {
  background: rgba(30, 30, 35, 0.95);
  border-top: 1px solid #444;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.3);
}

.virtual-keyboard.theme-blue {
  background: rgba(230, 240, 255, 0.97);
  border-top: 1px solid #c8d8f8;
  box-shadow: 0 -4px 15px rgba(30, 80, 180, 0.15);
}

@keyframes slideIn {
  from { transform: translateX(-50%) translateY(100%); }
  to { transform: translateX(-50%) translateY(0); }
}

.keyboard-container {
  width: max-content;
  margin: 0 auto;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.keyboard-key {
  min-width: 65px;
  height: 40px;
  margin: 0 3px;
  border: none;
  background: #fff;
  border-radius: 8px;
  font-size: 1.6em;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.theme-dark .keyboard-key {
  background: #3a3a40;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid #4c4c52;
}

.theme-blue .keyboard-key {
  background: #f0f6ff;
  color: #245bc0;
  box-shadow: 0 2px 6px rgba(30, 80, 180, 0.15), 0 1px 2px rgba(30, 80, 180, 0.1);
}

.keyboard-key:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12), 0 2px 3px rgba(0, 0, 0, 0.12);
}

.theme-dark .keyboard-key:hover {
  background: #4e4e58;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3), 0 2px 3px rgba(0, 0, 0, 0.25);
  border-color: #5c5c66;
}

.theme-blue .keyboard-key:hover {
  background: #e6f0ff;
  box-shadow: 0 3px 8px rgba(30, 80, 180, 0.2), 0 2px 3px rgba(30, 80, 180, 0.15);
}

.keyboard-key:active {
  background: #e8e8e8;
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.theme-dark .keyboard-key:active {
  background: #333338;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translateY(2px);
  border-color: #4c4c56;
}

.theme-blue .keyboard-key:active {
  background: #d8e8ff;
  box-shadow: 0 1px 2px rgba(30, 80, 180, 0.1);
}

.special-key {
  min-width: 50px;
  height: 40px;
  background: #e8e8e8;
  font-weight: 600;
  color: #555;
}

.theme-dark .special-key {
  background: #2a2a30;
  color: #ffffff;
  border: 1px solid #3c3c42;
}

.theme-blue .special-key {
  background: #d8e8ff;
  color: #1050c0;
}

.special-key.active {
  background: #2ecc71;
  color: white;
}

.theme-dark .special-key.active {
  background: #27c065;
  color: #ffffff;
  border-color: #32d675;
}

.theme-blue .special-key.active {
  background: #3080ff;
}

.space-key {
  flex-grow: 1;
  max-width: 200px;
  height: 40px;
  border-radius: 12px;
  font-size: 0.95em;
}

@media (max-width: 1500px) {
  .virtual-keyboard{
    display: none;
  }
}

@media (max-width: 430px) {
  .keyboard-key {
    min-width: 27px;
    height: 34px;
    font-size: 0.85em;
    margin: 0 1px;
  }

  .special-key {
    min-width: 40px;
    height: 34px;
  }

  .virtual-keyboard {
    padding: 4px 2px;
  }

  .keyboard-row {
    margin-bottom: 3px;
  }
}

/* Dark mode system preference */
@media (prefers-color-scheme: dark) {
  .virtual-keyboard:not(.theme-light):not(.theme-blue) {
    background: rgba(40, 40, 45, 0.95);
    border-top: 1px solid #444;
  }

  .virtual-keyboard:not(.theme-light):not(.theme-blue) .keyboard-key {
    background: #3a3a40;
    color: #f5f5f5;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  .virtual-keyboard:not(.theme-light):not(.theme-blue) .keyboard-key:hover {
    background: #45454a;
  }

  .virtual-keyboard:not(.theme-light):not(.theme-blue) .keyboard-key:active {
    background: #333338;
  }

  .virtual-keyboard:not(.theme-light):not(.theme-blue) .special-key {
    background: #2a2a30;
    color: #ccc;
  }

  .virtual-keyboard:not(.theme-light):not(.theme-blue) .special-key.active {
    background: #22aa60;
  }
}
</style>
