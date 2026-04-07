import { motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { StatsCards } from './components/StatsCards'
import { CropYieldChart } from './components/CropYieldChart'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { RecentActivities } from './components/RecentActivities'
import { UpcomingTasks } from './components/UpcomingTasks'

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />

        <div className="p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Row */}
            <StatsCards />

            {/* Charts Row */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <CropYieldChart />
              <RevenueTrendChart />
            </motion.div>

            {/* Bottom Row */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <RecentActivities />
              <UpcomingTasks />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
