<template>
  <div class="facility">
    <h1>Fasilitas Kost</h1>
    <div class="carousel">
      <div class="slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div class="slide" v-for="(item, index) in slides" :key="index">
          <img :src="item.image" :alt="item.title" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
      <button @click="prevSlide" class="prev">❮</button>
      <button @click="nextSlide" class="next">❯</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const slides = [
  { image: "/src/assets/images/wifi-gratis.jpg", title: "Wi-Fi Gratis", description: "Internet stabil untuk penghuni kost." },
  { image: "/src/assets/images/laundry.jpg", title: "Laundry", description: "Fasilitas laundry mudah dan praktis." },
  { image: "/src/assets/images/parkir.jpg", title: "Parkir Luas", description: "Parkir luas untuk penghuni kost." },
  { image: "/src/assets/images/cctv.jpg", title: "CCTV 24 Jam", description: "Keamanan terjaga dengan CCTV 24 jam." },
];

const currentSlide = ref(0);

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};
</script>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  width: 300px;
  margin: auto;
}

.slides {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.slide {
  flex: 0 0 100%;
  text-align: center;
}

img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0.5rem;
  cursor: pointer;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}
</style>
