<template>
  <div>
    <h1>Fasilitas Kost</h1>
    <div class="carousel">
      <div v-for="(item, index) in facilities" :key="index" class="carousel-item">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
const facilities = ["Wi-Fi Gratis", "Laundry", "Parkir Luas", "CCTV 24 Jam"];
</script>

<style scoped>
h1 {
  text-align: center;
  margin: 20px;
}
.carousel {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 20px;
}
.carousel-item {
  flex: 0 0 auto;
  padding: 10px;
  background-color: #e3f2fd;
  border-radius: 5px;
  text-align: center;
}
</style>
