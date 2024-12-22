import { defineStore } from "pinia";
import axios from "axios";

export const useReportsStore = defineStore("reports", {
  state: () => ({
    facilityReports: [],
    userReports: [],
  }),

  actions: {
    async fetchFacilityReports() {
      try {
        const response = await axios.get("/api/reports/facility");
        this.facilityReports = response.data;
      } catch (error) {
        console.error("Error fetching facility reports:", error);
      }
    },

    async fetchUserReports() {
      try {
        const response = await axios.get("/api/reports/user");
        this.userReports = response.data;
      } catch (error) {
        console.error("Error fetching user reports:", error);
      }
    },
  },
});
