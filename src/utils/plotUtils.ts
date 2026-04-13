import { GeoPoint } from '../types/plot';

/**
 * Kiểm tra xem hai đoạn thẳng (p1, p2) và (p3, p4) có cắt nhau hay không.
 */
export function segmentsIntersect(p1: GeoPoint, p2: GeoPoint, p3: GeoPoint, p4: GeoPoint): boolean {
  const ccw = (a: GeoPoint, b: GeoPoint, c: GeoPoint) => {
    return (c.lat - a.lat) * (b.lng - a.lng) > (b.lat - a.lat) * (c.lng - a.lng);
  };

  // Loại bỏ trường hợp các đoạn thẳng chung điểm đầu/cuối
  const sharedPoint = 
    (p1.lat === p3.lat && p1.lng === p3.lng) ||
    (p1.lat === p4.lat && p1.lng === p4.lng) ||
    (p2.lat === p3.lat && p2.lng === p3.lng) ||
    (p2.lat === p4.lat && p2.lng === p4.lng);

  if (sharedPoint) return false;

  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

/**
 * Kiểm tra xem một đa giác (path) có bị tự cắt (self-intersecting) hay không.
 */
export function isSelfIntersecting(path: GeoPoint[]): boolean {
  if (path.length < 4) return false;

  const n = path.length;
  for (let i = 0; i < n; i++) {
    const p1 = path[i];
    const p2 = path[(i + 1) % n];

    for (let j = i + 2; j < n; j++) {
      // Không kiểm tra đoạn kề cuối với đoạn đầu
      if (i === 0 && j === n - 1) continue;

      const p3 = path[j];
      const p4 = path[(j + 1) % n];

      if (segmentsIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Tính toán tọa độ trọng tâm (Centroid) của một đa giác.
 * Đây là phiên bản đơn giản dùng trung bình cộng các đỉnh.
 */
export function calculateCentroid(path: GeoPoint[]): GeoPoint {
  if (path.length === 0) return { lat: 0, lng: 0 };
  
  let totalLat = 0;
  let totalLng = 0;
  
  // Đối với centroid chính xác của Polygon, công thức phức tạp hơn.
  // Ở đây dùng trung bình cộng để định vị nhãn tên ở trung tâm tương đối.
  path.forEach(p => {
    totalLat += p.lat;
    totalLng += p.lng;
  });
  
  return {
    lat: totalLat / path.length,
    lng: totalLng / path.length
  };
}

/**
 * Sinh màu sắc cố định dựa trên chuỗi đầu vào (ID lô đất).
 */
export function getColorFromId(id: string): string {
  const colors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
