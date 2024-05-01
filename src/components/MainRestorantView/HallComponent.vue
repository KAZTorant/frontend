// HallComponent.vue
<template>
  <div class="hall">
    <div>{{ hallDetails.name }}</div>
    <div>{{ hallDetails.description }}</div>
  </div>
</template>

<script>
export default {
  props: ['hallDetails']
}
</script>
