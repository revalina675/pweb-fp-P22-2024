<template>
    <div>
      <Navbar />
      <slot />
      <footer class="footer">© 2024 Manajemen Kost</footer>
    </div>
  </template>
  
  <script setup>
  import Navbar from '../components/Navbar.vue';
  </script>
  
  <style scoped>
  .footer {
    text-align: center;
    padding: 10px;
    background-color: #f8f9fa;
    margin-top: 20px;
  }
  </style>
  