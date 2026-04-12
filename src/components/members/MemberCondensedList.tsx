import React from 'react';
import { User } from 'lucide-react';

interface Member {
  name: string;
  role: string;
  isOwner?: boolean;
}

const MOCK_MEMBERS: Member[] = [
  { name: 'Võ Xuân Phúc', role: 'Owner', isOwner: true },
  { name: 'Nguyễn Văn A', role: 'Thành viên' },
  { name: 'Trần Thị B', role: 'Thành viên' },
];

export const MemberCondensedList: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      {MOCK_MEMBERS.map((member, i) => (
        <div 
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-sm group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <User size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{member.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{member.role}</p>
          </div>

          {member.isOwner ? (
            <span className="px-2.5 py-1 rounded-full bg-white text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-100 shadow-sm">
              Chủ sở hữu
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border border-slate-100">
              TV
            </span>
          )}
        </div>
      ))}
      
      <button className="mt-2 w-full py-3 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all">
        Xem tất cả cộng sự
      </button>
    </div>
  );
};
