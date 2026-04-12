import { getPaymentResultService } from '@/services/payment';
import { PaymentResult } from '@/types/payment/payment';
import { formatCurrency, formatTime } from '@/utils/format';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, XCircle, ChevronLeft, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { refreshSubscription } from '@/store/authSlice';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentFarmId } = useSelector((state: RootState) => state.auth);
    const [data, setData] = useState<PaymentResult | null>(null);
    const [loading, setLoading] = useState(true);

    const orderCode =
        searchParams.get('order') ||
        searchParams.get('orderCode') ||
        searchParams.get('order_code') || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!orderCode) {
                    setLoading(false);
                    return;
                }
                const res = await getPaymentResultService.getPaymentResult(orderCode);
                setData(res.data);
                if (res.data?.status === 'SUCCESS') {
                    dispatch(refreshSubscription());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderCode, dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">
                    Đang xác nhận...
                </p>
            </div>
        );
    }

    const finalData: PaymentResult = data || {
        orderCode: orderCode || 'UNKNOWN',
        status: 'FAILED',
        reason: 'Không tìm thấy thông tin đơn hàng hoặc lỗi hệ thống',
        time: new Date().toISOString(),
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4">

            {/* Keyframes */}
            <style>{`
                @keyframes checkDraw {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes scaleIn {
                    0%   { transform: scale(0); opacity: 0; }
                    60%  { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes pulseRing {
                    0%   { transform: scale(0.95); opacity: 0.45; }
                    70%  { transform: scale(1.65); opacity: 0; }
                    100% { transform: scale(1.65); opacity: 0; }
                }
                .check-circle {
                    animation: scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
                }
                .check-path {
                    stroke-dasharray: 60;
                    stroke-dashoffset: 60;
                    animation: checkDraw 0.4s ease-out 0.35s forwards;
                }
                .pulse-ring {
                    animation: pulseRing 1.3s ease-out 0.25s 2;
                }
            `}</style>

            <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-6">

                {/* ── SUCCESS ── */}
                {finalData.status === 'SUCCESS' && (
                    <>
                        {/* Animated check icon */}
                        <div className="flex justify-center mb-6 mt-2">
                            <div className="relative flex items-center justify-center w-24 h-24">
                                <div
                                    className="pulse-ring absolute w-24 h-24 rounded-full opacity-0"
                                    style={{ backgroundColor: '#4ade80' }}
                                />
                                <div
                                    className="check-circle w-24 h-24 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: '#34d399',
                                        boxShadow: '0 8px 32px 0 rgba(52,211,153,0.28)',
                                    }}
                                >
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <path
                                            className="check-path"
                                            d="M10 25l10 10 18-20"
                                            stroke="white"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 text-slate-500 text-[11px] tracking-wide mb-3">
                                Giao dịch hoàn tất
                            </span>
                            <h1 className="text-xl font-semibold text-slate-900 mb-1.5 tracking-tight">
                                Chúc mừng bạn!
                            </h1>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-[300px] mx-auto">
                                Gói{' '}
                                <span className="text-slate-800 font-semibold">
                                    {finalData.plan || 'Nâng cao'}
                                </span>{' '}
                                đã được kích hoạt thành công cho trang trại của bạn.
                            </p>
                        </div>

                        {/* Receipt */}
                        <div className="border border-slate-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                <span className="text-[11px] text-slate-400 tracking-widest uppercase">
                                    Biên lai điện tử
                                </span>
                                <span className="text-[10px] font-medium text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 uppercase tracking-wide">
                                    Paid
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {([
                                    ['Mã đơn hàng', finalData.orderCode],
                                    ['Gói đăng ký', finalData.plan || 'Nâng cao'],
                                    ['Tổng tiền', formatCurrency(finalData.amount)],
                                    ['Ngày xác nhận', formatTime(finalData.time)],
                                ] as [string, string][]).map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">{label}</span>
                                        <span className="text-xs text-slate-800 font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => navigate(currentFarmId ? `/farms/${currentFarmId}/actions` : '/dashboard')}
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors"
                            >
                                Khám phá dashboard
                                <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                title="Về trang chủ"
                                className="w-10 h-10 rounded-xl border-slate-200 text-slate-800 p-0 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
                            >
                                <Home size={16} />
                            </Button>
                        </div>

                        <p className="mt-5 text-center text-[10px] text-slate-300 tracking-[0.2em] uppercase">
                            Powered by FarmSmart Intelligence
                        </p>
                    </>
                )}

                {/* ── PENDING ── */}
                {finalData.status === 'PENDING' && (
                    <>
                        {/* Icon */}
                        <div className="flex justify-center mb-6 mt-2">
                            <div className="w-24 h-24 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center">
                                <Clock size={40} strokeWidth={1.5} className="text-amber-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 text-slate-500 text-[11px] tracking-wide mb-3">
                                Đang xử lý
                            </span>
                            <h1 className="text-xl font-semibold text-slate-900 mb-1.5 tracking-tight">
                                Chờ xác nhận thanh toán
                            </h1>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-[300px] mx-auto">
                                Hệ thống đang chờ xác nhận từ ngân hàng. Vui lòng không đóng trình duyệt.
                            </p>
                        </div>

                        {/* Order info */}
                        <div className="border border-slate-200 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Mã đơn hàng</span>
                                <span className="text-xs text-slate-800 font-medium">{finalData.orderCode}</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            className="w-full h-10 rounded-xl border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                            <Home size={14} className="mr-1.5" /> Về trang chủ
                        </Button>

                        <p className="mt-5 text-center text-[10px] text-slate-300 tracking-[0.2em] uppercase">
                            Powered by FarmSmart Intelligence
                        </p>
                    </>
                )}

                {/* ── FAILED ── */}
                {finalData.status === 'FAILED' && (
                    <>
                        {/* Icon */}
                        <div className="flex justify-center mb-6 mt-2">
                            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                                <XCircle size={40} strokeWidth={1.5} className="text-red-500" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 text-slate-500 text-[11px] tracking-wide mb-3">
                                Giao dịch thất bại
                            </span>
                            <h1 className="text-xl font-semibold text-slate-900 mb-1.5 tracking-tight">
                                Thanh toán không thành công
                            </h1>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-[300px] mx-auto">
                                Đã có lỗi xảy ra hoặc giao dịch bị hủy bỏ. Vui lòng thử lại.
                            </p>
                        </div>

                        {/* Error info */}
                        <div className="border border-slate-200 rounded-xl p-4 mb-4">
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">Mã đơn hàng</span>
                                    <span className="text-xs text-slate-800 font-medium">{finalData.orderCode}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-xs text-slate-400 shrink-0">Lý do</span>
                                    <span className="text-xs text-red-500 font-medium text-right">
                                        {finalData.reason || 'Người dùng hủy giao dịch'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => navigate(currentFarmId ? `/farms/${currentFarmId}/subscription` : '/subscription')}
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors"
                            >
                                Thử lại
                                <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                title="Về trang chủ"
                                className="w-10 h-10 rounded-xl border-slate-200 text-slate-800 p-0 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
                            >
                                <ChevronLeft size={16} />
                            </Button>
                        </div>

                        <p className="mt-5 text-center text-[10px] text-slate-300 tracking-[0.2em] uppercase">
                            Powered by FarmSmart Intelligence
                        </p>
                    </>
                )}
            </div>

            <button
                onClick={() => navigate('/')}
                className="mt-4 text-slate-400 hover:text-slate-600 text-xs transition-colors"
            >
                Quay về trang web chính
            </button>
        </div>
    );
};

export default PaymentResultPage;