<template>
  <nav>
    <div class="navbar">
      <span>Manajemen Kost</span>
      <div>
        <a href="/">Home</a>
        <a href="/facility">Fasilitas</a>
        <a href="/rules">Peraturan</a>
        <span>Welcome, {{ username }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
const username = localStorage.getItem("username") || "Guest";
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  background-color: #007bff;
  color: white;
  padding: 10px;
}
.navbar a {
  color: white;
  text-decoration: none;
  margin: 0 10px;
}
.navbar a:hover {
  text-decoration: underline;
}
</style>
