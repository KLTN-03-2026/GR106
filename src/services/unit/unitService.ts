import { axiosInstance } from "../../config/axios";
import { ApiResponse } from "../../types/auth/auth";
import { Unit } from "../../types/unit/unit";

export const unitService = {
  getUnits: async (): Promise<ApiResponse<Unit[]>> => {
    const response = await axiosInstance.get<ApiResponse<Unit[]>>("/api/v1/units");
    return response.data;
  },
};
