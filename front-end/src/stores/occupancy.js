import { defineStore } from "pinia";
import axios from "axios";

export const useOccupancyStore = defineStore("occupancy", {
  state: () => ({
    occupancyData: null,
  }),

  actions: {
    async fetchOccupancy() {
      try {
        const response = await axios.get("/api/admin/occupancy");
        this.occupancyData = response.data;
      } catch (error) {
        console.error("Error fetching occupancy:", error);
      }
    },
  },
});
