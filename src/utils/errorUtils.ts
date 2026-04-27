/**
 * Utility to extract a human-readable error message from various error types
 * (Axios, Standard Error, Zod, etc.)
 */
export const extractErrorMessage = (err: any): string => {
  if (!err) return 'Có lỗi xảy ra';
  if (typeof err === 'string') return err;

  // Nếu là lỗi từ Axios, interceptor đã gán message từ server vào err.message
  if (err.message && typeof err.message === 'string' && !err.message.includes('status code')) {
    return err.message;
  }

  // Handle validation error details (Zod or manual)
  const body = err?.response?.data || err?.data || (typeof err === 'object' ? err : null);
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const details = Object.entries(body)
      .filter(([k]) => !['success', 'code', 'message', 'timestamp', 'error'].includes(k))
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('; ');
    if (details) return details;
  }

  if (Array.isArray(err)) {
    return err.map((e: any) => e.message || JSON.stringify(e)).join(', ');
  }

  return err.message || 'Có lỗi xảy ra';
};
