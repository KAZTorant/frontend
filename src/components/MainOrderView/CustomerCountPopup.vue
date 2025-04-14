<template>
  <div v-if="show">
    <Teleport to="body">
      <div class="customer-count-popup">
        <div class="popup-content">
          <h3>Müştəri sayını seçin</h3>
          <div class="customer-count-buttons">
            <button 
              v-for="count in 10" 
              :key="count"
              @click="selectCount(count)"
              class="count-button"
              :class="{ 'selected': selectedCount === count }"
            >
              {{ count }}
            </button>
          </div>
          <div class="popup-actions">
            <button @click="confirm" class="confirm-button">Təsdiqlə</button>
            <button @click="close" class="cancel-button">Ləğv et</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: 'CustomerCountPopup',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  emits: ['confirm', 'close'],
  data() {
    return {
      selectedCount: 1
    }
  },
  methods: {
    selectCount(count) {
      this.selectedCount = count;
    },
    confirm() {
      this.$emit('confirm', this.selectedCount);
    },
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.customer-count-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
}

h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5em;
}

.customer-count-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.count-button {
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 1.2em;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.count-button:hover {
  background: #f8f9fa;
  border-color: #2ecc71;
}

.count-button.selected {
  background: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

.popup-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirm-button,
.cancel-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-button {
  background: #2ecc71;
  color: white;
  border: none;
}

.confirm-button:hover {
  background: #27ae60;
}

.cancel-button {
  background: white;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.cancel-button:hover {
  background: #f8f9fa;
  border-color: #6c757d;
}

@media (max-width: 768px) {
  .popup-content {
    padding: 20px;
  }

  .customer-count-buttons {
    grid-template-columns: repeat(3, 1fr);
  }

  .count-button {
    padding: 12px;
    font-size: 1.1em;
  }

  .confirm-button,
  .cancel-button {
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .popup-content {
    padding: 15px;
  }

  .customer-count-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .count-button {
    padding: 10px;
    font-size: 1em;
  }

  .confirm-button,
  .cancel-button {
    padding: 8px 16px;
  }
}
</style> 