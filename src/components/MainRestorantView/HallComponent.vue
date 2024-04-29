// HallComponent.vue
<template>
  <div class="hall">
    <div>{{ hallDetails.number }}</div>
    <div>{{ hallDetails.tableRange }}</div>
  </div>
</template>

<script>
export default {
  props: ['hallDetails']
}
</script>
