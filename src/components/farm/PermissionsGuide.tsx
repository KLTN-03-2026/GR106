import React from 'react';
import { Shield, Check, X, ShieldAlert, ShieldCheck, User } from 'lucide-react';

export const PermissionsGuide: React.FC = () => {
    const roles = [
        {
            name: 'Chủ trang trại (Owner)',
            icon: <ShieldAlert className="text-rose-500" size={20} />,
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            description: 'Toàn quyền điều hành và quản lý mọi khía cạnh của trang trại.',
            permissions: [
                { action: 'Quản lý thành viên (Thêm/Xóa/Sửa vai trò)', allowed: true },
                { action: 'Cấu hình bản đồ & Lô đất', allowed: true },
                { action: 'Xóa trang trại', allowed: true },
                { action: 'Đăng ký dịch vụ & Thanh toán', allowed: true },
                { action: 'Phân công công việc', allowed: true },
            ]
        },
        {
            name: 'Quản lý (Manager)',
            icon: <ShieldCheck className="text-emerald-500" size={20} />,
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            description: 'Giám sát hoạt động hàng ngày và điều phối nhân sự.',
            permissions: [
                { action: 'Quản lý thành viên (Chỉ xem)', allowed: true },
                { action: 'Cấu hình bản đồ & Lô đất', allowed: true },
                { action: 'Xóa trang trại', allowed: false },
                { action: 'Đăng ký dịch vụ & Thanh toán', allowed: false },
                { action: 'Phân công công việc', allowed: true },
            ]
        },
        {
            name: 'Nhân công (Worker)',
            icon: <User className="text-blue-500" size={20} />,
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            description: 'Thực hiện các nhiệm vụ được giao và báo cáo tiến độ.',
            permissions: [
                { action: 'Quản lý thành viên', allowed: false },
                { action: 'Cấu hình bản đồ & Lô đất (Chỉ xem)', allowed: true },
                { action: 'Xóa trang trại', allowed: false },
                { action: 'Đăng ký dịch vụ & Thanh toán', allowed: false },
                { action: 'Thực hiện công việc & Báo cáo', allowed: true },
            ]
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, i) => (
                <div key={i} className={`flex flex-col p-6 rounded-3xl border ${role.border} ${role.bg}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            {role.icon}
                        </div>
                        <h3 className="font-bold text-slate-800">{role.name}</h3>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 italic">
                        "{role.description}"
                    </p>

                    <div className="space-y-3 mt-auto">
                        {role.permissions.map((p, j) => (
                            <div key={j} className="flex items-start gap-2">
                                {p.allowed ? (
                                    <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                ) : (
                                    <X size={14} className="text-rose-300 mt-0.5 shrink-0" />
                                )}
                                <span className={`text-[11px] ${p.allowed ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                                    {p.action}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
