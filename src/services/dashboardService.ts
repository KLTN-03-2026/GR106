import axios from 'axios';
import { ENV } from '../config/env';

export const dashboardService = {
  /**
   * Quét nền: Lặp qua tất cả farm để lấy tổng số lô đất và diện tích
   * Dùng Hub Token để select từng farm và lấy số liệu.
   */
  async fetchAggregateStats(hubToken: string) {
    try {
      // 1. Lấy danh sách trang trại
      const farmsResponse = await axios.get(`${ENV.API_BASE_URL}/api/v1/farms`, {
        headers: { Authorization: `Bearer ${hubToken}` }
      });
      
      const farms = farmsResponse.data.data || [];
      let totalPlots = 0;
      let totalArea = 0;

      // 2. Chạy quét nền cho từng farm
      // Sử dụng Promise.all để tối ưu tốc độ nếu danh sách farm không quá lớn
      const scanPromises = farms.map(async (farm: any) => {
        try {
          // Lấy Farm Token tạm thời
          const selectResponse = await axios.post(
            `${ENV.API_BASE_URL}/api/v1/farms/${farm.id}/select`, 
            {}, 
            { headers: { Authorization: `Bearer ${hubToken}` } }
          );
          
          const farmToken = selectResponse.data.data.farmToken;

          // Lấy danh sách Lô đất của farm này
          const plotsResponse = await axios.get(`${ENV.API_BASE_URL}/api/v1/plots`, {
            headers: { Authorization: `Bearer ${farmToken}` }
          });

          const plots = plotsResponse.data.data || [];
          return {
            count: plots.length,
            area: plots.reduce((sum: number, p: any) => sum + (Number(p.areaHa) || 0), 0),
            plots: plots
          };
        } catch (err) {
          console.warn(`[BackgroundSync] Failed to fetch plots for farm ${farm.id}`, err);
          return { count: 0, area: 0 };
        }
      });

      const results = await Promise.all(scanPromises);
      const allPlots: any[] = [];
      
      results.forEach(res => {
        totalPlots += res.count;
        totalArea += res.area;
        if (res.plots) {
          allPlots.push(...res.plots);
        }
      });

      return { totalPlots, totalArea, allPlots };
    } catch (error) {
      console.error('[BackgroundSync] Error aggregating stats:', error);
      throw error;
    }
  }
};
