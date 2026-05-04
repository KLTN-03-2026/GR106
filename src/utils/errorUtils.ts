/**
 * Lấy HTTP status code từ lỗi Axios / wrapped error
 */
export const getErrorStatusCode = (err: any): number | null => {
  return err?.response?.status ?? err?.status ?? null;
};

/**
 * Extract a human-readable error message from various error formats (Axios, RTK Query, etc.)
 */
export const extractErrorMessage = (err: any): string => {
  if (!err) return 'Có lỗi xảy ra';
  if (typeof err === 'string') return err;

  // Handle array of errors
  if (Array.isArray(err)) {
    return err.map(e => e.message || JSON.stringify(e)).join(', ');
  }

  // Handle Axios or custom API responses
  const responseData = err.response?.data || err.data;

  if (responseData && typeof responseData === 'object') {
    const message = responseData.message || err.message;

    // If there's a specific data object with validation details
    if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
      const details = Object.values(responseData.data).join('; ');
      if (details) return details; // Prefer specific details if message is generic
    }

    // Handle array in data
    if (Array.isArray(responseData.data)) {
      return responseData.data.map((e: any) => e.message || e.code || JSON.stringify(e)).join('; ');
    }

    return message || responseData.code || JSON.stringify(responseData);
  }

  return err.message || 'Có lỗi xảy ra';
};

/**
 * Trả về thông báo lỗi xóa task thân thiện với người dùng.
 * Nhận diện 409 (task đã thay đổi trạng thái / bị khóa) và trả thông báo rõ ràng.
 *
 * @param err        Lỗi gốc từ API
 * @param taskStatus Tên trạng thái hiện tại của task (nếu có), vd: "Hoàn thành"
 */
export const extractDeleteTaskErrorMessage = (err: any, taskStatus?: string): string => {
  const statusCode = getErrorStatusCode(err);

  if (statusCode === 409) {
    const statusLabel = taskStatus ? ` "${taskStatus}"` : '';
    return `Không thể xóa công việc này vì trạng thái${statusLabel} đã được cập nhật. Chỉ có thể xóa công việc ở trạng thái ban đầu.`;
  }

  return extractErrorMessage(err);
};

/**
 * Trả về thông báo lỗi xóa giai đoạn (Phase/Stage) thân thiện.
 */
export const extractDeletePhaseErrorMessage = (err: any, phaseStatus?: string): string => {
  const statusCode = getErrorStatusCode(err);

  if (statusCode === 409) {
    const statusLabel = phaseStatus ? ` "${phaseStatus}"` : '';
    return `Không thể xóa giai đoạn này vì trạng thái${statusLabel} đã được cập nhật. Vui lòng kiểm tra lại trạng thái của các công việc bên trong.`;
  }

  return extractErrorMessage(err);
};
