<script setup>
  import headerView from '@/views/Header.vue'
</script>

<template>
  <header>
    <headerView></headerView>
  </header>
  <main>
    <router-view></router-view>
  </main>
</template>