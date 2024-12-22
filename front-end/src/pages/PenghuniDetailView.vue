<template>
  <div class="dashboard">
    <nav class="top-nav">
      <div class="container nav-content">
        <div class="logo">
          <span>Super</span>
          <span>Kos</span>
        </div>
        <div class="nav-links">
          <router-link to="/admin/dashboard" class="active"
            >Dashboard</router-link
          >
          <router-link to="/admin/laporan/fasilitas"
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
        <div class="header-section">
          <div class="left-section">
            <button @click="goBack" class="btn btn-back">
              <i class="fas fa-chevron-left"></i>
              Kembali
            </button>
            <h2>Detail Penghuni: {{ userDetails?.username }}</h2>
          </div>
          <button @click="confirmRemove" class="btn btn-danger">
            Hapus Penghuni
          </button>
        </div>

        <div class="content-section">
          <div class="card">
            <div class="card-header">
              <h3>Detail Pembayaran</h3>
              <span :class="['status-badge', getPaymentStatusClass()]">
                {{ getPaymentStatusLabel() }}
              </span>
            </div>

            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Memuat data...</p>
            </div>

            <div v-else-if="error" class="error-state">
              <p>{{ error }}</p>
              <button @click="fetchUserDetails" class="btn btn-primary">
                Coba Lagi
              </button>
            </div>

            <div v-else class="payment-details">
              <div class="section">
                <h4>Informasi Sewa</h4>
                <div class="info-row">
                  <span>Periode Sewa:</span>
                  <span>{{ userDetails?.payment?.rent_periods }} Bulan</span>
                </div>
                <div class="info-row">
                  <span>Metode Pembayaran:</span>
                  <span>{{
                    formatPaymentMethod(userDetails?.payment?.payment_method)
                  }}</span>
                </div>
              </div>

              <div class="section">
                <h4>Layanan</h4>
                <div class="info-row">
                  <span>Kamar</span>
                  <span>{{ formatCurrency(getRoomPrice()) }}</span>
                </div>
                <template v-if="userDetails?.payment?.services">
                  <div
                    v-for="service in userDetails.payment.services"
                    :key="service"
                    class="info-row"
                  >
                    <span>{{ getServiceLabel(service) }}</span>
                    <span>{{ formatCurrency(getServicePrice(service)) }}</span>
                  </div>
                </template>
              </div>

              <div class="section total">
                <div class="info-row">
                  <span>Total Pembayaran:</span>
                  <span class="total-amount">{{
                    formatCurrency(userDetails?.payment?.total_bill)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Konfirmasi -->
    <div v-if="showConfirmDialog" class="modal-overlay">
      <div class="modal-content">
        <h3>Konfirmasi Hapus</h3>
        <p>Apakah Anda yakin ingin menghapus penghuni ini?</p>
        <div class="modal-actions">
          <button @click="removePenghuni" class="btn btn-danger">
            Ya, Hapus
          </button>
          <button @click="showConfirmDialog = false" class="btn btn-secondary">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

export default {
  name: "PenghuniDetailView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const userId = ref(route.params.id);
    const userDetails = ref(null);
    const showConfirmDialog = ref(false);
    const loading = ref(true);
    const error = ref(null);

    // Pemetaan status pembayaran
    const paymentStatusMap = {
      PAID: "Lunas",
      UNPAID: "Belum Lunas",
      OVERDUE: "Terlambat",
    };

    const paymentStatusClassMap = {
      PAID: "paid",
      UNPAID: "unpaid",
      OVERDUE: "unpaid",
    };

    // Fungsi untuk mengambil data penghuni
    const fetchUserDetails = async () => {
      loading.value = true;
      error.value = null;
      try {
        console.log("Fetching user details for ID:", userId.value);
        const response = await axios.get(
          `http://localhost:3000/api/admin/penghuni/${userId.value}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        userDetails.value = response.data;
      } catch (err) {
        if (err.response) {
          // Server merespon dengan status di luar 2xx
          console.error("Error response:", err.response);
          if (err.response.status === 404) {
            error.value = "Penghuni tidak ditemukan.";
          } else if (err.response.status === 401) {
            error.value = "Tidak diizinkan. Silakan login kembali.";
          } else {
            error.value =
              "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
          }
        } else if (err.request) {
          // Permintaan telah dibuat tetapi tidak ada respons
          console.error("No response:", err.request);
          error.value =
            "Tidak ada respons dari server. Periksa koneksi internet Anda.";
        } else {
          // Terjadi kesalahan saat mengatur permintaan
          console.error("Error setting up request:", err.message);
          error.value = "Terjadi kesalahan saat mengatur permintaan.";
        }
      } finally {
        loading.value = false;
      }
    };

    // Fungsi untuk menentukan kelas status pembayaran
    const getPaymentStatusClass = () => {
      if (!userDetails.value) return "";
      return (
        paymentStatusClassMap[userDetails.value.payment.status] || "unknown"
      );
    };

    // Fungsi untuk mendapatkan label status pembayaran
    const getPaymentStatusLabel = () => {
      if (!userDetails.value) return "";
      return (
        paymentStatusMap[userDetails.value.payment.status] ||
        "Status Tidak Diketahui"
      );
    };

    // Fungsi untuk memformat metode pembayaran
    const formatPaymentMethod = (method) => {
      const methods = {
        credit_card: "Kartu Kredit",
        bank_transfer: "Transfer Bank",
        cash: "Tunai",
        // Tambahkan metode lainnya sesuai kebutuhan
      };
      return methods[method] || method;
    };

    // Fungsi untuk memformat angka menjadi mata uang
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    };

    // Fungsi untuk mendapatkan harga kamar
    const getRoomPrice = () => {
      return userDetails.value?.payment?.room_price || 0;
    };

    // Fungsi untuk mendapatkan label layanan
    const getServiceLabel = (service) => {
      const serviceLabels = {
        wifi: "WiFi",
        laundry: "Laundry",
        // Tambahkan layanan lainnya sesuai kebutuhan
      };
      return serviceLabels[service] || service;
    };

    // Fungsi untuk mendapatkan harga layanan
    const getServicePrice = (service) => {
      const servicePrices = {
        wifi: 30000,
        laundry: 30000,
        // Tambahkan layanan lainnya sesuai kebutuhan
      };
      return servicePrices[service] || 0;
    };

    // Fungsi untuk membuka dialog konfirmasi penghapusan
    const confirmRemove = () => {
      showConfirmDialog.value = true;
    };

    // Fungsi untuk menghapus penghuni
    const removePenghuni = async () => {
      try {
        await axios.delete(
          `http://localhost:3000/api/admin/penghuni/${userId.value}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        router.push("/admin/laporan/fasilitas");
      } catch (err) {
        console.error("Error removing penghuni:", err);
        alert("Gagal menghapus penghuni. Silakan coba lagi.");
      }
    };

    const goBack = () => {
      router.back();
    };

    // Fungsi untuk logout
    const logout = () => {
      authStore.logout();
      router.push("/login");
    };

    // Panggil fetchUserDetails saat komponen di-mount
    onMounted(() => {
      fetchUserDetails();
    });

    return {
      userId,
      userDetails,
      showConfirmDialog,
      loading,
      error,
      confirmRemove,
      removePenghuni,
      logout,
      goBack,
      getPaymentStatusClass,
      getPaymentStatusLabel,
      formatPaymentMethod,
      formatCurrency,
      getRoomPrice,
      getServiceLabel,
      getServicePrice,
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

.dashboard-content {
  padding-top: 80px; /* Mengakomodasi navbar yang fixed */
  min-height: calc(100vh - 64px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.content-section {
  background: #242424;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: #242424;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  color: #ffffff;
  font-size: 0.9rem;
}

.status-badge.paid {
  background-color: #28a745;
}

.status-badge.unpaid {
  background-color: #dc3545;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .nav-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
