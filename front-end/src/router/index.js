import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../pages/index.vue") },
  { path: "/facility", component: () => import("../pages/Facility.vue") },
  { path: "/rules", component: () => import("../pages/Rules.vue") },
  { path: "/dashboard", component: () => import("../pages/DashboardView.vue") }, // Menambah path untuk DashboardView
  { path: "/facility-report", component: () => import("../pages/FasilitasReportView.vue") }, // Menambah path untuk FasilitasReportView
  { path: "/inhabitant-detail", component: () => import("../pages/PenghuniDetailView.vue") }, // Menambah path untuk PenghuniDetailView
  { path: "/inhabitant-report", component: () => import("../pages/PenghuniReportView.vue") }, // Menambah path untuk PenghuniReportView
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Proteksi halaman
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if ((to.path === "/facility" || to.path === "/rules" || to.path === "/dashboard") && !token) {
    next("/");
  } else {
    next();
  }
});

export default router;