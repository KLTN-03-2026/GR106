import { useState } from 'react'
import { Check } from 'lucide-react'

const initialTasks = [
  { id: 1, text: 'Bón phân cho lúa', completed: false },
  { id: 2, text: 'Kiểm tra nhiệt độ nhà kính #2', completed: false },
  { id: 3, text: 'Đặt hàng hạt giống cho mùa sau', completed: true },
  { id: 4, text: 'Sửa đường ống tưới ở khu vực 4', completed: false },
  { id: 5, text: 'Đặt lịch hẹn thú y cho vật nuôi', completed: false },
]

export function UpcomingTasks() {
  const [tasks, setTasks] = useState(initialTasks)
  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Nhiệm vụ sắp tới</h3>
        <span className="bg-emerald-100 text-emerald-700 py-1 px-2.5 rounded-full text-xs font-medium">
          {tasks.filter((t) => !t.completed).length} đang chờ
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              task.completed
                ? 'bg-gray-50 border-transparent'
                : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm'
            }`}
            onClick={() => toggleTask(task.id)}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-2 border-gray-300'
              }`}
            >
              {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span
              className={`text-sm ${
                task.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'
              }`}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
        Thêm nhiệm vụ mới
      </button>
    </div>
  )
}
