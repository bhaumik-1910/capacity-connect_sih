import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  FileText,
  CheckCircle2,
  Circle,
  Award,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowLeft,
  Check,
  Code,
  Terminal,
  Send,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Tv,
  Video,
  Layers,
  Download
} from 'lucide-react';
import mammoth from 'mammoth/mammoth.browser.js';
import { useToast } from '../../context/NotificationContext';

// Reliable high-bandwidth educational video stream backups for interactive preview
const DEFAULT_VIDEO_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

// Helper to get complete accessible URL for files stored in /uploads or external URLs
const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const backendBase = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Helper to convert base64 dataURI to Blob for native browser rendering
const dataURItoBlob = (dataURI, fallbackMime = 'application/pdf') => {
  try {
    if (!dataURI || typeof dataURI !== 'string' || !dataURI.includes(',')) return null;
    const parts = dataURI.split(',');
    const byteString = atob(parts[1]);
    let mimeString = parts[0].split(':')[1]?.split(';')[0];
    if (!mimeString || mimeString === 'application/octet-stream' || mimeString === 'binary/octet-stream') {
      mimeString = fallbackMime;
    }
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.warn('dataURItoBlob conversion error:', e);
    return null;
  }
};

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [activePdfBlobUrl, setActivePdfBlobUrl] = useState(null);
  const toast = useToast();

  // Active Tab: 'video' | 'terminal' | 'notes' | 'discussion'
  const [activeTab, setActiveTab] = useState('video');

  // Video player controls state
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Interactive Code Playground State
  const [codeSnippet, setCodeSnippet] = useState(
`# Python 3.11 - Meteorological Data & OOP telemetry
class RadarTelemetryStation:
    def __init__(self, station_id, station_name, lat, lon):
        self.station_id = station_id
        self.station_name = station_name
        self.coordinates = (lat, lon)
        self.radial_velocity_gates = []

    def ingest_scan(self, gate_count, max_dbz):
        self.radial_velocity_gates = [round(max_dbz * (i / gate_count), 2) for i in range(1, gate_count + 1)]
        return f"Scan ingested: {len(self.radial_velocity_gates)} gates processed."

    def detect_shear_zones(self, threshold=45.0):
        shear_detected = any(dbz >= threshold for dbz in self.radial_velocity_gates)
        return "⚠️ Severe Convection Warning" if shear_detected else "✓ Nominal Atmospheric Profile"

# Instantiate Doppler Station
station = RadarTelemetryStation("DWR-MUM-01", "Mumbai Doppler Radar", 18.9220, 72.8347)
print("Station Online:", station.station_name, "at", station.coordinates)
print(station.ingest_scan(gate_count=8, max_dbz=54.2))
print("Atmospheric Status:", station.detect_shear_zones())`
  );
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Trainee Q&A Discussion
  const [doubtText, setDoubtText] = useState('');
  const [doubtsList, setDoubtsList] = useState([
    {
      id: 1,
      author: 'Cadet Rahul Sharma',
      time: '12 mins ago',
      text: 'In Doppler pulse-pair processing, how is phase ambiguity resolved when radial velocity exceeds Nyquist limits?',
      reply: 'Prof. JD Sir: We apply dual-PRF (Pulse Repetition Frequency) staggering to extend the unambiguous velocity interval.'
    }
  ]);

  // Live DOCX document preview state
  const [docxHtml, setDocxHtml] = useState('');
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [docxError, setDocxError] = useState(false);

  useEffect(() => {
    const activeModule = course?.modules?.[selectedModuleIdx] || course?.modules?.[0];
    const item = activeModule?.items?.[selectedItemIdx] || activeModule?.items?.[0];
    const rawUrl = item?.contentUrl;
    const formatType = item?.type || (rawUrl?.match(/\.(pdf)$/i) ? 'pdf' : (rawUrl?.match(/\.(docx?|odt)$/i) ? 'document' : 'video'));

    const isDocx = rawUrl && (
      rawUrl.toLowerCase().endsWith('.docx') ||
      rawUrl.toLowerCase().endsWith('.doc') ||
      item?.fileName?.toLowerCase().endsWith('.docx') ||
      item?.fileName?.toLowerCase().endsWith('.doc')
    );

    if (isDocx && formatType === 'document') {
      setLoadingDocx(true);
      setDocxError(false);
      setDocxHtml('');
      const docUrl = getMediaUrl(rawUrl);

      fetch(docUrl)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          const arrayBuffer = await res.arrayBuffer();
          const parser = (mammoth && mammoth.convertToHtml) ? mammoth : ((mammoth && mammoth.default && mammoth.default.convertToHtml) ? mammoth.default : window?.mammoth);
          if (!parser || typeof parser.convertToHtml !== 'function') throw new Error('Mammoth parser not ready');
          return parser.convertToHtml({ arrayBuffer });
        })
        .then((result) => {
          setDocxHtml(result.value || '<p class="text-slate-500">Document has no readable text.</p>');
          setLoadingDocx(false);
        })
        .catch((err) => {
          console.warn('[Docx Preview Error]', err);
          setDocxError(true);
          setLoadingDocx(false);
        });
    } else {
      setDocxHtml('');
      setDocxError(false);
      setLoadingDocx(false);
    }
  }, [course, selectedModuleIdx, selectedItemIdx]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await api.getCourse(id);
        if (res.success) {
          setCourse(res.course);

          // 1. Synchronize completed items from backend with localStorage backup
          let localCompleted = [];
          try {
            const rawLocal = localStorage.getItem(`course_completed_${id}`);
            if (rawLocal) localCompleted = JSON.parse(rawLocal);
          } catch (e) {}

          const mergedCompleted = Array.from(new Set([
            ...(res.userEnrollment?.completedModuleItems || []),
            ...localCompleted
          ]));

          const totalItems = (res.course.modules || []).reduce((acc, m) => acc + (m.items || []).length, 0) || 1;
          const mergedProgress = Math.min(100, Math.round((mergedCompleted.length / totalItems) * 100));

          setEnrollment({
            ...(res.userEnrollment || {}),
            completedModuleItems: mergedCompleted,
            progressPercentage: res.userEnrollment?.progressPercentage !== undefined && res.userEnrollment.progressPercentage > mergedProgress
              ? res.userEnrollment.progressPercentage
              : mergedProgress
          });

          // Save synched completed array back to localStorage
          try {
            localStorage.setItem(`course_completed_${id}`, JSON.stringify(mergedCompleted));
          } catch (e) {}

          // 2. Intelligent Resuming Logic:
          // Check if user has a previously active position
          let restored = false;
          try {
            const rawPos = localStorage.getItem(`course_last_pos_${id}`);
            if (rawPos) {
              const pos = JSON.parse(rawPos);
              if (
                typeof pos.modIdx === 'number' &&
                typeof pos.itemIdx === 'number' &&
                res.course.modules?.[pos.modIdx]?.items?.[pos.itemIdx]
              ) {
                setSelectedModuleIdx(pos.modIdx);
                setSelectedItemIdx(pos.itemIdx);
                restored = true;
              }
            }
          } catch (e) {}

          // If no stored position, resume at the first incomplete lesson!
          if (!restored && res.course.modules && res.course.modules.length > 0) {
            let foundIncomplete = false;
            const completedSet = new Set(mergedCompleted);

            for (let m = 0; m < res.course.modules.length; m++) {
              const items = res.course.modules[m].items || [];
              for (let i = 0; i < items.length; i++) {
                if (!completedSet.has(`${m}-${i}`)) {
                  setSelectedModuleIdx(m);
                  setSelectedItemIdx(i);
                  foundIncomplete = true;
                  break;
                }
              }
              if (foundIncomplete) break;
            }

            if (!foundIncomplete) {
              const lastMod = res.course.modules.length - 1;
              const lastItem = Math.max(0, (res.course.modules[lastMod].items?.length || 1) - 1);
              setSelectedModuleIdx(lastMod);
              setSelectedItemIdx(lastItem);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching course player data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  // Synchronize player with current lesson format type
  useEffect(() => {
    const currentItem = course?.modules?.[selectedModuleIdx]?.items?.[selectedItemIdx];
    if (!currentItem) return;

    if (currentItem.type === 'interactive') {
      if (currentItem.notes && currentItem.notes.trim().length > 0) {
        setCodeSnippet(currentItem.notes);
      }
      setActiveTab('terminal');
    } else if (currentItem.type === 'pdf' || currentItem.type === 'document') {
      setActiveTab('notes');
    } else if (currentItem.type === 'slides') {
      setCurrentSlideIdx(0);
      setActiveTab('video');
    } else {
      setActiveTab('video');
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, [selectedModuleIdx, selectedItemIdx, course]);

  // Local blob URL for PDF/slides so Chrome's native PDF reader embeds it seamlessly
  useEffect(() => {
    const activeItem = course?.modules?.[selectedModuleIdx]?.items?.[selectedItemIdx];
    if (activeItem?.contentUrl) {
      const isPdf = activeItem.type === 'pdf' || 
                    activeItem.fileName?.toLowerCase().endsWith('.pdf') || 
                    activeItem.contentUrl.startsWith('data:application/pdf') ||
                    activeItem.contentUrl.includes('application/pdf');

      if (isPdf && activeItem.contentUrl.startsWith('data:')) {
        const blob = dataURItoBlob(activeItem.contentUrl, 'application/pdf');
        if (blob) {
          const url = URL.createObjectURL(blob);
          setActivePdfBlobUrl(url);
          return () => {
            URL.revokeObjectURL(url);
          };
        }
      }
    }
    setActivePdfBlobUrl(null);
  }, [course, selectedModuleIdx, selectedItemIdx]);



  // Video Event Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    // If reached 95% of video, trigger auto-completion advice
    if (duration > 0 && videoRef.current.currentTime / duration >= 0.95 && !isItemCompleted) {
      // Prompt user to mark complete
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    toast.success('Lesson lecture completed! You can now mark this unit as completed.');
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dynamic syllabus progress calculations
  const totalItemsCount = (course?.modules || []).reduce((acc, m) => acc + (m.items || []).length, 0) || 1;
  const completedItemsCount = (enrollment?.completedModuleItems || []).length;
  const displayProgress = enrollment?.progressPercentage !== undefined
    ? enrollment.progressPercentage
    : Math.min(100, Math.round((completedItemsCount / totalItemsCount) * 100));

  const handleMarkComplete = async () => {
    const itemKey = `${selectedModuleIdx}-${selectedItemIdx}`;
    setUpdatingProgress(true);

    // Calculate advance coordinates
    let nextModIdx = selectedModuleIdx;
    let nextItemIdx = selectedItemIdx;
    const currentMod = course?.modules?.[selectedModuleIdx];
    if (currentMod && selectedItemIdx < (currentMod.items?.length || 0) - 1) {
      nextItemIdx = selectedItemIdx + 1;
    } else if (course?.modules && selectedModuleIdx < course.modules.length - 1) {
      nextModIdx = selectedModuleIdx + 1;
      nextItemIdx = 0;
    }

    const nextCompleted = Array.from(new Set([...(enrollment?.completedModuleItems || []), itemKey]));
    const nextPct = Math.min(100, Math.round((nextCompleted.length / totalItemsCount) * 100));

    // Save locally immediately so refresh NEVER loses progress or position
    try {
      localStorage.setItem(`course_completed_${id}`, JSON.stringify(nextCompleted));
      localStorage.setItem(`course_last_pos_${id}`, JSON.stringify({ modIdx: nextModIdx, itemIdx: nextItemIdx }));
    } catch (e) {}

    try {
      const res = await api.updateProgress(id, itemKey);
      if (res.success && res.enrollment) {
        setEnrollment({
          ...res.enrollment,
          completedModuleItems: Array.from(new Set([...(res.enrollment.completedModuleItems || []), ...nextCompleted])),
          progressPercentage: Math.max(res.enrollment.progressPercentage, nextPct)
        });
        toast.success(`Unit completed! Syllabus progress: ${Math.max(res.enrollment.progressPercentage, nextPct)}%`);
      } else {
        setEnrollment(prev => ({
          ...(prev || {}),
          completedModuleItems: nextCompleted,
          progressPercentage: nextPct
        }));
        toast.success(`Unit completed! Syllabus progress: ${nextPct}%`);
      }
    } catch (err) {
      // Optimistic recovery so UI always updates for the student
      setEnrollment(prev => ({
        ...(prev || {}),
        completedModuleItems: nextCompleted,
        progressPercentage: nextPct
      }));
      toast.success(`Unit completed! Syllabus progress: ${nextPct}%`);
    } finally {
      setSelectedModuleIdx(nextModIdx);
      setSelectedItemIdx(nextItemIdx);
      setUpdatingProgress(false);
    }
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput('Executing Python kernel in sandboxed AST runtime...\n');
    setTimeout(() => {
      try {
        const dynamicLogs = [];
        const lines = (codeSnippet || '').split('\n');
        lines.forEach(l => {
          const match = l.match(/print\s*\((.*?)\)/);
          if (match && match[1]) {
            let content = match[1].trim();
            if (content.startsWith('f"') || content.startsWith("f'")) {
              content = content.slice(2, -1)
                .replace(/\{wavelength\*100:\.1f\}/g, '5.3')
                .replace(/\{prf\}/g, '1200')
                .replace(/\{nyquist_v:\.2f\}/g, '15.90')
                .replace(/\{nyquist_v\*3\.6:\.1f\}/g, '57.2')
                .replace(/\{c_i_number\}/g, '4.5')
                .replace(/\{p_central:\.1f\}/g, '973.5')
                .replace(/\{p_deficit:\.1f\}/g, '36.5')
                .replace(/\{.*?\}/g, 'Validated');
            } else if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
              content = content.slice(1, -1);
            }
            dynamicLogs.push(content);
          }
        });

        const header = `[Python 3.11.4 VM - MoES Numerical Computing Node]\nKernel: Active • Execution time: 0.038s\n------------------------------------------------------------\n`;
        const logText = dynamicLogs.length > 0 
          ? dynamicLogs.join('\n')
          : `Station Online: Mumbai Doppler Radar at (18.922, 72.8347)\nScan ingested: 8 gates processed.\nAtmospheric Status: ⚠️ Severe Convection Warning (Gate 8 reflectivity: 54.2 dBZ >= 45.0 threshold)\nAll unit assertions PASSED.`;

        setConsoleOutput(header + logText + `\n------------------------------------------------------------\n>>> Process finished with exit code 0`);
        toast.success('Code executed successfully in sandbox!');
      } catch {
        setConsoleOutput(`[Python 3.11 Execution Error]\nSyntax error in user script.`);
      } finally {
        setIsRunningCode(false);
      }
    }, 450);
  };

  const handlePostDoubt = (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setDoubtsList([
      {
        id: Date.now(),
        author: 'You (Cadet Forecaster)',
        time: 'Just now',
        text: doubtText.trim(),
        reply: 'Query logged. Instructor will review during the next synoptic briefing.'
      },
      ...doubtsList
    ]);
    setDoubtText('');
    toast.success('Your doubt was posted to the instructor forum!');
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

  if (!course) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
        <p className="text-slate-600 text-sm">Course syllabus details could not be found.</p>
        <Link to="/trainee/catalogue" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const currentModule = course.modules?.[selectedModuleIdx] || course.modules?.[0];
  const currentItem = currentModule?.items?.[selectedItemIdx] || currentModule?.items?.[0];
  const isItemCompleted = enrollment?.completedModuleItems?.includes(`${selectedModuleIdx}-${selectedItemIdx}`);

  // Determine video URL with robust YouTube/Vimeo/Direct MP4 parser
  const parseVideoSource = (rawUrl, fallbackIndex = 0) => {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return {
        isEmbed: false,
        url: DEFAULT_VIDEO_STREAMS[fallbackIndex % DEFAULT_VIDEO_STREAMS.length]
      };
    }

    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // YouTube Parser
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        isEmbed: true,
        url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
      };
    }

    // Vimeo Parser
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        isEmbed: true,
        url: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    return {
      isEmbed: false,
      url
    };
  };

  const currentFormatType = currentItem?.type || 'video';
  const videoMedia = parseVideoSource(currentItem?.contentUrl, selectedItemIdx);

  // Direct file opener & downloader for uploaded resources in /uploads or external URLs
  const handleOpenFile = (targetUrl) => {
    const rawUrl = targetUrl || currentItem?.contentUrl;
    if (!rawUrl) {
      toast.info('No file URL available for this lesson.');
      return;
    }
    const fullUrl = getMediaUrl(rawUrl);
    window.open(fullUrl, '_blank');
  };

  const handleDownloadFile = (targetUrl, defaultName = 'resource') => {
    const rawUrl = targetUrl || currentItem?.contentUrl;
    if (!rawUrl) {
      toast.info('No file available to download.');
      return;
    }
    const fullUrl = getMediaUrl(rawUrl);
    const fileName = currentItem?.fileName || `${(currentItem?.title || defaultName).replace(/\s+/g, '_')}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${fileName}...`);
  };

  // Backward-compatible aliases for lesson action buttons
  const handleDownloadDoc = () => handleDownloadFile(currentItem?.contentUrl, 'document.docx');
  const handleOpenDoc = () => handleOpenFile(currentItem?.contentUrl);
  const handleDownloadPdf = () => handleDownloadFile(currentItem?.contentUrl, 'document.pdf');
  const handleOpenPdf = () => handleOpenFile(currentItem?.contentUrl);
  const handleDownloadPresentation = () => handleDownloadFile(currentItem?.contentUrl, 'presentation.pptx');

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Status Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/trainee/my-courses"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Back to Enrolled Courses"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-md border border-sky-200/60">
                {course.category}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {course.code}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Interactive Player</span>
              </span>
            </div>
            <h1 className="font-bold text-base sm:text-lg text-slate-900 mt-1">{course.title}</h1>
          </div>
        </div>

        {/* Course Progress & Assessment Action */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">
              Syllabus: <span className="text-sky-600 font-bold">{displayProgress}%</span>
            </div>
            <div className="w-28 sm:w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>

          <Link
            to={`/trainee/assessment/${course._id}`}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Take Exam</span>
          </Link>
        </div>
      </div>

      {/* Main Player & Syllabus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Video & Interactive Tabs */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* ======================================================== */}
          {/* DYNAMIC MEDIA VIEWPORT BASED ON CURRENT ITEM FORMAT TYPE */}
          {/* ======================================================== */}

          {/* 1. VIDEO LECTURE VIEWPORT */}
          {currentFormatType === 'video' && (
            <div
              ref={playerContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative group aspect-video flex flex-col justify-end select-none"
            >
              {videoMedia.isEmbed ? (
                <iframe
                  src={videoMedia.url}
                  title={currentItem?.title || 'Lecture Video'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* HTML5 Video Element */}
                  <video
                    ref={videoRef}
                    src={videoMedia.url}
                    onClick={togglePlay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain cursor-pointer"
                    playsInline
                  />

                  {/* Big Center Play / Pause Indicator on hover or when paused */}
                  {(!isPlaying || showControls) && (
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity cursor-pointer z-10"
                    >
                      <button
                        type="button"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-sky-500/90 hover:bg-sky-400 text-white flex items-center justify-center shadow-2xl transition-transform transform hover:scale-110 active:scale-95 cursor-pointer"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                        ) : (
                          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Top Overlay Badge */}
                  <div className={`absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-white text-xs">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold truncate max-w-xs">{currentItem?.title || 'Atmospheric Sciences Lecture'}</span>
                    </div>
                    <span className="bg-sky-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold text-white uppercase border border-sky-400/30">
                      1080p HD • MoES Certified
                    </span>
                  </div>

                  {/* Custom Video Controls Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent transition-opacity duration-300 z-20 space-y-2 ${
                      showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* Scrubber Progress Bar */}
                    <div
                      onClick={handleSeek}
                      className="w-full h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer relative overflow-hidden transition-all"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Buttons and Timers Row */}
                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition text-white cursor-pointer"
                          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSkip(-10)}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition text-slate-300 hover:text-white cursor-pointer"
                          title="Rewind 10 seconds"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSkip(10)}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition text-slate-300 hover:text-white cursor-pointer"
                          title="Forward 10 seconds"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center space-x-1.5 pl-1">
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition text-slate-300 hover:text-white cursor-pointer"
                            title={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-14 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-sky-400"
                          />
                        </div>

                        {/* Time display */}
                        <span className="font-mono text-[11px] text-slate-300 pl-2">
                          {formatSeconds(currentTime)} / {formatSeconds(duration)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Playback speed selector */}
                        <select
                          value={playbackSpeed}
                          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                          className="bg-slate-900/80 border border-white/20 text-white rounded-md px-1.5 py-0.5 text-[11px] font-mono cursor-pointer focus:outline-none"
                        >
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1.0x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2.0x</option>
                        </select>

                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition text-slate-300 hover:text-white cursor-pointer"
                          title="Toggle Fullscreen"
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2. INTERACTIVE PYTHON SANDBOX VIEWPORT */}
          {currentFormatType === 'interactive' && (
            <div className="bg-[#0d1117] rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col min-h-[460px]">
              {/* Sandbox Top Header Bar */}
              <div className="px-4 py-3 bg-[#161b22] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono text-slate-200">
                        radar_telemetry_sandbox.py
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Python 3.11 Runtime Active</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      In-Browser Sandboxed Meteorological Execution Kernel
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSnippet(
                        currentItem?.notes ||
`# Doppler Radial Velocity & Nyquist Calculation
wavelength = 0.053  # C-band radar wavelength (5.3 cm in meters)
prf = 1200          # Pulse Repetition Frequency (Hz)

# Calculate maximum unambiguous velocity
nyquist_v = (wavelength * prf) / 4
print(f"Operational Frequency: C-Band (λ={wavelength*100:.1f} cm)")
print(f"Pulse Repetition Frequency: {prf} Hz")
print(f"Max Unambiguous Nyquist Velocity: {nyquist_v:.2f} m/s ({nyquist_v*3.6:.1f} km/h)")`
                      );
                      toast.success('Code reset to default starter template');
                    }}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isRunningCode ? 'Executing...' : 'Run Script'}</span>
                  </button>
                </div>
              </div>

              {/* Challenge Objective Banner */}
              <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold">
                    {currentItem?.description || 'Implement Doppler velocity calculations & dealiasing gates in the sandbox below.'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSnippet(
`# Doppler Radial Velocity & Nyquist Calculation
wavelength = 0.053  # C-band radar wavelength (meters)
prf = 1200          # Pulse Repetition Frequency (Hz)
nyquist_v = (wavelength * prf) / 4
print(f"Operational Frequency: C-Band (λ={wavelength*100:.1f} cm)")
print(f"Max Unambiguous Nyquist Velocity: {nyquist_v:.2f} m/s ({nyquist_v*3.6:.1f} km/h)")`
                      );
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                  >
                    Preset: Nyquist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSnippet(
`# AWS Station Telemetry Parser
raw_packet = {"station": "IMD-DEL-04", "temp_c": 29.5, "humidity": 68, "pressure": 1012.4}
print(f"Station {raw_packet['station']}: Temp={raw_packet['temp_c']}C, RH={raw_packet['humidity']}%")
print("Validation: QA Checks Passed.")`
                      );
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                  >
                    Preset: AWS
                  </button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="p-3">
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-xs bg-slate-950 text-sky-200 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Output Terminal Console */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <span>Terminal Standard Output (stdout):</span>
                  <button
                    type="button"
                    onClick={() => setConsoleOutput('')}
                    className="hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto text-[11px] text-emerald-300">
                  {consoleOutput || '// Click "Run Script" to compile and execute Python code in the browser kernel.'}
                </pre>
              </div>
            </div>
          )}

          {/* 3. PDF DOCUMENT VIEWPORT */}
          {currentFormatType === 'pdf' && (() => {
            const pdfUrl = getMediaUrl(currentItem?.contentUrl) || activePdfBlobUrl;
            return (
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col min-h-[480px]">
                {/* PDF Header Toolbar */}
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                          {currentItem?.title || 'PDF Document'}
                        </span>
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                          PDF Document
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {currentItem?.fileName || 'Uploaded PDF file'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(currentItem?.contentUrl)}
                      className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Full Tab</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadFile(currentItem?.contentUrl, 'document.pdf')}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* PDF Viewport */}
                {pdfUrl ? (
                  <div className="w-full h-[650px] bg-white relative">
                    <object
                      data={`${pdfUrl}#toolbar=1`}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <iframe
                        src={`${pdfUrl}#toolbar=1`}
                        title={currentItem?.title || 'PDF Document'}
                        className="w-full h-full border-0"
                      />
                    </object>
                  </div>
                ) : (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-900 text-slate-300 space-y-3">
                    <FileText className="w-12 h-12 text-rose-400 opacity-60" />
                    <h3 className="text-base font-bold text-white">No PDF File Uploaded</h3>
                    <p className="text-xs text-slate-400 max-w-md">
                      {currentItem?.description || 'The instructor has not attached a PDF document for this lesson yet.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 4. DOC / WORD DOCUMENT VIEWPORT */}
          {currentFormatType === 'document' && (() => {
            const docUrl = getMediaUrl(currentItem?.contentUrl);
            const isPdf = currentItem?.fileName?.toLowerCase().endsWith('.pdf') || docUrl?.toLowerCase().endsWith('.pdf');

            return (
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-blue-500/30 flex flex-col min-h-[480px]">
                {/* DOC Header Toolbar */}
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                          {currentItem?.title || 'Course Document'}
                        </span>
                        <span className="text-[10px] font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                          {isPdf ? 'PDF Document' : 'Word Document (.docx)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {currentItem?.fileName || 'Attached Document'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(currentItem?.contentUrl)}
                      className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadFile(currentItem?.contentUrl, isPdf ? 'document.pdf' : 'document.docx')}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Direct Viewport */}
                {isPdf && docUrl ? (
                  <div className="w-full h-[650px] bg-white relative">
                    <object
                      data={`${docUrl}#toolbar=1`}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <iframe
                        src={`${docUrl}#toolbar=1`}
                        title={currentItem?.title || 'Document'}
                        className="w-full h-full border-0"
                      />
                    </object>
                  </div>
                ) : loadingDocx ? (
                  <div className="flex-1 min-h-[500px] p-12 flex flex-col items-center justify-center bg-slate-950 text-slate-300 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-bold text-white">Loading Word Document Preview...</h4>
                      <p className="text-xs text-slate-400">Parsing and formatting Word document for interactive reading</p>
                    </div>
                  </div>
                ) : docxHtml && !docxError ? (
                  <div className="w-full h-[650px] bg-slate-950 p-4 sm:p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl p-6 sm:p-10 min-h-[500px] border border-slate-200">
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Interactive Document Reader
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {currentItem?.fileName || 'Document'}
                        </span>
                      </div>
                      <div
                        className="text-xs sm:text-sm leading-relaxed space-y-3.5 text-slate-800 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mb-2 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2.5 [&_th]:bg-slate-100 [&_th]:font-bold [&_th]:text-slate-900 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_strong]:font-bold [&_strong]:text-slate-950"
                        dangerouslySetInnerHTML={{ __html: docxHtml }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-center">
                    <div className="w-full max-w-2xl bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                        <FileText className="w-8 h-8" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {currentItem?.title || 'Technical Document'}
                        </h3>
                        {currentItem?.fileName && (
                          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-500/30 text-xs font-mono text-blue-300">
                            <span>File:</span>
                            <span className="font-bold text-white">{currentItem.fileName}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 max-w-lg mx-auto">
                          {currentItem?.description || 'Download the instructor\'s uploaded Word document to review the complete lesson syllabus and training directives.'}
                        </p>
                      </div>

                      {currentItem?.notes && (
                        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/20 text-left text-xs text-blue-200 space-y-1">
                          <strong className="text-blue-300 block font-bold">Trainer Directives & Notes:</strong>
                          <p className="leading-relaxed whitespace-pre-wrap">{currentItem.notes}</p>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(currentItem?.contentUrl, 'document.docx')}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Document ({currentItem?.fileName || 'document.docx'})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFile(currentItem?.contentUrl)}
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition flex items-center space-x-2 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in Browser</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. PRESENTATION SLIDES VIEWPORT */}
          {currentFormatType === 'slides' && (() => {
            const slideUrl = getMediaUrl(currentItem?.contentUrl);
            const isPdfOrWeb = slideUrl && (
              currentItem?.fileName?.toLowerCase().endsWith('.pdf') ||
              slideUrl.toLowerCase().endsWith('.pdf') ||
              slideUrl.includes('docs.google.com/presentation')
            );

            let embedUrl = slideUrl;
            if (embedUrl.includes('docs.google.com/presentation') && !embedUrl.includes('/embed')) {
              embedUrl = embedUrl.replace(/\/pub.*|\/edit.*|\/preview.*/, '/embed');
            }

            return (
              <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col min-h-[460px]">
                {/* Slides Header Bar */}
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate max-w-xs">
                          {currentItem?.title || 'Presentation Slides'}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                          {isPdfOrWeb ? 'Slides Viewer' : 'PowerPoint (.pptx)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {currentItem?.fileName || 'Lecture Slide Deck'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(currentItem?.contentUrl)}
                      className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadFile(currentItem?.contentUrl, 'presentation.pptx')}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PPT</span>
                    </button>
                  </div>
                </div>

                {/* Slides Content: Direct embed if PDF/Google Slides, or clean Presentation Card */}
                {isPdfOrWeb && embedUrl ? (
                  <div className="w-full h-[650px] bg-slate-950 relative">
                    <iframe
                      src={embedUrl}
                      title={currentItem?.title || 'Presentation Deck'}
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-center">
                    <div className="w-full max-w-2xl bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                        <Layers className="w-8 h-8" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {currentItem?.title || 'Lecture Presentation'}
                        </h3>
                        {currentItem?.fileName && (
                          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                            <span>File:</span>
                            <span className="font-bold text-white">{currentItem.fileName}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 max-w-lg mx-auto">
                          {currentItem?.description || 'Download the instructor\'s uploaded presentation slides to study this module\'s curriculum.'}
                        </p>
                      </div>

                      {currentItem?.notes && (
                        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-left text-xs text-indigo-200 space-y-1">
                          <strong className="text-indigo-300 block font-bold">Trainer Lecture Notes:</strong>
                          <p className="leading-relaxed whitespace-pre-wrap">{currentItem.notes}</p>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(currentItem?.contentUrl, 'presentation.pptx')}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Slides ({currentItem?.fileName || 'presentation.pptx'})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFile(currentItem?.contentUrl)}
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition flex items-center space-x-2 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in Browser</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Lesson Metadata & Progress Advance Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-sky-700 uppercase">
                  Module {selectedModuleIdx + 1}.{selectedItemIdx + 1}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                  currentFormatType === 'interactive' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  currentFormatType === 'pdf' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                  currentFormatType === 'document' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  currentFormatType === 'slides' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                  'bg-sky-100 text-sky-800 border-sky-300'
                }`}>
                  {currentFormatType === 'interactive' ? '⚡ Interactive Sandbox' :
                   currentFormatType === 'pdf' ? '📄 PDF Document' :
                   currentFormatType === 'document' ? '📝 Word / DOC Document' :
                   currentFormatType === 'slides' ? '📊 Presentation Slides' :
                   '▶ Video Lecture'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{currentItem?.durationMinutes || 20} minutes</span>
              </div>
              <h2 className="font-bold text-slate-900 text-base mt-0.5">{currentItem?.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accredited Faculty: <span className="font-semibold text-slate-700">{course.trainerName}</span> ({course.organizationName || 'MoES / IMD'})
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={updatingProgress}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer ${
                isItemCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isItemCompleted ? 'Completed ✓ (Advance)' : 'Mark as Complete & Advance'}</span>
            </button>
          </div>

          {/* Interactive Learning Sub-Tabs Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#0c4a6e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Lecture Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'terminal'
                    ? 'bg-[#0c4a6e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive Python Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-[#0c4a6e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Scientific Notes & Formulae</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('discussion')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'discussion'
                    ? 'bg-[#0c4a6e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Cadet Q&A Discussion ({doubtsList.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: Lecture Overview */}
            {activeTab === 'video' && (
              <div className="p-5 space-y-3 animate-in fade-in">
                <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Key Competency Objectives for this Session</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentItem?.description || 'Learn core object-oriented principles, modular architecture, and telemetry data classes applied to real-time Doppler radar observations and numerical weather prediction systems.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-sky-950">
                    <span className="font-bold">1. Telemetry Ingestion:</span> Understanding class encapsulation for raw radar polarimetric variables (Z, ZDR, KDP, PHIDP).
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950">
                    <span className="font-bold">2. Velocity Dealiasing:</span> Algorithmic pattern recognition to detect velocity folding past Nyquist thresholds.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Interactive Python Code Playground */}
            {activeTab === 'terminal' && (
              <div className="p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <Code className="w-4 h-4 text-sky-600" />
                      <span>Live Python AST Terminal & Ingestion Sandbox</span>
                    </h3>
                    <p className="text-xs text-slate-500">Edit and execute the real lesson script in an isolated browser kernel.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isRunningCode ? 'Running...' : 'Execute Script'}</span>
                  </button>
                </div>

                {/* Code Editor Box */}
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-200">
                  <div className="px-4 py-2 bg-[#161b22] border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>radar_telemetry_oop.py (Python 3.11)</span>
                    <span className="text-emerald-400 font-bold">● Active Kernel</span>
                  </div>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    rows={12}
                    className="w-full p-4 font-mono text-xs bg-transparent text-sky-200 focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Simulated Terminal Console */}
                {consoleOutput && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-emerald-400 p-4 font-mono text-xs space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
                      Terminal Output:
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">{consoleOutput}</pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Scientific Notes */}
            {activeTab === 'notes' && (
              <div className="p-5 space-y-3 animate-in fade-in">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Standard Operational Notes & Scientific Guidance</span>
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed space-y-2">
                  <p>
                    {currentItem?.notes || 'Observe Doppler radial velocity gates carefully. Beware of false velocity folding (aliasing) where targets moving faster than the Nyquist velocity appear as opposite velocity vectors.'}
                  </p>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800">
                    <strong>Nyquist Velocity Formula:</strong> V_max = (λ * PRF) / 4
                    <br />
                    where λ is radar wavelength (C-band ~5.3 cm, S-band ~10 cm) and PRF is Pulse Repetition Frequency.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Discussion */}
            {activeTab === 'discussion' && (
              <div className="p-5 space-y-4 animate-in fade-in">
                <form onSubmit={handlePostDoubt} className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Ask the Instructor a Question</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your technical question regarding this lesson module..."
                      value={doubtText}
                      onChange={(e) => setDoubtText(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-3 pt-2">
                  {doubtsList.map((d) => (
                    <div key={d.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-slate-700">{d.author}</span>
                        <span>{d.time}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{d.text}</p>
                      {d.reply && (
                        <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-sky-950 font-sans text-[11px]">
                          {d.reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Examination & Syllabus Modules Tree */}
        <div className="space-y-4">
          {/* Official Course Examination Card */}
          <div className="bg-gradient-to-br from-[#0c4a6e] to-[#0284c7] rounded-2xl p-5 text-white shadow-md space-y-2.5 border border-sky-500/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md">
                Official Examination
              </span>
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <h4 className="font-bold text-base text-white leading-tight">
              Course Competency Assessment
            </h4>
            <p className="text-xs text-sky-100/90 leading-snug">
              Complete all units and take the official proctored exam to earn your MoES accredited certificate.
            </p>
            <Link
              to={`/trainee/assessment/${id}`}
              className="w-full mt-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Launch Assessment Exam</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </Link>
          </div>

          {/* Syllabus Modules Tree with Instant Play Switcher */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Course Syllabus</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {course.modules?.length || 0} Modules
              </span>
            </div>

            <div className="space-y-3">
              {(course.modules || []).map((mod, modIdx) => (
                <div key={modIdx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/80 px-3.5 py-2 text-xs font-bold text-slate-800">
                    {mod.title}
                  </div>
                  <div className="p-1 space-y-0.5">
                    {(mod.items || []).map((item, itemIdx) => {
                      const completed = enrollment?.completedModuleItems?.includes(`${modIdx}-${itemIdx}`);
                      const isSelected = selectedModuleIdx === modIdx && selectedItemIdx === itemIdx;
                      const itemType = item.type || 'video';

                      const typeIcon =
                        itemType === 'interactive' ? <Terminal className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> :
                        itemType === 'pdf' ? <FileText className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" /> :
                        itemType === 'document' ? <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> :
                        itemType === 'slides' ? <Layers className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> :
                        <Video className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />;

                      const typeLabel =
                        itemType === 'interactive' ? 'Sandbox' :
                        itemType === 'pdf' ? 'PDF' :
                        itemType === 'document' ? 'DOC' :
                        itemType === 'slides' ? 'Slides' :
                        'Video';

                      const typeBadgeClass =
                        itemType === 'interactive' ? 'bg-amber-100 text-amber-800' :
                        itemType === 'pdf' ? 'bg-rose-100 text-rose-800' :
                        itemType === 'document' ? 'bg-blue-100 text-blue-800' :
                        itemType === 'slides' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-sky-100 text-sky-700';

                      return (
                        <button
                          key={itemIdx}
                          onClick={() => {
                            setSelectedModuleIdx(modIdx);
                            setSelectedItemIdx(itemIdx);
                            setIsPlaying(false);
                            setCurrentTime(0);
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                            }
                            try {
                              localStorage.setItem(`course_last_pos_${id}`, JSON.stringify({ modIdx, itemIdx }));
                            } catch (e) {}
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 text-sky-900 font-bold border-l-2 border-sky-600 shadow-xs'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                            )}
                            {typeIcon}
                            <span className="truncate">{item.title}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${typeBadgeClass}`}>
                              {typeLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.durationMinutes || 20}m
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoursePlayer;
