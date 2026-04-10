import { Check, X, ShieldCheck, ArrowRight, Loader2, Trees } from 'lucide-react';
import { createPaymentService } from '@/services/payment';
import { getSubscriptionPlansService } from '@/services/subscription';
import { farmService } from '@/services/farmService';
import { BillingCycle } from '@/types/payment/payment';
import { SubscriptionPlan } from '@/types/subscription/subscription';
import { setAccessToken } from '@/store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchFarmsSummary } from '@/store/farmSlice';
import { motion, AnimatePresence } from 'framer-motion';

import { useEffect, useState } from 'react';

const SubscriptionPage = () => {
    const dispatch = useDispatch();
    const { currentFarmId } = useSelector((state: RootState) => state.auth);
    const [billing, setBilling] = useState<BillingCycle>('MONTHLY');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Logic Context Guard
    const [isCheckingContext, setIsCheckingContext] = useState(true);
    const [isPaymentPending, setIsPaymentPending] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);

    const { farmSummary: farms } = useSelector((state: RootState) => state.farm);

    // Tìm farm hiện tại dựa trên ID trong Redux
    const currentFarm = farms.find(f => f.farmId === currentFarmId);

    const selected = plans.find((p) => p.id === selectedPlan);

    const getPrice = (plan: SubscriptionPlan) =>
        billing === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;

    useEffect(() => {
        const initContext = async () => {
            try {
                // Sử dụng thunk để lấy danh sách farm đồng bộ với dashboard
                const res = await dispatch(fetchFarmsSummary() as any).unwrap();
                const userFarms = res || [];

                if (userFarms.length === 0) {
                    setError('Bạn chưa có trang trại nào để nâng cấp.');
                    setIsCheckingContext(false);
                    return;
                }

                // Nếu đã có farm context từ trước, không cần auto-select hay hiện modal
                if (currentFarmId) {
                    setIsCheckingContext(false);
                    return;
                }

                if (userFarms.length === 1) {
                    // Nếu chỉ có 1 farm, auto select ngầm
                    const selectRes = await farmService.selectFarm(userFarms[0].farmId);
                    if (selectRes.success && selectRes.data.farmToken) {
                        dispatch(setAccessToken({ token: selectRes.data.farmToken, farmId: userFarms[0].farmId }));
                    }
                }
                
                setIsCheckingContext(false);
            } catch (err) {
                console.error('Lỗi khi kiểm tra ngữ cảnh:', err);
                // Nếu lỗi do chưa có farm nào, không báo lỗi đỏ mà chỉ hướng dẫn
                setIsCheckingContext(false);
            }
        };

        const fetchPlans = async () => {
            try {
                const plansRes = await getSubscriptionPlansService.getPlans();
                setPlans(plansRes.data);
            } catch (err) {
                console.error(err);
                setError('Không tải được danh sách gói');
            } finally {
                setLoadingPlans(false);
            }
        };

        initContext();
        fetchPlans();
    }, [dispatch]);

    const handleSelectFarmContext = async (farmId: string) => {
        setLoading(true);
        try {
            const res = await farmService.selectFarm(farmId);
            if (res.success && res.data.farmToken) {
                dispatch(setAccessToken({ token: res.data.farmToken, farmId }));
                setShowSelectionModal(false);
                
                // Nếu đang trong luồng thanh toán, tiếp tục thanh toán ngay
                if (isPaymentPending) {
                    setIsPaymentPending(false);
                    // Phải đợi Redux update hoặc dùng local farmToken vừa lấy
                    // Tuy nhiên handlePayment dùng currentFarmId từ store nên ta gọi nó sau 1 tick hoặc truyền farmId
                    setTimeout(() => handlePayment(), 100);
                }
            }
        } catch (err) {
            alert('Không thể chọn trang trại này');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedPlan) return;

        // Nếu chưa có farm context, hiện modal chọn farm trước
        if (!currentFarmId) {
            setIsPaymentPending(true);
            setShowSelectionModal(true);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await createPaymentService.createPayment({
                subscriptionPlanId: selectedPlan,
                billingCycle: billing,
            });

            const formData = res.data.formData;
            if (!formData) {
                setError('Không nhận được thông tin thanh toán');
                return;
            }

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = formData.actionUrl;

            const fields: [string, string][] = [
                ['order_amount', formData.orderAmount],
                ['merchant', formData.merchant],
                ['currency', formData.currency],
                ['operation', formData.operation],
                ['order_description', formData.orderDescription],
                ['order_invoice_number', formData.orderInvoiceNumber],
                ['success_url', formData.successUrl],
                ['error_url', formData.errorUrl],
                ['cancel_url', formData.cancelUrl],
                ['signature', formData.signature],
            ];

            fields.forEach(([name, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

        } catch (err: any) {
            setError(err?.response?.data?.message || 'Lỗi hệ thống');
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-[#f5f5f0] relative">
            <AnimatePresence>
                {isCheckingContext && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                    >
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                        <p className="text-sm font-medium text-gray-600">Đang đồng bộ dữ liệu nông trại...</p>
                    </motion.div>
                )}

                {showSelectionModal && (
                    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 border border-gray-100 relative"
                        >
                            <button 
                                onClick={() => setShowSelectionModal(false)}
                                className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Chọn trang trại cần nâng cấp</h2>
                            <p className="text-sm text-gray-500 mb-6">Vui lòng chọn trang trại bạn muốn áp dụng gói dịch vụ này.</p>
                            
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                {farms.map((farm) => (
                                    <button
                                        key={farm.farmId}
                                        disabled={loading}
                                        onClick={() => handleSelectFarmContext(farm.farmId)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 border border-transparent rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-green-600 border border-gray-100">
                                                <Trees size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 text-sm">{farm.farmName}</h3>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                                                    ID: ...{farm.farmId.slice(-6)}
                                                </p>
                                            </div>
                                        </div>
                                        {loading ? <Loader2 size={16} className="animate-spin text-gray-300" /> : <ArrowRight size={16} className="text-gray-300 group-hover:text-green-600" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="bg-white border-b h-14 flex items-center justify-between px-6 sticky top-0 z-10">
                <div className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span>Nâng cấp cho:</span>
                    {currentFarm ? (
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            <span className="text-sm font-semibold text-green-700">{currentFarm.farmName}</span>
                            <button 
                                onClick={() => setShowSelectionModal(true)}
                                className="text-[10px] text-green-600 hover:underline border-l border-green-200 pl-2 ml-1"
                            >
                                Đổi
                            </button>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">Đang xác định...</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span className="text-xs text-gray-400">Thanh toán bảo mật</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
                <h1 className="text-xl font-semibold mb-1">Chọn gói đăng ký</h1>
                <p className="text-sm text-gray-500 mb-6">Nâng cấp để mở khoá tính năng</p>

                {/* INFO BOX */}
                <div className="bg-green-50/50 p-4 rounded-2xl mb-6 border border-green-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-green-800">Cổng thanh toán bảo mật</p>
                        <p className="text-[10px] text-green-600">Mọi giao dịch sẽ được thực hiện qua cổng SePay an toàn.</p>
                    </div>
                </div>

                {/* BILLING TOGGLE */}
                <div className="flex bg-gray-200 p-1 rounded-xl mb-6 w-fit">
                    <button
                        onClick={() => setBilling('MONTHLY')}
                        className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 ${billing === 'MONTHLY' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Hàng tháng
                    </button>
                    <button
                        onClick={() => setBilling('ANNUAL')}
                        className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 ${billing === 'ANNUAL' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Hàng năm
                        <span className="ml-1 text-[10px] text-green-600 font-semibold">-20%</span>
                    </button>
                </div>

                {/* LOADING */}
                {loadingPlans ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Đang tải danh sách gói...</p>
                    </div>
                ) : (
                    <>
                        {/* ② Plans grid — dùng items-stretch để tất cả card cao bằng nhau */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6 items-stretch">
                            {plans.map((plan) => {
                                const price = getPrice(plan);
                                const isSelected = selectedPlan === plan.id;

                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`flex flex-col p-5 bg-white rounded-2xl border transition-all duration-300 cursor-pointer ${
                                            isSelected
                                                ? 'border-green-600 ring-2 ring-green-600/10 shadow-lg scale-[1.02]'
                                                : 'border-gray-100 hover:border-green-300 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Plan header */}
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 text-base">{plan.name}</h3>
                                            {isSelected && (
                                                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* ③ Bỏ line-clamp để hiển thị đầy đủ mô tả */}
                                        <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                                            {plan.description}
                                        </p>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-500">₫</span>
                                            <span className="text-xs text-gray-400 ml-1">
                                                / {billing === 'ANNUAL' ? 'năm' : 'tháng'}
                                            </span>
                                        </div>

                                        {/* ④ Features — flex-grow để đẩy xuống đáy card khi cần */}
                                        <div className="pt-4 border-t border-gray-100 flex-grow">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                                Tính năng bao gồm
                                            </p>
                                            <ul className="text-xs space-y-2.5 text-gray-600">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-green-600 text-[10px] font-bold">●</span>
                                                    </span>
                                                    Tối đa <span className="font-semibold text-gray-800">{plan.maxPlots}</span> lô đất
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-green-600 text-[10px] font-bold">●</span>
                                                    </span>
                                                    Tối đa <span className="font-semibold text-gray-800">{plan.maxMembers}</span> thành viên
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.hasAiDiagnosis ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        {plan.hasAiDiagnosis
                                                            ? <Check size={10} className="text-green-600 stroke-[3]" />
                                                            : <X size={10} className="text-gray-400 stroke-[3]" />
                                                        }
                                                    </span>
                                                    <span className={plan.hasAiDiagnosis ? 'text-gray-700' : 'text-gray-400'}>
                                                        Chẩn đoán AI
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.hasPdfExport ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        {plan.hasPdfExport
                                                            ? <Check size={10} className="text-green-600 stroke-[3]" />
                                                            : <X size={10} className="text-gray-400 stroke-[3]" />
                                                        }
                                                    </span>
                                                    <span className={plan.hasPdfExport ? 'text-gray-700' : 'text-gray-400'}>
                                                        Xuất báo cáo PDF
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.hasMap ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        {plan.hasMap
                                                            ? <Check size={10} className="text-green-600 stroke-[3]" />
                                                            : <X size={10} className="text-gray-400 stroke-[3]" />
                                                        }
                                                    </span>
                                                    <span className={plan.hasMap ? 'text-gray-700' : 'text-gray-400'}>
                                                        Bản đồ nông trại
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* SUMMARY */}
                        {selected && (
                            <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-gray-900 text-sm">Chi tiết thanh toán</span>
                                        <span className="text-xs text-gray-500">
                                            Gói {selected.name} — {billing === 'ANNUAL' ? 'Thanh toán hàng năm' : 'Thanh toán hàng tháng'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-700">
                                            {getPrice(selected).toLocaleString()} ₫
                                        </div>
                                        {billing === 'ANNUAL' && (
                                            <span className="text-[10px] text-green-600 font-medium">Đã tiết kiệm 20%</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* CTA BUTTON */}
                <button
                    disabled={!selectedPlan || loading}
                    onClick={handlePayment}
                    className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg ${
                        !selectedPlan || loading
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-green-600 hover:bg-green-700 hover:shadow-green-900/10 active:scale-[0.98]'
                    }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang xử lý...
                        </div>
                    ) : 'Tiếp tục thanh toán'}
                </button>

                {/* ERROR */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs text-center">
                        {error}
                    </div>
                )}

                <p className="text-center text-[10px] text-gray-400 mt-8">
                    Bằng cách nhấn tiếp tục, bạn đồng ý với Điều khoản dịch vụ & Chính sách bảo mật của FarmerAI.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionPage;