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
          <router-link to="/admin/laporan/fasilitas" class="active"
            >Laporan Fasilitas</router-link
          >
          <router-link to="/admin/laporan/penghuni"
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
            <h2>Laporan Fasilitas</h2>
            <div class="filter-group">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Cari laporan..."
                class="search-input"
              />
              <select v-model="statusFilter" class="status-select">
                <option value="">Semua Status</option>
                <option value="pending">Dalam Antrean</option>
                <option value="proses">Dalam Proses</option>
                <option value="selesai">Terselesaikan</option>
              </select>
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

          <div v-else-if="filteredReports.length === 0" class="empty-state">
            <div class="empty-icon">🔧</div>
            <h3>Belum Ada Laporan</h3>
            <p>Belum ada laporan kerusakan fasilitas yang disubmit.</p>
          </div>

          <div v-else class="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kamar</th>
                  <th>Penghuni</th>
                  <th>Masalah</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="report in filteredReports" :key="report._id">
                  <td>{{ formatDate(report.created_at) }}</td>
                  <td>{{ report.room_number }}</td>
                  <td>{{ report.user?.username || "Tidak Diketahui" }}</td>
                  <td>{{ report.message }}</td>
                  <td>
                    <span :class="['status-badge', report.status]">
                      {{ getStatusLabel(report.status) }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="dropdown">
                      <button
                        class="btn-action"
                        :class="getActionButtonClass(report.status)"
                        @click="toggleDropdown(report._id)"
                      >
                        {{ getActionButtonLabel(report.status) }}
                        <span class="dropdown-arrow">▼</span>
                      </button>
                      <div
                        class="dropdown-menu"
                        :class="{ show: activeDropdown === report._id }"
                      >
                        <button
                          v-for="status in getAvailableStatuses(report.status)"
                          :key="status"
                          @click="updateStatus(report._id, status)"
                          class="dropdown-item"
                        >
                          {{ getNextActionLabel(status) }}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
  name: "FasilitasReportView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const reports = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const searchQuery = ref("");
    const statusFilter = ref("");
    const activeDropdown = ref(null);

    const filteredReports = computed(() => {
      return reports.value.filter((report) => {
        const matchesSearch =
          (report.message &&
            report.message
              .toLowerCase()
              .includes(searchQuery.value.toLowerCase())) ||
          (report.user &&
            report.user.username
              .toLowerCase()
              .includes(searchQuery.value.toLowerCase())) ||
          (report.room_number &&
            report.room_number.toString().includes(searchQuery.value));

        const matchesStatus =
          !statusFilter.value || report.status === statusFilter.value;

        return matchesSearch && matchesStatus;
      });
    });

    const getStatusLabel = (status) => {
      const labels = {
        pending: "Dalam Antrean",
        proses: "Dalam Proses",
        selesai: "Terselesaikan",
      };
      return labels[status] || status;
    };

    const getActionButtonClass = (status) => {
      const classes = {
        pending: "btn-warning",
        proses: "btn-info",
        selesai: "btn-success",
      };
      return classes[status];
    };

    const getActionButtonLabel = (status) => {
      const labels = {
        pending: "Proses",
        proses: "Selesaikan",
        selesai: "Reset",
      };
      return labels[status];
    };

    const getNextActionLabel = (status) => {
      const labels = {
        pending: "Masukkan ke Proses",
        proses: "Selesaikan",
        selesai: "Reset Status",
      };
      return labels[status] || "Aksi";
    };

    const getAvailableStatuses = (currentStatus) => {
      switch (currentStatus) {
        case "pending":
          return ["proses"];
        case "proses":
          return ["selesai"];
        case "selesai":
          return ["pending"];
        default:
          return [];
      }
    };

    const toggleDropdown = (reportId) => {
      activeDropdown.value =
        activeDropdown.value === reportId ? null : reportId;
    };

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
          "http://localhost:3000/api/reports/facility",
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        reports.value = response.data;
        console.log("Fetched Reports:", reports.value); // Untuk debugging
      } catch (err) {
        error.value = "Gagal memuat data laporan. Silakan coba lagi.";
        console.error("Error fetching reports:", err);
      } finally {
        loading.value = false;
      }
    };

    const updateStatus = async (reportId, newStatus) => {
      try {
        await axios.patch(
          `http://localhost:3000/api/reports/facility/${reportId}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        await fetchReports();
        activeDropdown.value = null; // Tutup dropdown setelah aksi
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Gagal memperbarui status laporan. Silakan coba lagi.");
      }
    };

    const logout = () => {
      authStore.logout();
      router.push("/login");
    };

    onMounted(() => {
      fetchReports();
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
          activeDropdown.value = null;
        }
      });
    });

    return {
      reports,
      loading,
      error,
      searchQuery,
      statusFilter,
      filteredReports,
      activeDropdown,
      formatDate,
      getStatusLabel,
      getActionButtonClass,
      getActionButtonLabel,
      getNextActionLabel,
      getAvailableStatuses,
      updateStatus,
      fetchReports,
      logout,
      toggleDropdown,
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

.nav-links a:hover {
  background: rgba(255, 215, 0, 0.1);
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
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input,
.status-select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.search-input {
  width: 250px;
}

.status-select {
  width: 150px;
}

.reports-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: space-between;
  color: #ffffff;
}

.btn-warning {
  background: #ffc107;
  color: #000000;
}

.btn-info {
  background: #17a2b8;
}

.btn-success {
  background: #28a745;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.25rem;
  background: #242424;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  z-index: 1000;
  display: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.proses {
  background: rgba(23, 162, 184, 0.2);
  color: #17a2b8;
}

.status-badge.selesai {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-primary {
  background: #007bff;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background: #0069d9;
}

.payment-details .section {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.total .info-row {
  font-weight: bold;
}

.total-amount {
  color: #28a745;
}

.btn-danger {
  background: #dc3545;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-danger:hover {
  background: #c82333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #242424;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.text-warning {
  color: #ffc107;
  font-weight: 500;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
  }

  .search-input,
  .status-select {
    width: 100%;
  }

  .nav-links {
    display: none;
  }

  .dropdown-menu {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: auto;
    top: auto;
  }
}

@media (max-width: 480px) {
  th,
  td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  .btn-action {
    min-width: 100px;
    padding: 0.5rem;
  }
}
</style>
