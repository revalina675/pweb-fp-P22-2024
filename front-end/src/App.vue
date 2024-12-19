<template>
    <div>
      <Navbar />
      <router-view />
      <footer>
        <p>© 2024 Manajemen Kost</p>
      </footer>
    </div>
  </template>
  
  <script setup>
  import Navbar from './components/Navbar.vue';
  </script>
  
  <style>
  footer {
    text-align: center;
    padding: 10px;
    background-color: #f9f9f9;
  }
  </style>
  