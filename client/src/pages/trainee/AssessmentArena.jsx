import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Timer,
  CheckCircle,
  XCircle,
  Award,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import CertificateModal from '../../components/CertificateModal';
import { useToast } from '../../context/NotificationContext';

const AssessmentArena = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [assessment, setAssessment] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: 1, 1: 3, ... }
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('official'); // 'official' or 'practice'
  const [loading, setLoading] = useState(true);
  const [issuedCertificate, setIssuedCertificate] = useState(null);
  const [claimingCert, setClaimingCert] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.getCourseAssessment(courseId);
        if (res.success && res.assessment) {
          setAssessment(res.assessment);
          setTimeLeft((res.assessment.durationMinutes || 15) * 60);
        }
      } catch (err) {
        console.error('Error fetching assessment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [courseId]);

  // Countdown timer
  useEffect(() => {
    if (!result && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !result && assessment) {
      handleSubmit();
    }
  }, [timeLeft, result, assessment]);

  const handleOptionSelect = (optIdx) => {
    if (result) return; // Locked once submitted
    setSelectedAnswers(prev => ({ ...prev, [currentQIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !assessment) return;
    setIsSubmitting(true);

    const userAnswers = Object.keys(selectedAnswers).map(qIdx => ({
      questionIndex: parseInt(qIdx, 10),
      selectedOption: selectedAnswers[qIdx]
    }));

    try {
      const res = await api.submitAssessment(assessment._id, {
        userAnswers,
        timeSpentSeconds: ((assessment.durationMinutes || 15) * 60) - timeLeft,
        mode
      });

      if (res.success) {
        setResult(res);
        if (res.passed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          toast.success(`Assessment submitted! You scored ${res.percentage || 0}%.`);
        } else {
          toast.warning(`Assessment submitted. Score: ${res.percentage || 0}%. Minimum required is ${assessment.passPercentage}%.`);
        }
      }
    } catch (err) {
      toast.error(err.message, 'Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimCertificate = async () => {
    setClaimingCert(true);
    try {
      const res = await api.claimCertificate(courseId);
      if (res.success) {
        setIssuedCertificate(res.certificate);
        setShowCertModal(true);
        toast.success('Certificate generated & cryptographically signed!');
      }
    } catch (err) {
      toast.info(err.message, 'Certificate Status');
    } finally {
      setClaimingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-bold text-slate-800 text-base">Assessment Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">This course does not currently have an active proctored assessment.</p>
        <Link to={`/trainee/course/${courseId}`} className="inline-block px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs">
          Return to Course
        </Link>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const questions = assessment.questions || [];
  const activeQ = questions[currentQIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Examination Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={`/trainee/course/${courseId}`}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Back to Course Player"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-300">
                Government Standard Proctored Assessment
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">{assessment.courseTitle}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 mt-1">{assessment.title}</h1>
          </div>
        </div>

        {/* Timer and Mode */}
        {!result && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2 bg-slate-950 text-white px-3.5 py-2 rounded-xl font-mono text-xs shadow-xs border border-slate-800">
              <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-bold">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setMode('official')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${mode === 'official' ? 'bg-[#0c4a6e] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Official
              </button>
              <button
                onClick={() => setMode('practice')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${mode === 'practice' ? 'bg-[#0c4a6e] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Practice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RESULT VIEW (If Submitted) */}
      {result ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-8 space-y-6 animate-in fade-in">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl bg-slate-50 border border-slate-200">
              {result.passed ? '🎉' : '⚠️'}
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              {result.passed ? 'Assessment Passed Successfully!' : 'Assessment Not Cleared'}
            </h2>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {result.passed
                ? `Outstanding performance. You satisfied the qualifying benchmark threshold of ${result.passPercentage}% and your certified achievement has been recorded into your National Competency Passport.`
                : `You scored ${result.percentage}%. The minimum passing threshold is ${result.passPercentage}%. Review the operational explanations below and retake when ready.`}
            </p>

            {/* Score Pill */}
            <div className="inline-flex items-center space-x-6 bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl text-center shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Score</span>
                <div className="text-2xl font-black text-sky-600">
                  {result.scoreObtained} / {result.totalPossibleMarks}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Percentage</span>
                <div className={`text-2xl font-black ${result.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {result.percentage}%
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <div className={`text-xs font-black uppercase px-2.5 py-1 rounded-md ${result.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {result.passed ? 'QUALIFIED' : 'RETAKE NEEDED'}
                </div>
              </div>
            </div>

            {/* Claim Certificate Action */}
            {result.passed && (
              <div className="pt-4 space-y-3">
                {result.percentage >= 80 ? (
                  <>
                    <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] text-emerald-800 font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Score {result.percentage}% — You qualify for the official certificate!</span>
                    </div>
                    <div>
                      <button
                        onClick={handleClaimCertificate}
                        disabled={claimingCert}
                        className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center space-x-2 mx-auto transition cursor-pointer"
                      >
                        <Award className="w-5 h-5 text-slate-950" />
                        <span>{claimingCert ? 'Generating Certificate...' : 'Claim & View Official Certificate'}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800 max-w-md mx-auto">
                    <div className="font-bold mb-1">📋 Certificate Qualification Info</div>
                    <p>You passed the exam ({result.percentage}%), but a minimum of <strong>80%</strong> is required to generate the official credential certificate. Retake when ready to elevate your score!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Question Review & Explanations */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Detailed Examination Breakdown & Explanations:</h3>
            
            <div className="space-y-4">
              {(result.answers || []).map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs ${
                    ans.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 font-bold mb-2">
                    <span className="text-slate-900">
                      Question {idx + 1}: {ans.questionText}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono uppercase text-[10px] font-bold ${ans.isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {ans.isCorrect ? `+${ans.marksAwarded} Marks` : '0 Marks'}
                    </span>
                  </div>

                  <div className="space-y-1 mb-2 text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">Your selection: </span>
                      <span className={ans.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {ans.selectedOption >= 0 ? ans.options[ans.selectedOption] : 'Not answered'}
                      </span>
                    </div>
                    {!ans.isCorrect && (
                      <div>
                        <span className="font-semibold text-emerald-800">Correct answer: </span>
                        <span className="text-emerald-800 font-bold">
                          {ans.options[ans.correctOptionIndex]}
                        </span>
                      </div>
                    )}
                  </div>

                  {ans.explanation && (
                    <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 text-slate-600 mt-2">
                      <span className="font-bold text-slate-800">Operational Scientific Explanation: </span>
                      <span>{ans.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* LIVE TEST QUESTION RUNNER */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Main Question Viewport */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Question {currentQIdx + 1} of {questions.length}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Marks: {activeQ?.marks || 2} • Level: {activeQ?.difficulty || 'Medium'}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 leading-relaxed">
              {activeQ?.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {(activeQ?.options || []).map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQIdx] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-600 text-sky-950 shadow-xs ring-1 ring-sky-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'border-slate-300 text-slate-500 bg-white'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentQIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQIdx === 0}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentQIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Final Assessment'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Question Palette
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCurrent = currentQIdx === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIdx(idx)}
                    className={`h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center border cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-sky-600 border-sky-600 bg-sky-50 text-sky-900 font-black'
                        : (isAnswered
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200')
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Answered ({Object.keys(selectedAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-slate-200" />
                <span>Unattempted ({questions.length - Object.keys(selectedAnswers).length})</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Submit Test
            </button>
          </div>

        </div>
      )}

      {/* Certificate Modal Viewer */}
      {showCertModal && issuedCertificate && (
        <CertificateModal
          certificate={issuedCertificate}
          onClose={() => setShowCertModal(false)}
        />
      )}

    </div>
  );
};

export default AssessmentArena;
