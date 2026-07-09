import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  AlertTriangle, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  ShieldAlert,
  Edit,
  Palette,
  Flag
} from 'lucide-react';
import { Exam, Question, QuestionType, Submission } from '../types';

interface StudentExamViewProps {
  exam: Exam;
  onSubmit: (answers: Record<string, { text?: string; drawDataUrl?: string }>, violations: any[]) => void;
  onCancel: () => void;
}

export default function StudentExamView({ exam, onSubmit, onCancel }: StudentExamViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { text: string; drawDataUrl?: string }>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(exam.durationMinutes * 60);
  const [violations, setViolations] = useState<{ type: string; timestamp: string; description: string }[]>([]);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Camera feed states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Drawing Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#8e171c'); // Default Academic Crimson
  const [brushWidth, setBrushWidth] = useState(3);

  const currentQuestion = exam.questions[currentQuestionIndex];

  // 1. Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on time out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 2. Webcam connection for proctoring
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.log('Error playing stream:', err));
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('Webcam permission denied or unavailable:', err);
        setCameraError(true);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 3. Cheat detection: Page Focus / Window switching
  useEffect(() => {
    const handleBlur = () => {
      const now = new Date().toLocaleTimeString('th-TH');
      const newViolation = {
        type: 'window_switch',
        timestamp: now,
        description: 'ตรวจพบการสลับแท็บบราวเซอร์หรือย่อหน้าต่างออก',
      };
      setViolations((prev) => [...prev, newViolation]);
      setWarningMessage('ตรวจพบการสลับหน้าจอหรือย่อหน้าต่าง บันทึกรายงานส่งผู้คุมสอบทันที!');
      setShowViolationWarning(true);
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 4. Initialize or restore canvas when current question changes or canvas element mounts
  useEffect(() => {
    if (currentQuestion && currentQuestion.responseType === 'both' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear and draw grid background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw elegant grid dots
        ctx.fillStyle = '#edd5d2';
        for (let x = 10; x < canvas.width; x += 20) {
          for (let y = 10; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
          }
        }

        // Restore saved sketch if available
        const savedDataUrl = answers[currentQuestion.id]?.drawDataUrl;
        if (savedDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = savedDataUrl;
        }
      }
    }
  }, [currentQuestionIndex, currentQuestion?.id]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Re-draw background grid dots
    ctx.fillStyle = '#edd5d2';
    for (let x = 10; x < canvas.width; x += 20) {
      for (let y = 10; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    saveCanvasState();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        text: prev[currentQuestion.id]?.text || '',
        drawDataUrl: dataUrl,
      },
    }));
  };

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        text,
      },
    }));
  };

  const selectOption = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        text: option,
      },
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers, violations);
  };

  return (
    <div className="min-h-screen bg-[#fff8f7] pb-12">
      {/* Header Bar */}
      <div className="bg-white border-b border-[#e0bfbc] sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#fff0ef] rounded-full border border-[#e0bfbc]">
            <span className="text-xs font-semibold text-[#8e171c] font-mono">
              {exam.courseCode}
            </span>
          </div>
          <h1 className="font-bold text-lg text-[#251817] font-sans">
            {exam.title}
          </h1>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#ffe9e7] px-4 py-2 rounded-full border border-[#ffd0cc]">
            <span className="text-xs text-[#59413f] font-medium">เวลาที่เหลือ:</span>
            <span className={`text-sm font-bold font-mono ${timeRemaining < 300 ? 'text-[#8e171c] animate-pulse' : 'text-[#8e171c]'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <button
            id="btn-student-submit"
            onClick={handleSubmit}
            className="bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-semibold py-2.5 px-6 rounded-full shadow-md transition-all"
          >
            ส่งข้อสอบ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Navigation Grid + Camera Monitor */}
        <div className="space-y-6">
          {/* 1. Camera Proctoring Simulated Monitor */}
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-4 flex flex-col items-center shadow-sm">
            <span className="text-xs font-bold text-[#8e171c] self-start mb-2 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              กล้องตรวจจับพฤติกรรม (AI Live)
            </span>

            {/* Webcam video window */}
            <div className="relative w-full aspect-video rounded-2xl bg-zinc-900 overflow-hidden border border-[#edd5d2]">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  muted
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse">
                    <Camera className="h-5 w-5 text-zinc-500" />
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {cameraError ? 'กรุณาอนุญาตการเข้าถึงกล้องถ่ายภาพ' : 'กำลังเริ่มเชื่อมต่อกล้อง...'}
                  </span>
                </div>
              )}

              {/* AI Proctor scanning indicator lines */}
              <div className="absolute inset-4 border border-[#8e171c]/30 rounded pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-t-2 border-l-2 border-[#8e171c]" />
                  <div className="w-3 h-3 border-t-2 border-r-2 border-[#8e171c]" />
                </div>
                {/* Center scan line */}
                <div className="w-full h-[1px] bg-[#8e171c]/50 shadow-sm animate-bounce" />
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-b-2 border-l-2 border-[#8e171c]" />
                  <div className="w-3 h-3 border-b-2 border-r-2 border-[#8e171c]" />
                </div>
              </div>

              {/* AI Face tag */}
              <div className="absolute bottom-2 left-2 bg-[#8e171c]/80 text-white text-[8px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                AI PROCTOR: SECURED
              </div>
            </div>
            
            <div className="mt-3 text-[10px] text-[#59413f] text-center bg-[#fff0ef] py-1.5 px-3 rounded-xl border border-[#ffd0cc] w-full">
              {violations.length > 0 ? (
                <span className="text-[#8e171c] font-semibold flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  พบประวัตินอกกฎ {violations.length} ครั้ง (บันทึกเข้าระบบ)
                </span>
              ) : (
                <span>"ห้ามปิดแท็บบราวเซอร์หรือสลับหน้าต่างระหว่างทำการทดสอบ"</span>
              )}
            </div>
          </div>

          {/* 2. Questions Navigation Grid */}
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-[#251817]">รายการข้อสอบ</span>
              <span className="text-xs font-mono text-[#8c706e]">
                {currentQuestionIndex + 1} จาก {exam.questions.length}
              </span>
            </div>

            {/* Grid list of circular buttons */}
            <div className="grid grid-cols-5 gap-2.5">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!answers[q.id]?.text || !!answers[q.id]?.drawDataUrl;
                const isFlagged = flaggedQuestions[q.id];

                let btnStyles = 'bg-[#fff0ef] text-[#59413f] border border-[#e0bfbc] hover:bg-[#ffe9e7]';
                
                if (isAnswered) {
                  btnStyles = 'bg-[#8e171c] text-white border border-[#8e171c] hover:bg-[#b03131]';
                }
                if (isFlagged) {
                  btnStyles = 'bg-amber-400 text-amber-950 border border-amber-500 hover:bg-amber-300';
                }
                if (isCurrent) {
                  btnStyles += ' ring-2 ring-offset-2 ring-[#8e171c]';
                }

                return (
                  <button
                    key={q.id}
                    id={`nav-q-${idx}`}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-150 ${btnStyles}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend indicators */}
            <div className="mt-5 pt-4 border-t border-[#f5dddb] space-y-2 text-[10px] text-[#59413f]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#8e171c] rounded-full" />
                <span>ตอบแล้ว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#fff0ef] border border-[#e0bfbc] rounded-full" />
                <span>ยังไม่ได้ทำ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
                <span>ติดธงไว้ (ทบทวน)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Active Question Canvas and Editors */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. Violation Warning Overlay modal */}
          {showViolationWarning && (
            <div className="bg-[#fff0ef] border-2 border-[#8e171c] rounded-3xl p-5 shadow-md flex items-start gap-4 animate-bounce">
              <ShieldAlert className="h-8 w-8 text-[#8e171c] shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#8e171c] text-sm">การแจ้งเตือนพฤติกรรมทุจริต</h3>
                <p className="text-xs text-[#59413f] mt-1">{warningMessage}</p>
              </div>
              <button
                onClick={() => setShowViolationWarning(false)}
                className="text-xs font-bold text-[#8e171c] hover:underline"
              >
                รับทราบ
              </button>
            </div>
          )}

          {/* 2. Main Question Card */}
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-6">
            
            {/* Question title and point header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] bg-red-100 text-[#8e171c] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  ข้อที่ {currentQuestionIndex + 1}: {currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'ปรนัย' : 'อัตนัย'}
                </span>
                <h2 className="font-bold text-lg text-[#251817] mt-2 font-sans leading-snug">
                  {currentQuestion.title}
                </h2>
              </div>
              <div className="bg-[#fff0ef] px-4 py-2 rounded-2xl border border-[#ffd0cc] text-center min-w-[80px]">
                <span className="text-xs text-[#59413f] block">คะแนนเต็ม</span>
                <span className="text-sm font-bold text-[#8e171c] font-mono">{currentQuestion.points} คะแนน</span>
              </div>
            </div>

            {/* Question Description text block */}
            <div className="bg-[#fff8f7] p-5 rounded-2xl border border-[#f5dddb]">
              <p className="text-xs text-[#251817] leading-relaxed whitespace-pre-wrap font-sans">
                {currentQuestion.description}
              </p>
            </div>

            {/* Question attachment photo if present */}
            {currentQuestion.imageUrl && (
              <div className="w-full max-h-72 rounded-2xl overflow-hidden border border-[#e0bfbc] bg-zinc-50 flex items-center justify-center">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question Attachment"
                  className="max-w-full max-h-72 object-contain"
                />
              </div>
            )}

            {/* Answer Interaction Area */}
            <div className="space-y-4 pt-4 border-t border-[#f5dddb]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#251817] flex items-center gap-1.5">
                  <Edit className="h-4 w-4 text-[#8e171c]" />
                  ระบุคำตอบของคุณด้านล่าง
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                    flaggedQuestions[currentQuestion.id]
                      ? 'bg-amber-400 text-amber-950 border-amber-500'
                      : 'border-[#e0bfbc] text-[#59413f] hover:bg-[#fff0ef]'
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
                  {flaggedQuestions[currentQuestion.id] ? 'เลิกปักธงข้อสอบ' : 'ปักธงทบทวนข้อนี้'}
                </button>
              </div>

              {/* A. MULTIPLE CHOICE */}
              {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = answers[currentQuestion.id]?.text === opt;
                    return (
                      <button
                        key={i}
                        id={`opt-btn-${i}`}
                        onClick={() => selectOption(opt)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-xs font-medium ${
                          isSelected
                            ? 'bg-[#ffe9e7] border-[#8e171c] text-[#8e171c] ring-1 ring-[#8e171c]'
                            : 'bg-white border-[#e0bfbc] text-[#251817] hover:bg-[#fff8f7]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && (
                          <div className="w-5 h-5 bg-[#8e171c] rounded-full flex items-center justify-center text-white shrink-0">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* B. ESSAY TEXT ENTRY */}
              {(currentQuestion.type === QuestionType.ESSAY) && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      id="essay-text-area"
                      value={answers[currentQuestion.id]?.text || ''}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="พิมพ์คำตอบภาษาไทยหรืออังกฤษของคุณที่นี่..."
                      rows={8}
                      maxLength={currentQuestion.wordLimit || 2000}
                      className="w-full p-4 rounded-2xl border border-[#e0bfbc] text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8e171c] focus:border-[#8e171c] bg-white text-[#251817]"
                    />
                    <div className="absolute bottom-3 right-4 text-[10px] text-[#8c706e] font-mono">
                      จำนวนอักขระ: {(answers[currentQuestion.id]?.text || '').length} / {currentQuestion.wordLimit || 2000}
                    </div>
                  </div>

                  {/* C. OPTIONAL OR REQUIRED SKETCHPAD (responseType: 'both') */}
                  {currentQuestion.responseType === 'both' && (
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-[#59413f] flex items-center gap-1.5 pt-2">
                        <Palette className="h-4 w-4 text-[#8e171c]" />
                        กระดานวาดเขียนอิสระ (สำหรับร่างรูปแผนภาพอธิบาย)
                      </span>
                      
                      <div className="border border-[#e0bfbc] rounded-2xl overflow-hidden bg-[#fff8f7]">
                        {/* Canvas tools panel */}
                        <div className="bg-white border-b border-[#e0bfbc] p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-medium text-[#59413f]">เลือกสีปากกา:</span>
                            <div className="flex items-center gap-1.5">
                              {['#8e171c', '#251817', '#2563eb', '#16a34a'].map((col) => (
                                <button
                                  key={col}
                                  onClick={() => setBrushColor(col)}
                                  className={`w-5 h-5 rounded-full border transition-all ${
                                    brushColor === col ? 'ring-2 ring-offset-1 ring-[#8e171c]' : ''
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-medium text-[#59413f]">ขนาด:</span>
                              <input
                                type="range"
                                min="1"
                                max="8"
                                value={brushWidth}
                                onChange={(e) => setBrushWidth(Number(e.target.value))}
                                className="w-16 accent-[#8e171c]"
                              />
                            </div>

                            <button
                              onClick={clearCanvas}
                              className="text-[10px] font-bold text-[#8e171c] hover:underline flex items-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              ล้างพื้นที่วาด
                            </button>
                          </div>
                        </div>

                        {/* Drawing area */}
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={280}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full bg-white cursor-crosshair block"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-[#f5dddb]">
              <button
                id="btn-student-prev"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-1 text-xs font-semibold px-5 py-2.5 rounded-full border ${
                  currentQuestionIndex === 0
                    ? 'text-zinc-300 border-zinc-200 cursor-not-allowed'
                    : 'text-[#59413f] border-[#e0bfbc] hover:bg-[#fff0ef]'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                ข้อก่อนหน้า
              </button>

              <button
                id="btn-student-next"
                onClick={handleNext}
                disabled={currentQuestionIndex === exam.questions.length - 1}
                className={`flex items-center gap-1 text-xs font-semibold px-5 py-2.5 rounded-full border ${
                  currentQuestionIndex === exam.questions.length - 1
                    ? 'text-zinc-300 border-zinc-200 cursor-not-allowed'
                    : 'text-white bg-[#8e171c] border-[#8e171c] hover:bg-[#b03131]'
                }`}
              >
                ข้อถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
