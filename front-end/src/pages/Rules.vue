<template>
  <div>
    <h1>Peraturan Kost</h1>
    <ul>
      <li v-for="(rule, index) in rules" :key="index">{{ rule }}</li>
    </ul>
  </div>
</template>

<script setup>
const rules = [
  "Dilarang membawa tamu menginap",
  "Bayar kos setiap awal bulan",
  "Jaga kebersihan kamar",
  "Dilarang merokok di dalam kamar",
];
</script>

<style scoped>
h1 {
  text-align: center;
  margin: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
  text-align: center;
}
li {
  margin: 10px;
  font-size: 18px;
}
</style>
