// HallListComponent.vue
<template>
  <div>
    <hall-component
      v-for="hall in halls"
      :key="hall.id"
      :hall-details="hall"
    ></hall-component>
  </div>
</template>

<script>
import HallComponent from './HallComponent.vue';

export default {
  components: {
    HallComponent
  },
  props: ['halls']
}
</script>
