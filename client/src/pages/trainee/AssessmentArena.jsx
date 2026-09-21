import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Timer,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import CertificateModal from '../../components/CertificateModal';
import { useToast } from '../../context/NotificationContext';
import {
  Button,
  Card,
  Badge,
  PageHeader,
  StatCard,
} from '../../components/design-system';

/**
 * Government Minimalism Assessment UI & Results Page (Sections 33 & 34)
 * Distraction-free exam interface, Question Navigator, Clear radio options, Data-focused Results
 */
const AssessmentArena = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [assessment, setAssessment] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuedCertificate, setIssuedCertificate] = useState(null);
  const [claimingCert, setClaimingCert] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const [course, setCourse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const [assessRes, courseRes] = await Promise.allSettled([
          api.getCourseAssessment(courseId),
          api.getCourse(courseId)
        ]);

        if (courseRes.status === 'fulfilled' && courseRes.value?.course) {
          setCourse(courseRes.value.course);
        }

        if (assessRes.status === 'fulfilled' && assessRes.value?.success && assessRes.value?.assessment) {
          setAssessment(assessRes.value.assessment);
          setTimeLeft((assessRes.value.assessment.durationMinutes || 15) * 60);
        } else {
          setAssessment(null);
          const msg = assessRes.status === 'rejected'
            ? (assessRes.reason?.message || 'No active assessment found for this course.')
            : (assessRes.value?.message || 'No active assessment found for this course.');
          setErrorMsg(msg);
        }
      } catch (err) {
        console.error('Error fetching assessment from database:', err);
        setAssessment(null);
        setErrorMsg(err.message || 'Error connecting to assessment server.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [courseId]);

  // Countdown timer
  useEffect(() => {
    if (!result && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !result && assessment) {
      handleSubmit();
    }
  }, [timeLeft, result, assessment]);

  const handleOptionSelect = (optIdx) => {
    if (result) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !assessment) return;
    setIsSubmitting(true);

    const questions = assessment.questions || [];
    const userAnswers = Object.keys(selectedAnswers).map((qIdx) => ({
      questionIndex: parseInt(qIdx, 10),
      selectedOption: selectedAnswers[qIdx],
    }));

    try {
      const res = await api.submitAssessment(assessment._id, {
        userAnswers,
        timeSpentSeconds: (assessment.durationMinutes || 15) * 60 - timeLeft,
        mode: 'official',
      });

      if (res.success) {
        setResult(res);
        if (res.passed) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          toast.success(`Assessment passed with ${res.percentage}%!`, 'Exam Passed');
        } else {
          toast.warning(`Assessment score: ${res.percentage}%. 80% passing grade required.`, 'Assessment Incomplete');
        }
      }
    } catch (err) {
      // Local scoring fallback
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctOption) correct += 1;
      });
      const pct = Math.round((correct / (questions.length || 1)) * 100);
      const passed = pct >= (assessment.passPercentage || 80);
      const simulatedResult = {
        score: correct,
        totalQuestions: questions.length,
        percentage: pct,
        passed,
        correctCount: correct,
        incorrectCount: questions.length - correct,
        unansweredCount: questions.length - Object.keys(selectedAnswers).length,
        courseId,
      };
      setResult(simulatedResult);
      if (passed) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        toast.success(`Exam passed with ${pct}%!`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimCertificate = async () => {
    setClaimingCert(true);
    try {
      const res = await api.claimCertificate(courseId);
      if (res.success && res.certificate) {
        setIssuedCertificate(res.certificate);
        setShowCertModal(true);
        toast.success('Certificate generated with verifiable QR code!');
      } else {
        toast.info(res.message || 'Certificate record ready.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to claim certificate.');
    } finally {
      setClaimingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#5F6B76] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#1F4E79] border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-[#17202A]">Connecting to Assessment Database...</span>
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <Card padding="lg" className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#1F4E79] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-[#1F4E79]" />
          </div>
          <h2 className="text-base font-bold text-[#17202A]">
            {course?.title ? `${course.title} - Examination` : 'Course Examination'}
          </h2>
          <p className="text-xs text-[#5F6B76] max-w-md mx-auto leading-relaxed">
            {errorMsg || 'No official examination has been published for this course yet in the database. Please contact your instructor.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              Back to Course
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/trainee/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const questions = assessment?.questions || [];
  const currentQ = questions[currentQIdx] || {};
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // ==========================================
  // SECTION 34: RESULTS PAGE
  // ==========================================
  if (result) {
    const score = result.percentage ?? Math.round(((result.score || 0) / (result.totalQuestions || 1)) * 100);
    const passed = result.passed ?? score >= 80;
    const correct = result.correctCount != null ? result.correctCount : result.score || 0;
    const total = result.totalQuestions || questions.length || 1;
    const incorrect = result.incorrectCount != null ? result.incorrectCount : total - correct;
    const unanswered = result.unansweredCount != null ? result.unansweredCount : 0;

    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {/* Results Header (Section 34) */}
        <div className="text-center">
          <Badge variant={passed ? 'approved' : 'rejected'} size="md" className="mb-2">
            {passed ? 'Passed Examination' : 'Did Not Meet Passing Standard'}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17202A] tracking-tight">
            Assessment Results
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6B76] mt-1">
            {assessment.title}
          </p>
        </div>

        {/* Score & Breakdown Cards (Section 34) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Final Score"
            value={`${score}%`}
            subtitle={passed ? 'Pass (≥ 80%)' : 'Fail (< 80%)'}
            changeType={passed ? 'positive' : 'negative'}
          />
          <StatCard
            title="Correct Answers"
            value={correct}
            subtitle={`Out of ${total}`}
          />
          <StatCard
            title="Incorrect"
            value={incorrect}
            subtitle="Review recommended"
          />
          <StatCard
            title="Unanswered"
            value={unanswered}
            subtitle="Skipped questions"
          />
        </div>

        {/* Certificate Eligibility Banner */}
        {passed ? (
          <Card padding="default" className="border-[#C8E6C9] bg-[#E8F5E9]/30 text-center py-6">
            <CheckCircle className="w-8 h-8 text-[#1F7A4D] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#145A32]">
              Accredited Credential Earned
            </h3>
            <p className="text-xs text-[#5F6B76] max-w-md mx-auto mt-1 mb-4">
              You have satisfied the 80% passing threshold for competency certification under the MoES / IMD framework.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleClaimCertificate}
                loading={claimingCert}
                icon={Award}
              >
                Claim & View Certificate
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/trainee/dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="default" className="border-[#FEE4E2] bg-[#FEE4E2]/20 text-center py-6">
            <XCircle className="w-8 h-8 text-[#B42318] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#912018]">
              Passing Standard Not Met
            </h3>
            <p className="text-xs text-[#5F6B76] max-w-md mx-auto mt-1 mb-4">
              MoES WMO-1083 standards require an 80% minimum score to earn national competency certification.
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
                setCurrentQIdx(0);
                setTimeLeft(900);
              }}
              icon={RotateCcw}
            >
              Retake Examination
            </Button>
          </Card>
        )}

        {/* Competency Impact & Recommended Learning (Section 34) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="default">
            <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-2">
              Competency Impact
            </h3>
            <p className="text-xs text-[#5F6B76] leading-relaxed">
              {passed
                ? 'Diagnostic units logged to your permanent Competency Passport. Level increased to Operational Forecaster.'
                : 'Competency gaps identified in Radar interpretation. Targeted module review recommended before re-examination.'}
            </p>
          </Card>

          <Card padding="default">
            <h3 className="text-xs font-bold text-[#17202A] uppercase tracking-wider mb-2">
              Recommended Learning
            </h3>
            <p className="text-xs text-[#5F6B76] leading-relaxed">
              Review Module 3: Dual-Polarization Radar Reflectivity and Doppler Velocity dealiasing procedures.
            </p>
          </Card>
        </div>

        {/* Certificate Modal View */}
        {showCertModal && (
          <CertificateModal
            certificate={issuedCertificate}
            isOpen={showCertModal}
            onClose={() => setShowCertModal(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // SECTION 33: MINIMAL EXAM INTERFACE
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-5">

      {/* Top Exam Header (Section 33) */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-[#17202A]">
            {assessment.title}
          </h1>
          <div className="text-xs text-[#5F6B76] mt-0.5">
            Question <span className="font-semibold text-[#17202A]">{currentQIdx + 1}</span> of{' '}
            <span className="font-semibold text-[#17202A]">{questions.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
          <Timer className="w-4 h-4 text-[#1F4E79]" />
          <span className="text-[#5F6B76]">Time Remaining:</span>
          <span className={`font-bold px-2 py-0.5 rounded-[4px] ${timeLeft < 180 ? 'bg-[#FEE4E2] text-[#B42318]' : 'bg-[#F1F3F6] text-[#17202A]'}`}>
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Main Question Card (Section 33) */}
      <Card padding="lg" className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-[#1F4E79] uppercase tracking-wider block mb-2 font-mono">
            Question {currentQIdx + 1}
          </span>
          <h2 className="text-base sm:text-lg font-semibold text-[#17202A] leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Options List: Option A, B, C, D (Section 33) */}
        <div className="space-y-2.5">
          {(currentQ.options || []).map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentQIdx] === optIdx;
            const letter = String.fromCharCode(65 + optIdx);

            return (
              <div
                key={optIdx}
                onClick={() => handleOptionSelect(optIdx)}
                className={`p-3.5 rounded-[6px] border text-xs sm:text-sm flex items-start gap-3 cursor-pointer transition-colors ${isSelected
                  ? 'border-[#1F4E79] bg-[#EAF2F8] text-[#1F4E79] font-medium'
                  : 'border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] text-[#17202A]'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 ${isSelected
                    ? 'border-[#1F4E79] bg-[#1F4E79] text-white'
                    : 'border-[#CBD5E1] text-[#5F6B76]'
                    }`}
                >
                  {letter}
                </div>
                <div className="flex-1 leading-relaxed">
                  {opt}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Buttons (Section 33) */}
        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentQIdx === 0}
            onClick={() => setCurrentQIdx((q) => Math.max(0, q - 1))}
            icon={ArrowLeft}
          >
            Previous
          </Button>

          {currentQIdx < questions.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentQIdx((q) => Math.min(questions.length - 1, q + 1))}
              iconRight={ArrowRight}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </Card>

      {/* Question Navigator (Section 33) */}
      <Card padding="default">
        <div className="flex items-center justify-between mb-3 text-xs text-[#5F6B76]">
          <span className="font-semibold text-[#17202A] uppercase tracking-wider text-[11px]">
            Question Navigator
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F4E79]" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" /> Pending
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] != null;
            const isCurrent = currentQIdx === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentQIdx(idx)}
                className={`w-8 h-8 rounded-[4px] text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${isCurrent
                  ? 'ring-2 ring-[#1F4E79] ring-offset-1 bg-[#1F4E79] text-white'
                  : isAnswered
                    ? 'bg-[#EAF2F8] text-[#1F4E79] border border-[#D0E1F0]'
                    : 'bg-[#F8FAFC] text-[#5F6B76] border border-[#E5E7EB] hover:bg-[#F1F3F6]'
                  }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </Card>

    </div>
  );
};

export default AssessmentArena;
