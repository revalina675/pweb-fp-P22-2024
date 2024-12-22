<template>
  <div class="dashboard">
    <nav class="top-nav">
      <div class="container nav-content">
        <div class="logo">
          <span>Super</span>
          <span>Kos</span>
        </div>
        <div class="nav-links">
          <router-link to="/admin/dashboard">Dashboard</router-link>
          <router-link to="/admin/laporan/fasilitas"
            >Laporan Fasilitas</router-link
          >
          <router-link to="/admin/laporan/penghuni" class="active"
            >Laporan Penghuni</router-link
          >
          <button @click="logout" class="btn btn-logout">Logout</button>
        </div>
      </div>
    </nav>

    <main class="dashboard-content">
      <div class="container">
        <div class="card">
          <div class="card-header">
            <h2>Laporan Penghuni</h2>
            <div class="actions">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Cari laporan..."
                class="search-input"
              />
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="fetchReports" class="btn btn-primary">
              Coba Lagi
            </button>
          </div>

          <div v-else-if="reports.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Belum Ada Laporan</h3>
            <p>Belum ada laporan penghuni yang disubmit.</p>
          </div>

          <div v-else class="reports-list">
            <div
              v-for="report in filteredReports"
              :key="report._id"
              class="report-card"
            >
              <div class="report-content">
                <p class="report-message">{{ report.message }}</p>
                <div class="report-meta">
                  <span class="report-date">{{
                    formatDate(report.created_at)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

export default {
  name: "PenghuniReportView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const reports = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const searchQuery = ref("");

    const filteredReports = computed(() => {
      return reports.value.filter((report) =>
        report.message.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const fetchReports = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await axios.get(
          "http://localhost:3000/api/reports/user",
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        reports.value = response.data;
      } catch (err) {
        error.value = "Gagal memuat data laporan. Silakan coba lagi.";
        console.error("Error fetching reports:", err);
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      authStore.logout();
      router.push("/login");
    };

    onMounted(() => {
      fetchReports();
    });

    return {
      reports,
      loading,
      error,
      searchQuery,
      filteredReports,
      formatDate,
      fetchReports,
      logout,
    };
  },
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
}

.top-nav {
  background: #242424;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
  display: flex;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-links a.active {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.dashboard-content {
  padding-top: 80px;
  min-height: calc(100vh - 64px);
}

.card {
  background: #242424;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  width: 250px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.loading-state,
.error-state,
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reports-list {
  padding: 1.5rem;
}

.report-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.report-message {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.report-meta {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.btn-logout {
  background: #dc3545;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background: #c82333;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .container {
    padding: 0 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }
}
</style>
