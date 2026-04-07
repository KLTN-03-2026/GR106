
const activities = [
  {
    id: 1,
    action: 'Đã thu hoạch lúa tại cánh đồng A3',
    time: '2 giờ trước',
    type: 'harvest',
  },
  {
    id: 2,
    action: 'Đã tưới nước cho khu dự án B1',
    time: '4 giờ trước',
    type: 'water',
  },
  {
    id: 3,
    action: 'Đã bán 50 tấn đậu nành',
    time: 'Hôm qua',
    type: 'sale',
  },
  {
    id: 4,
    action: 'Bảo trì thiết bị: Máy kéo #2',
    time: 'Hôm qua',
    type: 'maintenance',
  },
  {
    id: 5,
    action: 'Đã gieo hạt giống mới trong nhà kính',
    time: '2 ngày trước',
    type: 'plant',
  },
]

export function RecentActivities() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Hoạt động gần đây</h3>
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4 relative">
            {index !== activities.length - 1 && (
              <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-gray-100" />
            )}
            <div className="relative z-10 w-5 h-5 rounded-full bg-emerald-100 border-4 border-white flex-shrink-0 mt-0.5 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
        Xem tất cả hoạt động
      </button>
    </div>
  )
}
