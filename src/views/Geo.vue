<template>
  <div id="app">
    <h1>Map Application</h1>
    <MapComponent />
  </div>
</template>
<script setup>
import MapComponent from '@/components/Geo-component.vue';
// ...
</script>
<style>
/* 保持与 Google Maps 版本一致 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>