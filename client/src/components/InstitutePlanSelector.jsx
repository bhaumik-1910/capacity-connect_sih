import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Zap, Building2, Users, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const PLANS = [
  {
    tier: 'STARTER_250',
    name: 'Starter Campus',
    badge: 'Small Academy',
    quota: 250,
    price: 25000,
    features: [
      'Up to 250 Active Student Seats',
      'All Institute Courses 100% Free for Students',
      'Excel Bulk Trainee Onboarding & PINs',
      'Printable Live QR Examination Hall Tickets',
      'Basic Institute Analytics'
    ],
    popular: false,
    accent: 'border-slate-200 hover:border-blue-400'
  },
  {
    tier: 'STANDARD_1000',
    name: 'Standard College',
    badge: 'Most Popular Choice',
    quota: 1000,
    price: 75000,
    features: [
      'Up to 1,000 Active Student Seats',
      'All Courses 100% Free for All Campus Trainees',
      'Custom Institute Certificate Designer',
      'Faculty Exam Builder & Automated Grading',
      'Dedicated Academic Structure (Departments & Batches)',
      'MoES-WMO Standard Compliance Verification'
    ],
    popular: true,
    accent: 'border-blue-600 shadow-xl ring-2 ring-blue-500/20 bg-gradient-to-b from-blue-50/40 to-white'
  },
  {
    tier: 'ENTERPRISE_5000',
    name: 'Enterprise University',
    badge: 'State / Central University',
    quota: 5000,
    price: 250000,
    features: [
      'Up to 5,000 Active Student Seats',
      'Unlimited Courses & Faculty Instructors',
      'Multi-Campus Decentralized Administration',
      'Custom University Seal & Director Signatures',
      'Priority MoES Accreditation Queue & Dedicated Support',
      'Comprehensive National Forensic Audit Logs'
    ],
    popular: false,
    accent: 'border-slate-200 hover:border-indigo-400'
  }
];

const InstitutePlanSelector = ({ onActivated }) => {
  const [selectedPlan, setSelectedPlan] = useState('STANDARD_1000');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [quotaMetrics, setQuotaMetrics] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await api.get('/payments/institute/subscription');
      if (res.data.success) {
        setSubscription(res.data.subscription);
        setQuotaMetrics(res.data.quotaMetrics);
      }
    } catch (err) {
      // Ignore if new institute without subscription
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = async (tier) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Create order on backend
      const res = await api.post('/payments/institute/create-subscription', { planTier: tier });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to create subscription order');
      }

      const { orderId, amount, keyId, plan, organization } = res.data;

      // 2. Load Razorpay Checkout Script
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
          setMessage(`Success! Campus capacity updated: ${plan.maxStudentQuota} student quota activated. All campus students can now enroll 100% free!`);
          await fetchStatus();
          if (onActivated) onActivated(verifyRes.data);
        } else {
          setError(verifyRes.data.message || 'Payment verification failed');
        }
      };

      if (!isLoaded || !window.Razorpay) {
        // Mock / Sandbox direct completion fallback
        await completeVerification({ razorpay_order_id: orderId }, true);
        setLoading(false);
        return;
      }

      // 3. Launch Razorpay UI
      const options = {
        key: keyId,
        amount: res.data.amountInPaise,
        currency: 'INR',
        name: 'CapacityConnect • MoES / IMD',
        description: `${plan.title} - Institutional Student Quota`,
        order_id: orderId,
        prefill: {
          name: organization?.name || 'Institute Administrator',
          email: 'admin@institute.edu.in'
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
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Quota Header if active */}
      {quotaMetrics && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Building2 className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Active Campus Membership</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {subscription?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-sm text-blue-200/80 mt-1">
                Your enrolled students access all specialized courses and examinations 100% Free.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/10 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Total Quota</div>
              <div className="text-2xl font-black text-white">{quotaMetrics.maxQuota.toLocaleString()}</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Active Students</div>
              <div className="text-2xl font-black text-amber-300">{quotaMetrics.usedCount.toLocaleString()}</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Remaining</div>
              <div className="text-2xl font-black text-emerald-300">{quotaMetrics.remainingQuota.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Plan Cards */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl font-black text-slate-900">Institutional Student Capacity Plans</h2>
        <p className="text-sm text-slate-600 mt-2">
          Select a student capacity tier for your institution. Upon activation, all students enrolled under your campus roster receive <strong>100% Free Course Access</strong> without individual per-course payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${plan.accent}`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {plan.badge}
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{plan.badge}</div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{plan.name}</h3>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500 font-medium">/ year</span>
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100/70 text-blue-800 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                Capacity: {plan.quota.toLocaleString()} Students Included
              </div>

              <div className="mt-6 space-y-3">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubscribe(plan.tier)}
              disabled={loading}
              className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Initiating Gateway...' : `Activate ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutePlanSelector;
