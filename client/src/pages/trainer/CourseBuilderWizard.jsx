import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Layers,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  FileText,
  Video,
  Terminal,
  Code,
  Upload,
  Link2,
  ExternalLink,
  Sliders,
  Edit
} from 'lucide-react';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import TrainerHeader from '../../components/TrainerHeader';

const STEPS = [
  { id: 1, label: 'Course Metadata' },
  { id: 2, label: 'Outcomes & Prereqs' },
  { id: 3, label: 'Competencies' },
  { id: 4, label: 'Modules & Lessons' },
  { id: 5, label: 'Review & Submit' }
];

const FALLBACK_COMPETENCIES = [
  {
    _id: '6a9bf32dff06c7122b3df5f0',
    code: 'RAD-301',
    name: 'Doppler Weather Radar (DWR) Analysis & Nowcasting',
    domain: 'Radar Meteorology',
    description: 'Interpretation of radar reflectivity (Z), radial velocity (V), and spectrum width (W) for real-time severe storm warnings.'
  },
  {
    _id: '6a9bf33dd8a6747627182344',
    code: 'NWP-101',
    name: 'Numerical Weather Prediction & Data Assimilation',
    domain: 'Numerical Weather Prediction (NWP)',
    description: 'Configuration, parameterization, and execution of primitive equation atmospheric models (WRF, GFS-NCMRWF).'
  },
  {
    _id: '6a9bf33dd8a6747627182345',
    code: 'CYC-501',
    name: 'Tropical Cyclone Tracking & Storm Surge Modeling',
    domain: 'Cyclone Warning & Disaster Management',
    description: 'Dvorak technique intensity estimation, parabolic track forecasting, and INCOIS storm surge coastal risk warnings.'
  },
  {
    _id: '6a9bf33dd8a6747627182346',
    code: 'SAT-401',
    name: 'INSAT-3D/3DR Satellite Radiance & Cloud Motion Vectors',
    domain: 'Satellite Meteorology',
    description: 'Interpretation of multispectral geostationary imagery (VIS, SWIR, TIR1, TIR2, WV) for deep convective cloud tracking.'
  },
  {
    _id: '6a9bf33dd8a6747627182347',
    code: 'ATM-201',
    name: 'Atmospheric Thermodynamics & Meso-Scale Dynamics',
    domain: 'Atmospheric Sciences',
    description: 'Tephigram analysis, convective available potential energy (CAPE), wind shear, and boundary layer thermodynamics.'
  }
];

const CourseBuilderWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'platform_admin' || user?.role === 'platform_super_admin';
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get('courseId');
  const isEditMode = Boolean(editCourseId);

  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [competencies, setCompetencies] = useState(FALLBACK_COMPETENCIES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(isEditMode);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: '',
    description: '',
    level: 'Intermediate',
    durationWeeks: 4,
    durationHours: 24,
    capacity: 100,
    outcomes: [''],
    prerequisites: [''],
    competencyIds: [],
    targetCompetencyLevel: 'Proficient',
    modules: [
      {
        title: '',
        sequence: 1,
        items: [
          {
            title: '',
            type: 'video',
            durationMinutes: 20,
            contentUrl: '',
            description: '',
            notes: ''
          }
        ]
      }
    ]
  });

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const res = await api.getCompetencies();
        if (res.success && res.competencies && res.competencies.length > 0) {
          setCompetencies(res.competencies);
        } else {
          setCompetencies(FALLBACK_COMPETENCIES);
        }
      } catch (err) {
        console.error('Error fetching competencies:', err);
        setCompetencies(FALLBACK_COMPETENCIES);
      }
    };
    fetchCompetencies();
  }, []);

  // Pre-fill form when in Edit Mode
  useEffect(() => {
    if (!editCourseId) return;

    const fetchCourseForEdit = async () => {
      setLoadingCourse(true);
      try {
        const res = await api.getCourse(editCourseId);
        if (res.success && res.course) {
          const c = res.course;
          setFormData({
            title: c.title || '',
            code: c.code || '',
            category: c.category || '',
            description: c.description || '',
            level: c.level || 'Intermediate',
            durationWeeks: c.durationWeeks || 4,
            durationHours: c.durationHours || 24,
            capacity: c.capacity || 100,
            outcomes: c.outcomes && c.outcomes.length > 0 ? c.outcomes : [''],
            prerequisites: c.prerequisites && c.prerequisites.length > 0 ? c.prerequisites : [''],
            competencyIds: (c.competencyIds || []).map(comp => typeof comp === 'object' ? comp._id : comp),
            targetCompetencyLevel: c.targetCompetencyLevel || 'Proficient',
            modules: (c.modules || []).length > 0 ? c.modules.map(m => ({
              title: m.title || '',
              sequence: m.sequence || 1,
              items: (m.items || []).map(it => ({
                title: it.title || '',
                type: it.type || 'video',
                durationMinutes: it.durationMinutes || 20,
                contentUrl: it.contentUrl || '',
                fileName: it.fileName || '',
                description: it.description || '',
                notes: it.notes || ''
              }))
            })) : [
              {
                title: '',
                sequence: 1,
                items: [{ title: '', type: 'video', durationMinutes: 20, contentUrl: '', fileName: '', description: '', notes: '' }]
              }
            ]
          });
        } else {
          toast.error('Course not found for editing');
        }
      } catch (err) {
        console.error('Error fetching course for edit:', err);
        toast.error(err.message || 'Failed to load course details for editing');
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourseForEdit();
  }, [editCourseId]);

  const handleOutcomeChange = (idx, value) => {
    const updated = [...formData.outcomes];
    updated[idx] = value;
    setFormData({ ...formData, outcomes: updated });
  };

  const addOutcome = () => {
    setFormData({ ...formData, outcomes: [...formData.outcomes, ''] });
  };

  const removeOutcome = (idx) => {
    setFormData({ ...formData, outcomes: formData.outcomes.filter((_, i) => i !== idx) });
  };

  const handlePrereqChange = (idx, value) => {
    const updated = [...formData.prerequisites];
    updated[idx] = value;
    setFormData({ ...formData, prerequisites: updated });
  };

  const addPrereq = () => {
    setFormData({ ...formData, prerequisites: [...formData.prerequisites, ''] });
  };

  const removePrereq = (idx) => {
    setFormData({ ...formData, prerequisites: formData.prerequisites.filter((_, i) => i !== idx) });
  };

  const toggleCompetency = (compId) => {
    const exists = formData.competencyIds.includes(compId);
    const updated = exists
      ? formData.competencyIds.filter(id => id !== compId)
      : [...formData.competencyIds, compId];
    setFormData({ ...formData, competencyIds: updated });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          title: '',
          sequence: formData.modules.length + 1,
          items: [
            {
              title: '',
              type: 'video',
              durationMinutes: 25,
              contentUrl: '',
              description: '',
              notes: ''
            }
          ]
        }
      ]
    });
    toast.success('New module added.');
  };

  const removeModule = (modIdx) => {
    if (formData.modules.length <= 1) {
      toast.warning('A course must have at least one curriculum module.');
      return;
    }
    const updated = formData.modules.filter((_, i) => i !== modIdx);
    setFormData({ ...formData, modules: updated });
    toast.info('Curriculum module removed.');
  };

  const addLesson = (modIdx) => {
    const updated = [...formData.modules];
    const lessonNum = updated[modIdx].items.length + 1;
    updated[modIdx].items.push({
      title: '',
      type: 'video',
      durationMinutes: 20,
      contentUrl: '',
      description: '',
      notes: ''
    });
    setFormData({ ...formData, modules: updated });
  };

  const removeLesson = (modIdx, lessonIdx) => {
    const updated = [...formData.modules];
    if (updated[modIdx].items.length <= 1) {
      toast.warning('Each module must have at least one lesson.');
      return;
    }
    updated[modIdx].items = updated[modIdx].items.filter((_, i) => i !== lessonIdx);
    setFormData({ ...formData, modules: updated });
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title?.trim()) {
        toast.warning('Please enter Course Title before proceeding to the next step.');
        return false;
      }
      if (!formData.code?.trim()) {
        toast.warning('Please enter Course Code before proceeding to the next step.');
        return false;
      }
      if (!formData.category?.trim()) {
        toast.warning('Please enter Domain Category before proceeding to the next step.');
        return false;
      }
      if (!formData.description?.trim()) {
        toast.warning('Please provide a Course Description before proceeding to the next step.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      const validOutcomes = formData.outcomes.filter(o => o?.trim().length > 0);
      if (validOutcomes.length === 0) {
        toast.warning('Please specify at least one Learning Outcome in Step 2.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.competencyIds || formData.competencyIds.length === 0) {
        toast.warning('Please select at least one Competency in Step 3.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.modules || formData.modules.length === 0) {
        toast.warning('Please add at least one Curriculum Module in Step 4.');
        return false;
      }
      const emptyModule = formData.modules.find(m => !m.title?.trim());
      if (emptyModule) {
        toast.warning('Please make sure every curriculum module has a title.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === currentStep) return;
    if (isEditMode || targetStep < currentStep) {
      // In edit mode or revisiting previous steps, allow direct navigation
      setCurrentStep(targetStep);
      return;
    }

    // Must validate current and all intermediate steps before jumping forward in create mode
    for (let s = currentStep; s < targetStep; s++) {
      if (!validateStep(s)) {
        return; // Validation failed, blocked
      }
    }
    setCurrentStep(targetStep);
  };

  const handleSubmit = async () => {
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const preparedModules = formData.modules.map((m, mIdx) => ({
        ...m,
        sequence: mIdx + 1,
        items: (m.items || []).map((it, iIdx) => ({
          ...it,
          title: it.title?.trim() || `Lesson ${mIdx + 1}.${iIdx + 1}: ${
            it.type === 'interactive' ? 'Interactive Python Sandbox' :
            it.type === 'pdf' ? 'MoES Technical Handbook' :
            it.type === 'document' ? 'Technical Operating Brief' :
            it.type === 'slides' ? 'Lecture Presentation Slides' :
            'Synoptic Meteorological Session'
          }`,
          type: it.type || 'video',
          durationMinutes: it.durationMinutes || 20,
          contentUrl: it.contentUrl || '',
          fileName: it.fileName || '',
          description: it.description || '',
          notes: it.notes || ''
        }))
      }));

      const payload = {
        ...formData,
        modules: preparedModules,
        outcomes: formData.outcomes.filter(o => o.trim().length > 0),
        prerequisites: formData.prerequisites.filter(p => p.trim().length > 0),
        status: 'published' // Auto-publish so trainees can see & enroll immediately
      };

      if (isEditMode) {
        const res = await api.updateCourse(editCourseId, payload);
        if (res.success) {
          toast.success('Course updated successfully! All changes are live.', 'Curriculum Updated');
          navigate(isAdmin ? '/admin/course-governance' : '/trainer/my-courses');
        }
      } else {
        const res = await api.createCourse(payload);
        if (res.success) {
          toast.success(
            isAdmin
              ? '🏛️ Government Course created & published directly to national catalogue!'
              : 'Course created & published successfully! It is now live in the course catalogue.'
          );
          navigate(isAdmin ? '/admin/course-governance' : '/trainer/my-courses');
        }
      }
    } catch (err) {
      toast.error(err.message, isEditMode ? 'Course Update Error' : 'Course Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <div className="text-slate-500 font-bold text-xs">Loading course details for editing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 select-none">
      
      {/* Executive Header */}
      <TrainerHeader
        title={
          isEditMode
            ? `Edit Curriculum: ${formData.title || 'Course'}`
            : (isAdmin ? "🏛️ Government Course Builder (National Curriculum)" : "Curriculum & Course Builder Studio")
        }
        subtitle={
          isEditMode
            ? "Modify course metadata, competencies, lesson videos, PDF handbooks, and documents."
            : (isAdmin
                ? "Author official Ministry of Earth Sciences (MoES) / IMD capacity building courses with direct national accreditation and instant catalogue publishing."
                : "Author accredited national meteorological training modules mapped to official competency frameworks with multimedia resources and quizzes.")
        }
        badge={
          isEditMode
            ? "Curriculum Editor Mode"
            : (isAdmin ? "🏛️ MoES / IMD National Authoring" : "Curriculum Authoring Engine")
        }
      />

      {/* Step Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="flex flex-col items-center flex-1 focus:outline-none cursor-pointer transition group"
                  title={`Go to ${step.label}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 text-center hidden sm:block ${
                      isCurrent ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {step.id < STEPS.length && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Metadata */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <h2 className="text-base font-bold text-slate-800 pb-2 border-b">
            Step 1: Course Identity & Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">Course Title *</label>
              <input
                type="text"
                placeholder="e.g., Advanced Radar Interpretation & Squall Line Nowcasting"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Course Code (Unique) *</label>
              <input
                type="text"
                placeholder="e.g., RAD-402"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Scientific Domain Category *</label>
              <input
                type="text"
                required
                placeholder="e.g., Radar Meteorology, Satellite, NWP, Marine..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">Course Abstract / Syllabus Scope *</label>
              <textarea
                rows={3}
                placeholder="Describe the operational capacity and scientific principles addressed in this course..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Difficulty Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="Foundational">Foundational</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Duration (Weeks / Total Hours)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Weeks"
                  value={formData.durationWeeks}
                  onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })}
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Hours"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                  className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Outcomes & Prerequisites */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <h2 className="text-base font-bold text-slate-800 pb-2 border-b">
            Step 2: Measurable Learning Outcomes & Prerequisites
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-700">Key Learning Outcomes</label>
                <button
                  onClick={addOutcome}
                  className="text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Outcome</span>
                </button>
              </div>

              {formData.outcomes.map((out, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`e.g., Outcome ${idx + 1}: Interpret radial velocity gradients under severe convective regimes`}
                    value={out}
                    onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  {formData.outcomes.length > 1 && (
                    <button
                      onClick={() => removeOutcome(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-700">Course Prerequisites</label>
                <button
                  onClick={addPrereq}
                  className="text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prerequisite</span>
                </button>
              </div>

              {formData.prerequisites.map((pre, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g., Basic Atmospheric Thermodynamics or Skew-T diagram reading"
                    value={pre}
                    onChange={(e) => handlePrereqChange(idx, e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  {formData.prerequisites.length > 1 && (
                    <button
                      onClick={() => removePrereq(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Competencies Mapping */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Step 3: Competency Taxonomy Alignment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Map which government-accredited competencies forecasters will earn upon completing this training.
              </p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full self-start sm:self-auto border border-indigo-200">
              {formData.competencyIds.length} Selected
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(competencies.length > 0 ? competencies : FALLBACK_COMPETENCIES).map((comp) => {
              const compId = comp._id || comp.code;
              const isSelected = formData.competencyIds.includes(compId) || formData.competencyIds.includes(comp._id);

              return (
                <div
                  key={compId}
                  onClick={() => toggleCompetency(compId)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-xs space-y-2 select-none relative ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/25 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border text-slate-700 shadow-2xs">
                      {comp.code}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-medium">{comp.domain}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 pr-2">{comp.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{comp.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Modules & Lessons */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Step 4: Curriculum Modules & Multimedia Lessons
              </h2>
              <p className="text-xs text-slate-500">Add lectures, slides, and operational notes.</p>
            </div>
            <button
              onClick={addModule}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.modules.map((mod, mIdx) => (
              <div key={mIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                {/* Module Header with Delete Button */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={mod.title}
                      placeholder={`Module ${mIdx + 1} Title`}
                      onChange={(e) => {
                        const updated = [...formData.modules];
                        updated[mIdx].title = e.target.value;
                        setFormData({ ...formData, modules: updated });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {formData.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(mIdx)}
                      className="p-2.5 text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-300 transition-colors shadow-sm shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span className="hidden sm:inline">Delete Module</span>
                    </button>
                  )}
                </div>

                {/* Lessons Section */}
                <div className="space-y-3 pl-4 border-l-2 border-indigo-200">
                  {mod.items.map((item, iIdx) => (
                    <div key={iIdx} className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">Lesson {iIdx + 1}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            item.type === 'interactive' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            item.type === 'pdf' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            item.type === 'document' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            item.type === 'slides' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {item.type || 'video'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400 font-semibold">Duration:</span>
                            <input
                              type="number"
                              min="1"
                              max="180"
                              value={item.durationMinutes || 20}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].durationMinutes = Number(e.target.value);
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-14 p-1 border border-slate-200 rounded text-center font-mono text-[11px]"
                            />
                            <span className="text-[10px] text-slate-400">min</span>
                          </div>

                          {mod.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLesson(mIdx, iIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lesson Title & Format Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-[11px] text-slate-600 block mb-1">Lesson Title *</label>
                          <input
                            type="text"
                            placeholder="e.g., 1.1 Object-Oriented Programming in Python or Doppler Velocity Dealiasing"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...formData.modules];
                              updated[mIdx].items[iIdx].title = e.target.value;
                              setFormData({ ...formData, modules: updated });
                            }}
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[11px] text-slate-600 block mb-1">Format Type</label>
                          <select
                            value={item.type || 'video'}
                            onChange={(e) => {
                              const updated = [...formData.modules];
                              updated[mIdx].items[iIdx].type = e.target.value;
                              setFormData({ ...formData, modules: updated });
                            }}
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                          >
                            <option value="video">Video Lecture</option>
                            <option value="interactive">Interactive Sandbox</option>
                            <option value="pdf">PDF Document</option>
                            <option value="document">DOC / Word Document</option>
                            <option value="slides">Presentation Slides</option>
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Content Upload & Configuration Panel based on Format Type */}

                      {/* 1. VIDEO LECTURE */}
                      {(!item.type || item.type === 'video') && (
                        <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-[11px] text-sky-950 flex items-center space-x-1.5">
                              <Video className="w-4 h-4 text-sky-600" />
                              <span>Lesson Video URL / Media Link (YouTube, MP4, WebM, Vimeo)</span>
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                                Video Lecture
                              </span>
                              {item.contentUrl && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  ✓ Video Linked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="https://www.youtube.com/watch?v=... or https://example.com/lecture.mp4"
                              value={item.contentUrl || ''}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = e.target.value;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-sky-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          {/* File upload option */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-sky-100">
                            <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-sky-50 border border-sky-300 rounded-lg text-[11px] font-semibold text-sky-800 cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-sky-600" />
                              <span>Upload Local Video File (.mp4, .webm)</span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 50 * 1024 * 1024) {
                                      toast.warning('Video exceeds 50MB size limit.');
                                      return;
                                    }
                                    toast.info(`Uploading video "${file.name}" to server...`);
                                    try {
                                      const res = await api.uploadFile(file);
                                      if (res.success) {
                                        const updated = [...formData.modules];
                                        updated[mIdx].items[iIdx].contentUrl = res.url;
                                        updated[mIdx].items[iIdx].fileName = res.fileName || file.name;
                                        setFormData({ ...formData, modules: updated });
                                        toast.success(`Video file "${file.name}" uploaded successfully!`);
                                      }
                                    } catch (err) {
                                      toast.error(err.message || 'Video upload failed');
                                    }
                                  }
                                }}
                              />
                            </label>

                            {item.fileName && (
                              <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Attached: {item.fileName}
                              </span>
                            )}
                          </div>

                          {/* Quick Sample Video URL Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold">Quick Presets:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://www.youtube.com/watch?v=_uQrJ0TkZlc';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + Python OOP YouTube
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + High-Speed MP4 Stream
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://www.youtube.com/watch?v=kqtD5dpn9C8';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + Python Full Course
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. INTERACTIVE SANDBOX */}
                      {item.type === 'interactive' && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-[11px] text-amber-950 flex items-center space-x-1.5">
                              <Terminal className="w-4 h-4 text-amber-600" />
                              <span>Interactive Python Sandbox & Live Coding Exercise</span>
                            </label>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Python 3.11 AST Runtime</span>
                            </span>
                          </div>

                          <div>
                            <label className="font-semibold text-[10px] text-amber-900 block mb-1">
                              Coding Exercise Objective / Forecaster Challenge
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Implement a RadarTelemetry class to calculate radial velocity Nyquist limits..."
                              value={item.description || ''}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].description = e.target.value;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-semibold text-[10px] text-amber-900">
                                Starter Python Code (Loaded into Trainee In-Browser IDE)
                              </label>
                              <label className="inline-flex items-center space-x-1 text-[10px] text-amber-700 hover:text-amber-900 font-semibold cursor-pointer">
                                <Upload className="w-3 h-3" />
                                <span>Upload Script (.py)</span>
                                <input
                                  type="file"
                                  accept=".py,.txt"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        const updated = [...formData.modules];
                                        updated[mIdx].items[iIdx].notes = evt.target.result;
                                        setFormData({ ...formData, modules: updated });
                                        toast.success(`Loaded "${file.name}" into Starter Code!`);
                                      };
                                      reader.readAsText(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            <textarea
                              rows={5}
                              placeholder={`# Starter Python Code for Trainees\nclass RadarScan:\n    def __init__(self, frequency, prf):\n        self.frequency = frequency\n        self.prf = prf\n\nprint("Radar Initialized")`}
                              value={item.notes || ''}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].notes = e.target.value;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-full p-2.5 bg-slate-950 text-emerald-300 font-mono text-xs rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              spellCheck={false}
                            />
                          </div>

                          {/* Quick Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold">Preset Templates:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].description = 'Calculate Doppler radial velocity and maximum unambiguous Nyquist range.';
                                updated[mIdx].items[iIdx].notes = `# Doppler Radial Velocity & Nyquist Calculation\nwavelength = 0.053  # C-band radar wavelength (5.3 cm in meters)\nprf = 1200          # Pulse Repetition Frequency (Hz)\n\n# Calculate maximum unambiguous velocity\nnyquist_v = (wavelength * prf) / 4\nprint(f"Operational Frequency: C-Band (λ={wavelength*100:.1f} cm)")\nprint(f"Pulse Repetition Frequency: {prf} Hz")\nprint(f"Max Unambiguous Nyquist Velocity: {nyquist_v:.2f} m/s ({nyquist_v*3.6:.1f} km/h)")`;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + Radar Doppler Nyquist Lab
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].description = 'Parse raw Automatic Weather Station (AWS) telemetry packet and check QA limits.';
                                updated[mIdx].items[iIdx].notes = `# Automatic Weather Station (AWS) Telemetry Parser\nclass AWSPacketParser:\n    def __init__(self, station_id, temp_c, humidity, pressure):\n        self.station_id = station_id\n        self.temp_c = temp_c\n        self.humidity = humidity\n        self.pressure = pressure\n\n    def validate(self):\n        is_valid = -50 <= self.temp_c <= 60 and 0 <= self.humidity <= 100\n        return "✓ Telemetry Valid" if is_valid else "⚠️ Sensor Fault Detected"\n\naws = AWSPacketParser("IMD-DEL-04", 29.5, 68, 1012.4)\nprint(f"Station {aws.station_id}: Temp={aws.temp_c}C, RH={aws.humidity}%, Pressure={aws.pressure} hPa")\nprint("Data Quality Status:", aws.validate())`;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + AWS Telemetry Parser Lab
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].description = 'Estimate tropical cyclone central pressure deficit using Dvorak T-number.';
                                updated[mIdx].items[iIdx].notes = `# Tropical Cyclone Central Pressure Deficit (Mishra-Dvorak Model)\ndef estimate_cyclone_pressure(t_number, ambient_pressure=1010.0):\n    deficit = (t_number ** 2) * 1.8\n    central_p = ambient_pressure - deficit\n    return central_p, deficit\n\nt_val = 4.5\np_central, p_deficit = estimate_cyclone_pressure(t_val)\nprint(f"Current Dvorak T-Number: T{t_val}")\nprint(f"Central Pressure Deficit: {p_deficit:.1f} hPa")\nprint(f"Estimated Central Pressure: {p_central:.1f} hPa")\nprint(f"Intensity Category: Very Severe Cyclonic Storm (VSCS)")`;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + Cyclone Pressure Solver
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. PDF DOCUMENT */}
                      {item.type === 'pdf' && (
                        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-[11px] text-rose-950 flex items-center space-x-1.5">
                              <FileText className="w-4 h-4 text-rose-600" />
                              <span>Official PDF Document / MoES Handbook Link</span>
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                                PDF Document
                              </span>
                              {item.contentUrl && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  ✓ Document Attached
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="https://example.com/handbook.pdf or MoES Document / Drive link"
                              value={item.contentUrl || ''}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = e.target.value;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-rose-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                          </div>

                          {/* File Upload Option */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-100">
                            <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg text-[11px] font-semibold text-rose-800 cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-rose-600" />
                              <span>Upload PDF File (.pdf)</span>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 50 * 1024 * 1024) {
                                      toast.warning('File exceeds 50MB limit.');
                                      return;
                                    }
                                    toast.info(`Uploading PDF "${file.name}" to server...`);
                                    try {
                                      const res = await api.uploadFile(file);
                                      if (res.success) {
                                        const updated = [...formData.modules];
                                        updated[mIdx].items[iIdx].contentUrl = res.url;
                                        updated[mIdx].items[iIdx].fileName = res.fileName || file.name;
                                        setFormData({ ...formData, modules: updated });
                                        toast.success(`PDF Document "${file.name}" uploaded to server!`);
                                      }
                                    } catch (err) {
                                      toast.error(err.message || 'PDF upload failed');
                                    }
                                  }
                                }}
                              />
                            </label>

                            {item.fileName && (
                              <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Attached: {item.fileName}
                              </span>
                            )}
                          </div>

                          {/* Quick Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold">Standard Manuals:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
                                updated[mIdx].items[iIdx].notes = 'Refer to Chapter 3 (pages 45-68) for standard radar calibration protocols and PRF configurations.';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + MoES Radar Manual PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
                                updated[mIdx].items[iIdx].notes = 'Official IMD Meteorological Standards: Observational protocols for severe convective weather warnings.';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + IMD Standard Guidelines PDF
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. PRESENTATION SLIDES */}
                      {item.type === 'slides' && (
                        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-[11px] text-indigo-950 flex items-center space-x-1.5">
                              <Layers className="w-4 h-4 text-indigo-600" />
                              <span>Presentation Slide Deck URL / Embed Link</span>
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                                Presentation Slides
                              </span>
                              {item.contentUrl && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  ✓ Deck Linked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="https://docs.google.com/presentation/d/.../embed or Canva/SlideShare link"
                              value={item.contentUrl || ''}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = e.target.value;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* File Upload Option */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100">
                            <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-lg text-[11px] font-semibold text-indigo-800 cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Upload Presentation Slides (.pptx, .pdf)</span>
                              <input
                                type="file"
                                accept=".ppt,.pptx,.pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 50 * 1024 * 1024) {
                                      toast.warning('File exceeds 50MB limit.');
                                      return;
                                    }
                                    toast.info(`Uploading presentation "${file.name}" to server...`);
                                    try {
                                      const res = await api.uploadFile(file);
                                      if (res.success) {
                                        const updated = [...formData.modules];
                                        updated[mIdx].items[iIdx].contentUrl = res.url;
                                        updated[mIdx].items[iIdx].fileName = res.fileName || file.name;
                                        setFormData({ ...formData, modules: updated });
                                        toast.success(`Presentation file "${file.name}" uploaded to server!`);
                                      }
                                    } catch (err) {
                                      toast.error(err.message || 'Presentation upload failed');
                                    }
                                  }
                                }}
                              />
                            </label>

                            {item.fileName && (
                              <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Attached: {item.fileName}
                              </span>
                            )}
                          </div>

                          {/* Quick Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold">Standard Slide Decks:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://docs.google.com/presentation/d/e/2PACX-1vT101_sample_meteorology_deck/embed';
                                updated[mIdx].items[iIdx].notes = 'Lecture Deck: Synoptic Charting & Atmospheric Fronts (14 slides with radar overlays).';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + Synoptic Meteorology Deck
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://docs.google.com/presentation/d/e/2PACX-1vCyclone_sample_deck/embed';
                                updated[mIdx].items[iIdx].notes = 'Severe Weather Warning Protocols: Track prediction and landfall storm surge modeling.';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + Cyclone Warning Protocol Slides
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 5. DOC / WORD DOCUMENT */}
                      {item.type === 'document' && (
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-[11px] text-blue-950 flex items-center space-x-1.5">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>Official Word / DOC File & Technical Manual Link</span>
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                                DOC / Word File
                              </span>
                              {item.contentUrl && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  ✓ DOC Linked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="https://docs.google.com/document/d/... or SharePoint/Word Online link"
                              value={item.contentUrl || ''}
                              onChange={(e) => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = e.target.value;
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* File Upload Option */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-100">
                            <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg text-[11px] font-semibold text-blue-800 cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-blue-600" />
                              <span>Upload Word File (.doc, .docx)</span>
                              <input
                                type="file"
                                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 50 * 1024 * 1024) {
                                      toast.warning('File exceeds 50MB limit.');
                                      return;
                                    }
                                    toast.info(`Uploading Word document "${file.name}" to server...`);
                                    try {
                                      const res = await api.uploadFile(file);
                                      if (res.success) {
                                        const updated = [...formData.modules];
                                        updated[mIdx].items[iIdx].contentUrl = res.url;
                                        updated[mIdx].items[iIdx].fileName = res.fileName || file.name;
                                        setFormData({ ...formData, modules: updated });
                                        toast.success(`Word Document "${file.name}" uploaded to server!`);
                                      }
                                    } catch (err) {
                                      toast.error(err.message || 'Word document upload failed');
                                    }
                                  }
                                }}
                              />
                            </label>

                            {item.fileName && (
                              <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Attached: {item.fileName}
                              </span>
                            )}
                          </div>

                          {/* Quick Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold">Standard DOC Templates:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://docs.google.com/document/d/e/2PACX-1vSynoptic_Standard_Operating_Procedure/pub';
                                updated[mIdx].items[iIdx].notes = 'Standard Operating Procedure (SOP) for Doppler Radar Shift Forecasters (DOC Manual).';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + MoES Radar SOP Manual (DOC)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.modules];
                                updated[mIdx].items[iIdx].contentUrl = 'https://docs.google.com/document/d/e/2PACX-1vCyclone_Tracking_Guidelines/pub';
                                updated[mIdx].items[iIdx].notes = 'IMD Technical Brief: Tropical Cyclone Inundation & Synoptic Warning Report.';
                                setFormData({ ...formData, modules: updated });
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              + IMD Synoptic Warning Brief (DOC)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lesson Notes & Cheat Sheet */}
                      <div>
                        <label className="font-bold text-[11px] text-slate-600 block mb-1">
                          {item.type === 'interactive' ? 'Challenge Hints & Validation Rules' :
                           item.type === 'pdf' ? 'Handbook Reading Guidelines & Key Pages' :
                           item.type === 'document' ? 'DOC Report Guidelines & Technical Sections' :
                           item.type === 'slides' ? 'Presenter Notes & Slide Key Takeaways' :
                           'Scientific Notes & Key Takeaways'}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            item.type === 'interactive' ? 'e.g. Ensure gate indices are 1-based and velocity is in m/s' :
                            item.type === 'pdf' ? 'e.g. Focus on Section 2.4 Doppler Calibration and Filtering' :
                            item.type === 'document' ? 'e.g. Refer to Section 3: Radar Clutter Filtering and Shift Checklist' :
                            item.type === 'slides' ? 'e.g. Slide 6 contains the core thermodynamic equation' :
                            'Brief notes, key Doppler formulas, or telemetry rules for forecasters'
                          }
                          value={item.notes || ''}
                          onChange={(e) => {
                            const updated = [...formData.modules];
                            updated[mIdx].items[iIdx].notes = e.target.value;
                            setFormData({ ...formData, modules: updated });
                          }}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(mIdx)}
                    className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Lesson to Module {mIdx + 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {currentStep === 5 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
          <h2 className="text-base font-bold text-slate-800 pb-2 border-b">
            Step 5: Review & Submit for MoES / IMD Central Review
          </h2>

          <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span className="font-bold text-slate-700">Title: </span> {formData.title || 'Untitled'}</div>
              <div><span className="font-bold text-slate-700">Code: </span> {formData.code}</div>
              <div><span className="font-bold text-slate-700">Domain: </span> {formData.category}</div>
              <div><span className="font-bold text-slate-700">Level: </span> {formData.level} • {formData.durationWeeks} Weeks</div>
              <div><span className="font-bold text-slate-700">Mapped Competencies: </span> {formData.competencyIds.length} Selected</div>
              <div><span className="font-bold text-slate-700">Total Modules: </span> {formData.modules.length} Modules</div>
            </div>

            {/* Module Breakdown Review */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">Curriculum & Media Assets Summary:</span>
              <div className="space-y-2">
                {formData.modules.map((m, mI) => (
                  <div key={mI} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-950">Module {mI + 1}: {m.title || 'Untitled Module'}</span>
                    <div className="pl-3 mt-1 space-y-1 text-[11px] text-slate-600">
                      {m.items.map((it, itI) => {
                        const itType = it.type || 'video';
                        const typeBadge =
                          itType === 'interactive' ? { label: 'Sandbox', class: 'bg-amber-100 text-amber-800 border-amber-200' } :
                          itType === 'pdf' ? { label: 'PDF', class: 'bg-rose-100 text-rose-800 border-rose-200' } :
                          itType === 'document' ? { label: 'DOC', class: 'bg-blue-100 text-blue-800 border-blue-200' } :
                          itType === 'slides' ? { label: 'Slides', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' } :
                          { label: 'Video', class: 'bg-sky-100 text-sky-800 border-sky-200' };

                        return (
                          <div key={itI} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>• {it.title || `Lesson ${itI + 1}`} ({it.durationMinutes || 20}m)</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${typeBadge.class}`}>
                                {typeBadge.label}
                              </span>
                            </div>
                            {it.contentUrl || (itType === 'interactive' && it.notes) ? (
                              <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                                ✓ Ready: <span className="truncate max-w-[200px]">{it.fileName || it.contentUrl || 'Code Template'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-semibold">⚠️ Default Asset</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Government Governance Protocol: </span>
            Upon submission, this course will enter the <strong>Published / Available</strong> status queue and its video lectures will be immediately playable by enrolled cadets and trainees in the Trainee Video Suite.
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={() => {
              if (validateStep(currentStep)) {
                setCurrentStep(prev => Math.min(5, prev + 1));
              }
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Proceed to Step {currentStep + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center space-x-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Submitting to Registry...') : (isEditMode ? 'Save & Update Course' : 'Publish & Launch Course')}</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default CourseBuilderWizard;
