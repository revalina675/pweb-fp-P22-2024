import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../pages/index.vue") },
  { path: "/facility", component: () => import("../pages/Facility.vue") },
  { path: "/rules", component: () => import("../pages/Rules.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Proteksi halaman
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if ((to.path === "/facility" || to.path === "/rules") && !token) {
    next("/");
  } else {
    next();
  }
});

export default router;
