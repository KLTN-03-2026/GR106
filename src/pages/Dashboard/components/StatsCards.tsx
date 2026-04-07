import { Sprout, DollarSign, Wheat, Bird } from 'lucide-react'
import { motion } from 'framer-motion'

const stats = [
  {
    title: 'Tổng diện tích',
    value: '1,248',
    unit: 'ha',
    icon: Sprout,
    trend: '+12%',
    trendUp: true,
  },
  {
    title: 'Doanh thu',
    value: '84,520 $',
    unit: 'tháng này',
    icon: DollarSign,
    trend: '+8.4%',
    trendUp: true,
  },
  {
    title: 'Sẵn sàng thu hoạch',
    value: '340',
    unit: 'tấn',
    icon: Wheat,
    trend: 'Đúng tiến độ',
    trendUp: true,
  },
  {
    title: 'Vật nuôi',
    value: '1,520',
    unit: 'con',
    icon: Bird,
    trend: '+2.1%',
    trendUp: true,
  },
]

const container = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
  },
}

export function StatsCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            variants={item}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <span className="text-sm text-gray-500">{stat.unit}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  stat.trendUp ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {stat.trend}
              </span>
              <span className="text-sm text-gray-400">so với tháng trước</span>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
