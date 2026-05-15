import { motion } from 'framer-motion';
import { Construction, Sparkles, Wallet, Hammer, Rocket } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white overflow-hidden relative min-h-screen">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center space-y-8 max-w-lg"
      >
        <div className="flex justify-center gap-4">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"
          >
            <Wallet size={32} />
          </motion.div>
          
          <motion.div
             animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"
          >
            <Construction size={32} />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Quản lý Ví <br />
            <span className="text-emerald-600 italic">Tính năng này đang được phát triển</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            Chúng tôi đang nỗ lực hoàn thiện hệ thống thanh toán và quản lý tài chính. <br />
            Vui lòng quay lại sớm nhé!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { icon: Hammer, label: "Xây dựng" },
            { icon: Rocket, label: "Tối ưu" },
            { icon: Sparkles, label: "Sáng tạo" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <item.icon size={20} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
