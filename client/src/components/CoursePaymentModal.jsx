import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle, CreditCard, Sparkles, AlertCircle, BookOpen, Award } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/NotificationContext';

const CoursePaymentModal = ({ isOpen, onClose, course, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !course) return null;

  const price = course.individualPrice || 999;
  const gst = Math.round(price * 0.18);
  const total = price + gst;

  const handlePay = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Request Order from backend
      const res = await api.post('/payments/course/create-order', { courseId: course._id });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to create order');
      }

      // If server granted free access (e.g. covered by college or gov)
      if (res.data.isFree) {
        toast.success('Course access granted under your Institute entitlement at ₹0 cost!', 'Free Enrollment Activated');
        if (onSuccess) onSuccess(res.data);
        onClose();
        return;
      }

      const { orderId, amountInPaise, keyId } = res.data;

      // 2. Load Razorpay Checkout dynamically
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();

      const completeVerification = async (paymentData, isMock = false) => {
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: paymentData.razorpay_order_id || orderId,
          razorpay_payment_id: paymentData.razorpay_payment_id || `pay_${Date.now()}`,
          razorpay_signature: paymentData.razorpay_signature || 'verified',
          isMock
        });

        if (verifyRes.data.success) {
          toast.success('Enrollment fee verified successfully! Course curriculum unlocked.', 'Payment Successful');
          if (onSuccess) onSuccess(verifyRes.data);
          onClose();
        } else {
          const failMsg = verifyRes.data.message || 'Verification failed';
          setError(failMsg);
          toast.error(failMsg, 'Verification Failed');
        }
      };

      if (!isLoaded || !window.Razorpay) {
        // Fallback for offline / sandbox demonstration
        await completeVerification({ razorpay_order_id: orderId }, true);
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'CapacityConnect • MoES / IMD',
        description: `Enrollment Fee: ${course.title}`,
        order_id: orderId,
        prefill: {
          name: 'Direct Trainee Candidate'
        },
        theme: { color: '#0284c7' },
        handler: async (response) => {
          await completeVerification(response, false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        const failText = `Payment failed: ${response.error?.description || 'Transaction declined'}`;
        setError(failText);
        toast.error(failText, 'Payment Failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Payment initiation failed';
      setError(errMsg);
      toast.error(errMsg, 'Payment Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            External Trainee Certification Checkout
          </div>
          <h2 className="text-xl font-black text-white mt-1">{course.title}</h2>
          <p className="text-xs text-blue-200 mt-1">
            Course Code: <span className="font-mono font-bold text-white">{course.code}</span> • National WMO-258 Standard
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Included in Enrollment:</div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Full syllabus access, video lectures, and operational notes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Interactive timed examination with server-side auto evaluation</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Tamper-evident cryptographic SHA-256 certificate with live QR verification</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Course Tuition Fee</span>
              <span>₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18% Government Service Tax)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Payable</span>
              <span className="text-blue-600">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Processing Gateway...' : `Pay ₹${total.toLocaleString('en-IN')} & Enroll`}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit encrypted checkout via Razorpay • UPI, Cards & NetBanking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePaymentModal;
