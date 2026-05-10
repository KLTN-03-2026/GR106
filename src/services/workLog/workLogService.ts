import { axiosInstance } from '../../config/axios';
import {
  WorkLog,
  WorkLogDetail,
  WorkLogSummary
} from '../../types/workLog/workLog';

/**
 * Helper: lấy .data từ API response, không dùng Zod parse
 * để tránh crash âm thầm khi backend thay đổi schema nhỏ.
 */
function unwrapData<T>(response: any): T {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

function formatApiDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  
  // If it's already ISO (yyyy-mm-dd), return the date part
  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  // If it's dd/mm/yyyy, convert to yyyy-mm-dd
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m}-${d}`;
  }

  return dateStr.split('T')[0];
}

export const workLogService = {
  async getTaskWorkLogs(planId: string, stageId: string, taskId: string): Promise<WorkLog[]> {
    const response = await axiosInstance.get(`/api/v1/plans/${planId}/stages/${stageId}/tasks/${taskId}/worklogs`);
    return unwrapData<WorkLog[]>(response);
  },

  async getFarmWorkLogs(from?: string, to?: string): Promise<WorkLog[]> {
    const response = await axiosInstance.get('/api/v1/worklogs', {
      params: { 
        from: formatApiDate(from), 
        to: formatApiDate(to) 
      }
    });
    return unwrapData<WorkLog[]>(response);
  },

  async getPlanWorkLogs(planId: string, from?: string, to?: string): Promise<WorkLog[]> {
    const params = {
      from: formatApiDate(from),
      to: formatApiDate(to)
    };
    
    console.log(`[WorkLogService] Fetching plan worklogs: /api/v1/plans/${planId}/worklogs`, params);
    
    const response = await axiosInstance.get(`/api/v1/plans/${planId}/worklogs`, { params });
    return unwrapData<WorkLog[]>(response);
  },

  async getWorkLogSummary(from: string, to: string): Promise<WorkLogSummary[]> {
    const response = await axiosInstance.get('/api/v1/worklogs/summary', {
      params: { 
        from: formatApiDate(from), 
        to: formatApiDate(to) 
      }
    });
    return unwrapData<WorkLogSummary[]>(response);
  },

  async getEmployeeWorkLogs(employeeId: string, from?: string, to?: string): Promise<WorkLog[]> {
    const response = await axiosInstance.get(`/api/v1/worklogs/employee/${employeeId}`, {
      params: { 
        from: formatApiDate(from), 
        to: formatApiDate(to) 
      }
    });
    return unwrapData<WorkLog[]>(response);
  },

  async getWorkLogDetail(workLogId: string): Promise<WorkLogDetail> {
    const response = await axiosInstance.get(`/api/v1/worklogs/${workLogId}`);
    return unwrapData<WorkLogDetail>(response);
  },

  async lockWorkLog(workLogId: string): Promise<WorkLogDetail> {
    const response = await axiosInstance.patch(`/api/v1/worklogs/${workLogId}/lock`);
    return unwrapData<WorkLogDetail>(response);
  },

  async unlockWorkLog(workLogId: string): Promise<WorkLogDetail> {
    const response = await axiosInstance.patch(`/api/v1/worklogs/${workLogId}/unlock`);
    return unwrapData<WorkLogDetail>(response);
  },

  // Legacy support for detail by taskId (deprecated)
  async getWorkLogDetailLegacy(_taskId: string, workLogId: string): Promise<WorkLogDetail> {
    return this.getWorkLogDetail(workLogId);
  }
};
