import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';
import { Member } from '../../types/member';

export const MemberCondensedList: React.FC = () => {
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!farmId) return;
      try {
        setLoading(true);
        const res = await memberService.getMembers(farmId);
        if (res.success) {
          setMembers(res.data.slice(0, 5)); // Just show up to 5 members in condensed view
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách thành viên:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [farmId]);

  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <div className="py-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang tải...</p>
        </div>
      ) : members.length > 0 ? (
        members.map((member, i) => (
          <div 
            key={i}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <span className="text-sm font-bold">{member.name ? member.name.charAt(0).toUpperCase() : '?'}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{member.name || member.email}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{member.role === 'manager' ? 'Quản lý' : member.role === 'worker' ? 'Nhân công' : 'Chủ sở hữu'}</p>
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
        ))
      ) : (
        <div className="py-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chưa có cộng sự</p>
        </div>
      )}

      
      <button 
        onClick={() => navigate(farmId ? `/farms/${farmId}/members` : '/farms')}
        className="mt-2 w-full py-3 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all"
      >
        Xem tất cả cộng sự
      </button>
    </div>
  );
};
