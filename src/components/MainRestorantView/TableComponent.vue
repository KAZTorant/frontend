// TableComponent.vue
<template>
  <div class="table">
    <div>{{ tableDetails.number }}</div>
    <div>{{ tableDetails.waitress.name }}</div>
    <div>{{ tableDetails.total_price }}</div>
    <div>{{ tableDetails.serviceTax }}</div>
  </div>
</template>

<script>
export default {
  props: ['tableDetails']
}
</script>
