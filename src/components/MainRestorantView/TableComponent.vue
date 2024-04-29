// TableComponent.vue
<template>
  <div class="table">
    <div>{{ tableDetails.number }}</div>
    <div>{{ tableDetails.occupant }}</div>
    <div>{{ tableDetails.orderSum }}</div>
    <div>{{ tableDetails.serviceTax }}</div>
  </div>
</template>

<script>
export default {
  props: ['tableDetails']
}
</script>
