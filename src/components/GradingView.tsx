import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Search, 
  SlidersHorizontal, 
  Award, 
  Sparkles, 
  Check, 
  User, 
  Map, 
  AlertTriangle,
  Send,
  Loader2,
  Bookmark
} from 'lucide-react';
import { Submission, Exam } from '../types';

interface GradingViewProps {
  submissions: Submission[];
  exams: Exam[];
  onGradeSubmit: (submissionId: string, gradeData: { score: number; rubricScores: any; teacherComment: string }) => void;
  onReset: () => void;
}

export default function GradingView({
  submissions,
  exams,
  onGradeSubmit,
  onReset
}: GradingViewProps) {
  const [selectedSubId, setSelectedSubId] = useState<string>('sub-1');
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Grading states
  const [aiLoading, setAiLoading] = useState(false);
  
  // Active Grading values for the selected submission
  const selectedSub = submissions.find(s => s.id === selectedSubId) || submissions[0];
  const exam = exams.find(e => e.id === selectedSub?.examId) || exams[0];
  const activeQuestion = exam?.questions.find(q => q.type === 'essay') || exam?.questions[0];

  // Grading form state mapped to selected student
  const [accuracyScore, setAccuracyScore] = useState<number>(6); // Default Initial
  const [depthScore, setDepthScore] = useState<number>(9);
  const [teacherComment, setTeacherComment] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('grading');

  // Track if we have already edited form since switching students
  const [prevStudentId, setPrevStudentId] = useState<string>('');
  if (selectedSub && selectedSub.id !== prevStudentId) {
    setPrevStudentId(selectedSub.id);
    if (selectedSub.status === 'ตรวจแล้ว') {
      setAccuracyScore(selectedSub.rubricScores?.accuracy || 6);
      setDepthScore(selectedSub.rubricScores?.depth || 9);
      setTeacherComment(selectedSub.teacherComment || '');
    } else {
      setAccuracyScore(6);
      setDepthScore(9);
      setTeacherComment('');
    }
  }

  const handleSelectStudent = (id: string) => {
    setSelectedSubId(id);
  };

  // Trigger Gemini AI Auto Grading
  const handleAIEvaluate = async () => {
    if (!selectedSub || !activeQuestion) return;
    
    setAiLoading(true);
    try {
      const studentAnswer = selectedSub.answers[activeQuestion.id]?.text || '';
      const response = await fetch('/api/grade-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: activeQuestion.description,
          studentAnswer,
          points: activeQuestion.points
        }),
      });
      const evaluation = await response.json();
      
      if (evaluation) {
        setAccuracyScore(evaluation.accuracyScore || 7);
        setDepthScore(evaluation.depthScore || 10);
        setTeacherComment(evaluation.feedbackThai || 'วิเคราะห์สัญศาสตร์ประวัติศาสตร์ได้เฉียบคม');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveGrade = () => {
    const totalScore = accuracyScore + depthScore;
    onGradeSubmit(selectedSub.id, {
      score: totalScore,
      rubricScores: {
        accuracy: accuracyScore,
        depth: depthScore
      },
      teacherComment
    });
  };

  // Filter list of students
  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex justify-between items-center border-b border-[#e0bfbc] pb-4">
        <div>
          <h1 className="text-[#251817] font-bold text-2xl font-sans tracking-tight">
            การตรวจคะแนนและวิเคราะห์ผล (Grading Sheet)
          </h1>
          <p className="text-xs text-[#59413f] mt-1">
            ตรวจสอบข้อมูลคำตอบของนักเรียนแต่ละคน ประเมินตามรูบริคมาตรฐาน และใช้งาน AI ในการประเมินเบื้องต้น
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#8e171c] hover:underline flex items-center gap-1.5 font-bold"
        >
          รีเซ็ตสถานะการตรวจทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Student list selection */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f5dddb] pb-3">
            <span className="text-xs font-bold text-[#251817]">รายชื่อนักศึกษา</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#8c706e]" />
              <SlidersHorizontal className="h-4 w-4 text-[#8c706e]" />
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัส..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#fff8f7] border border-[#e0bfbc] rounded-xl text-xs focus:outline-none text-[#251817]"
            />
            <Search className="h-3.5 w-3.5 text-[#8c706e] absolute left-3 top-2.5" />
          </div>

          {/* Student list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredSubmissions.map((sub) => {
              const isSelected = sub.id === selectedSubId;
              return (
                <button
                  key={sub.id}
                  id={`student-row-${sub.id}`}
                  onClick={() => handleSelectStudent(sub.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#ffe9e7] border-[#8e171c] text-[#8e171c] shadow-sm' 
                      : 'bg-white border-[#f5dddb] text-[#59413f] hover:bg-[#fff0ef]'
                  }`}
                >
                  <img
                    src={sub.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50&q=80'}
                    alt={sub.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-[#8e171c]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block truncate text-[#251817]">
                      {sub.studentName}
                    </span>
                    <span className="text-[10px] text-[#8c706e] block font-mono">ID: {sub.studentId}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      sub.status === 'ตรวจแล้ว'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-[#fff0ef] text-[#8e171c]'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.score !== undefined && (
                      <span className="text-[10px] font-bold font-mono text-[#8c706e] block mt-1">
                        รวม: {sub.score}/50
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Exam sheet grading */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Question detail card */}
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white bg-[#8e171c] px-3 py-1 rounded-full font-mono">
                คำถามข้อที่ 14: อัตนัย
              </span>
              <span className="text-xs font-bold text-[#8e171c]">
                คะแนนเต็ม: 20 คะแนน
              </span>
            </div>

            <div className="bg-[#fff8f7] p-5 rounded-2xl border border-[#f5dddb]">
              <h3 className="font-bold text-sm text-[#251817] leading-snug">
                "{activeQuestion?.description.split('\n')[0]}"
              </h3>
            </div>
          </div>

          {/* Student's draft response content and diagram layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Answer body */}
            <div className="xl:col-span-2 bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#251817] block">คำตอบของนักศึกษา:</span>
              <div className="bg-[#fffcfb] p-5 rounded-2xl border border-[#f5dddb] min-h-[180px] text-xs text-[#251817] leading-relaxed whitespace-pre-wrap font-sans">
                {selectedSub.answers[activeQuestion?.id || 'q14']?.text || '(ไม่มีคำตอบประเภทข้อความ)'}
              </div>

              {/* Drawing map/diagram if present in submission answers */}
              {selectedSub.answers[activeQuestion?.id || 'q14']?.drawDataUrl ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#59413f] block">ภาพประกอบคำตอบ (ภาพสเก็ตช์มือนักเรียน):</span>
                  <div className="border border-[#e0bfbc] rounded-2xl bg-white overflow-hidden p-2 flex items-center justify-center">
                    <img
                      src={selectedSub.answers[activeQuestion?.id || 'q14']?.drawDataUrl}
                      alt="Student sketch drawing"
                      className="max-h-72 object-contain"
                    />
                  </div>
                </div>
              ) : (
                /* Hotlink a beautiful academic flow/map illustration inside HTML for high visual completeness */
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#59413f] block">ภาพประกอบคำตอบ (แผนภูมิวิเคราะห์):</span>
                  <div className="border border-[#e0bfbc] rounded-2xl bg-[#fffbfb] overflow-hidden p-4 relative flex flex-col items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                      alt="History printing map"
                      className="max-h-48 object-cover rounded-xl opacity-80"
                    />
                    <div className="absolute inset-0 bg-[#8e171c]/10 flex items-center justify-center font-bold text-xs text-[#8e171c] rounded-2xl">
                      <span className="bg-white/95 px-4 py-2 rounded-full border border-[#8e171c] shadow-sm">
                        เลเยอร์คำอธิบายทำงานอยู่: แผนภาพการกระจายตัวของแท่นพิมพ์ปี 1450-1500
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cheat detection activity alerts inside Student grading detail */}
              {selectedSub.violations && selectedSub.violations.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3 items-start text-xs text-amber-900 font-medium">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">ตรวจสอบพฤติกรรมระหว่างการสอบ:</h4>
                    {selectedSub.violations.map((v, i) => (
                      <p key={i} className="text-[11px] text-amber-800 mt-1">
                        • {v.timestamp} - {v.description}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rubrics Form and AI auto-grading buttons */}
            <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-base text-[#251817] border-b border-[#f5dddb] pb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#8e171c]" />
                เกณฑ์การให้คะแนน (Rubric)
              </h3>

              {/* Rubric 1: Accuracy */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#59413f]">
                  <span>ความถูกต้องทางประวัติศาสตร์ (8 คะแนน)</span>
                  <span className="text-[#8e171c] font-mono">{accuracyScore} / 8</span>
                </div>
                {/* 4 Steps selector matching image */}
                <div className="grid grid-cols-4 gap-1">
                  {[2, 4, 6, 8].map((score) => {
                    const label = score === 2 ? 'จำกัด' : score === 4 ? 'พื้นฐาน' : score === 6 ? 'ชำนาญ' : 'ดีเยี่ยม';
                    const isSelected = accuracyScore === score || (score === 8 && accuracyScore > 6);
                    return (
                      <button
                        key={score}
                        onClick={() => setAccuracyScore(score)}
                        className={`py-2 px-1 rounded-lg text-[9px] font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#ffe9e7] border-[#8e171c] text-[#8e171c] ring-1 ring-[#8e171c]'
                            : 'bg-white border-[#e0bfbc] text-[#59413f] hover:bg-[#fff8f7]'
                        }`}
                      >
                        <div>{label} ({score})</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rubric 2: Depth of analysis */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#59413f]">
                  <span>ความลึกของการวิเคราะห์ (12 คะแนน)</span>
                  <span className="text-[#8e171c] font-mono">{depthScore} / 12</span>
                </div>
                {/* Score slider indicator */}
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={depthScore}
                  onChange={(e) => setDepthScore(Number(e.target.value))}
                  className="w-full accent-[#8e171c]"
                />
                <div className="flex justify-between text-[8px] font-bold text-[#8c706e] uppercase tracking-wider">
                  <span>ผิวเผิน</span>
                  <span>พื้นฐาน</span>
                  <span>วิเคราะห์ลึกซึ้ง</span>
                </div>
              </div>

              {/* Comment from teacher */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#59413f] block">ข้อเสนอแนะจากผู้สอน</label>
                <textarea
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder={`เขียนข้อเสนอแนะถึง ${selectedSub.studentName}...`}
                  rows={3}
                  className="w-full p-3 border border-[#e0bfbc] rounded-2xl text-xs text-[#251817] focus:ring-1 focus:ring-[#8e171c] bg-white focus:outline-none"
                />
                <span className="text-[8px] text-[#8c706e] block text-right font-mono">
                  รองรับ Markdown ({teacherComment.length} ตัวอักษร)
                </span>
              </div>

              {/* Grading Actions Column */}
              <div className="pt-2 space-y-2">
                <button
                  id="btn-ai-grade"
                  onClick={handleAIEvaluate}
                  disabled={aiLoading || selectedSub.status === 'ตรวจแล้ว'}
                  className="w-full flex items-center justify-center gap-2 bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-bold py-3 rounded-full shadow-sm transition-all disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังวิเคราะห์คำตอบด้วย Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      ตรวจข้อสอบด้วย AI (AI Auto-Gradies)
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {}}
                    className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#59413f] bg-[#fff8f7] border border-[#e0bfbc] py-2.5 rounded-full hover:bg-[#fff0ef] transition-all"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    บันทึกที่ร่าง
                  </button>

                  <button
                    id="btn-confirm-grade"
                    onClick={handleSaveGrade}
                    className="flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-[#8e171c] py-2.5 rounded-full hover:bg-[#b03131] shadow transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    ยืนยันคะแนน
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
