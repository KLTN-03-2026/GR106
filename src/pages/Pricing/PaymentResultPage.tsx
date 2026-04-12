import { getPaymentResultService } from '@/services/payment';
import { PaymentResult } from '@/types/payment/payment';
import { formatCurrency, formatTime } from '@/utils/format';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, XCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderCode]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] p-4 gap-4">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Đang xác nhận giao dịch...</p>
            </div>
        );
    }

    // Nếu không có data từ API, mặc định là FAILED với lý do không tìm thấy đơn hàng
    // Hoặc nếu có data thì dùng trực tiếp
    const finalData: PaymentResult = data || {
        orderCode: orderCode || 'UNKNOWN',
        status: 'FAILED',
        reason: 'Không tìm thấy thông tin đơn hàng hoặc lỗi hệ thống',
        time: new Date().toISOString(),
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-4 font-inter">
            <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-10 w-full max-w-md text-center border border-gray-100 animate-in zoom-in-95 duration-500">

                {/* SUCCESS */}
                {finalData.status === 'SUCCESS' && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-green-50 mx-auto mb-6 flex items-center justify-center text-green-600">
                            <ShieldCheck size={44} strokeWidth={1.5} />
                        </div>

                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-green-600 mb-2">
                            Giao dịch thành công
                        </p>

                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Gói đã được kích hoạt!
                        </h1>

                        <p className="text-sm text-gray-400 mb-8 max-w-[280px] mx-auto leading-relaxed">
                            Cám ơn bạn đã tin tưởng FarmSmart. Các tính năng nâng cao đã sẵn sàng cho bạn.
                        </p>

                        <div className="bg-gray-50/80 rounded-3xl p-6 text-left mb-8 border border-gray-100">
                            <Row label="Mã đơn hàng" value={finalData.orderCode} />
                            <Row label="Gói đăng ký" value={finalData.plan} />
                            <Row
                                label="Tổng tiền"
                                value={formatCurrency(finalData.amount)}
                                highlight
                            />
                            <Row label="Thời gian" value={formatTime(finalData.time)} />
                        </div>

                        <Button 
                            onClick={() => navigate(currentFarmId ? `/farms/${currentFarmId}/actions` : '/dashboard')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-bold shadow-lg shadow-green-200"
                        >
                            Vào trang quản lý
                        </Button>
                    </>
                )}

                {/* PENDING */}
                {finalData.status === 'PENDING' && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-amber-50 mx-auto mb-6 flex items-center justify-center text-amber-600">
                            <Clock size={44} strokeWidth={1.5} className="animate-pulse" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Đang xử lý thanh toán</h1>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                            Hệ thống đang chờ xác nhận từ ngân hàng. Vui lòng không đóng trình duyệt.
                        </p>

                        <div className="bg-gray-50/80 p-6 rounded-3xl mb-8 border border-gray-100">
                            <Row label="Mã đơn hàng" value={finalData.orderCode} />
                        </div>

                        <Button 
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-bold"
                        >
                            Về trang chủ
                        </Button>
                    </>
                )}

                {/* FAILED */}
                {finalData.status === 'FAILED' && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-50 mx-auto mb-6 flex items-center justify-center text-red-500">
                            <XCircle size={44} strokeWidth={1.5} />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Thanh toán thất bại
                        </h1>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                            Đã có lỗi xảy ra trong quá trình thanh toán hoặc giao dịch bị hủy bỏ.
                        </p>

                        <div className="bg-gray-50/80 p-6 rounded-3xl mb-8 border border-gray-100 text-left">
                            <Row label="Mã đơn hàng" value={finalData.orderCode} />
                            <Row
                                label="Lý do"
                                value={finalData.reason || 'Người dùng hủy giao dịch'}
                                danger
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={() => navigate(currentFarmId ? `/farms/${currentFarmId}/subscription` : '/subscription')}
                                className="w-full bg-gray-900 hover:bg-black text-white h-14 rounded-2xl font-bold"
                            >
                                Thử lại ngay
                            </Button>
                            <Button 
                                onClick={() => navigate('/dashboard')}
                                variant="ghost"
                                className="flex items-center justify-center gap-2 text-gray-500 h-10"
                            >
                                <ChevronLeft size={16} /> Quay về Dashboard
                            </Button>
                        </div>
                    </>
                )}

                <div className="mt-10 flex items-center justify-center gap-2 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <span className="text-[10px] text-gray-500 font-medium">Được bảo mật bởi</span>
                    <span className="text-xs font-bold text-green-700">SePay</span>
                </div>
            </div>
        </div>
    );
};

const Row = ({
    label,
    value,
    highlight,
    danger,
}: {
    label: string;
    value?: string | number;
    highlight?: boolean;
    danger?: boolean;
}) => (
    <div className="flex justify-between py-2 text-sm">
        <span className="text-gray-400 font-medium">{label}</span>
        <span
            className={`font-semibold ${highlight
                ? 'text-green-700'
                : danger
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}
        >
            {value || '—'}
        </span>
    </div>
);

export default PaymentResultPage;
