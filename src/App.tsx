import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Clock, 
  ArrowRight, 
  GraduationCap, 
  Trash2, 
  Eye, 
  Award, 
  CheckCircle,
  HelpCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import TeacherDashboard from './components/TeacherDashboard';
import TestBuilder from './components/TestBuilder';
import GradingView from './components/GradingView';
import SettingsView from './components/SettingsView';
import StudentExamView from './components/StudentExamView';
import { Exam, Submission, SystemSettings, ActivityLog } from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'teacher' | 'student'>('teacher');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Data State fetched from server APIs
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Simulation State
  const [activeTakingExam, setActiveTakingExam] = useState<Exam | null>(null);
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);

  // Fetch Data from Backend Express APIs
  const fetchData = async () => {
    try {
      const [resExams, resSubmissions, resSettings, resLogs] = await Promise.all([
        fetch('/api/exams'),
        fetch('/api/submissions'),
        fetch('/api/settings'),
        fetch('/api/logs')
      ]);

      if (resExams.ok) setExams(await resExams.json());
      if (resSubmissions.ok) setSubmissions(await resSubmissions.json());
      if (resSettings.ok) setSettings(await resSettings.json());
      if (resLogs.ok) setLogs(await resLogs.json());
    } catch (err) {
      console.error('Failed to connect to full-stack API server:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Settings handler
  const handleSaveSettings = async (newSettings: SystemSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        setSettings(newSettings);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create/Publish Exam handler
  const handleSaveExam = async (exam: Exam) => {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exam),
      });
      if (res.ok) {
        setCurrentTab('exams');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Exam handler
  const handleDeleteExam = async (id: string) => {
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit student exam handler
  const handleStudentExamSubmit = async (
    answers: Record<string, { text?: string; drawDataUrl?: string }>,
    violations: any[]
  ) => {
    if (!activeTakingExam) return;

    const payload = {
      examId: activeTakingExam.id,
      studentName: 'Julianna Mercer',
      studentId: '44921',
      answers,
      violations,
      status: 'รอดำเนินการ',
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActiveTakingExam(null);
        setShowSubmissionSuccess(true);
        setCurrentRole('teacher'); // Auto toggle back to teacher to view the submitted result
        setCurrentTab('grading');
        fetchData();
        setTimeout(() => setShowSubmissionSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit manual Grade evaluation
  const handleGradeSubmit = async (
    submissionId: string,
    gradeData: { score: number; rubricScores: any; teacherComment: string }
  ) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset database state (helpful for demonstrating again)
  const handleResetGrading = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch tabs/views
  const handleRoleChange = (role: 'teacher' | 'student') => {
    setCurrentRole(role);
    if (role === 'student') {
      setCurrentTab('student-lobby');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Render correct components based on active settings and tabs
  return (
    <div className="flex bg-[#fff8f7] min-h-screen text-[#251817] antialiased">
      
      {/* Dynamic Student Exam Mode overrides entire view */}
      {activeTakingExam ? (
        <div className="w-full">
          <StudentExamView
            exam={activeTakingExam}
            onSubmit={handleStudentExamSubmit}
            onCancel={() => setActiveTakingExam(null)}
          />
        </div>
      ) : (
        /* Normal layout frame with Sidebar */
        <>
          <Sidebar
            currentRole={currentRole}
            currentTab={currentTab}
            onRoleChange={handleRoleChange}
            onTabChange={setCurrentTab}
            onOpenCreateExam={() => setCurrentTab('create-exam')}
            gDriveConnected={settings?.gDriveConnected || false}
          />

          {/* Main workspace scrollable container */}
          <div className="flex-1 pl-64 min-h-screen flex flex-col">
            
            {/* Submission Successful notification banner */}
            {showSubmissionSuccess && (
              <div className="bg-emerald-50 border-b border-emerald-300 px-8 py-3.5 flex items-center justify-between text-emerald-800 text-xs font-semibold animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>ส่งแบบทดสอบเรียบร้อยแล้ว! รายการคำตอบของคุณถูกส่งเข้าสู่เซสชันการให้คะแนนของสถาบันเรียบร้อย</span>
                </div>
              </div>
            )}

            {/* Render Tab Views */}
            <main className="p-8 flex-1 max-w-7xl w-full mx-auto">
              {currentRole === 'teacher' ? (
                <>
                  {currentTab === 'dashboard' && (
                    <TeacherDashboard
                      exams={exams}
                      logs={logs}
                      onStartExam={(id) => {
                        const target = exams.find(e => e.id === id);
                        if (target) setActiveTakingExam(target);
                      }}
                      onOpenCreateExam={() => setCurrentTab('create-exam')}
                    />
                  )}

                  {currentTab === 'exams' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-[#e0bfbc] pb-4">
                        <div>
                          <h1 className="text-2xl font-bold font-sans text-[#251817]">คลังข้อสอบและวิชาเรียน (Exams List)</h1>
                          <p className="text-xs text-[#59413f] mt-1">คลังคำถามและข้อสอบวัดระดับทั้งหมดเพื่อใช้ในการประเมิน</p>
                        </div>
                        <button
                          id="btn-add-exam-tab"
                          onClick={() => setCurrentTab('create-exam')}
                          className="bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-semibold py-2.5 px-6 rounded-full shadow"
                        >
                          สร้างแบบทดสอบใหม่
                        </button>
                      </div>

                      {/* Exams list cards layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exams.map((item) => (
                          <div key={item.id} className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] bg-[#fff0ef] border border-[#ffd0cc] px-3 py-0.5 rounded-full font-bold text-[#8e171c] font-mono">
                                  {item.courseCode}
                                </span>
                                <span className="text-xs text-[#8c706e] font-medium">{item.gradeLevel}</span>
                              </div>
                              <h3 className="font-bold text-base text-[#251817] leading-tight pt-1">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-[#59413f]">
                                กำหนดเวลา: {item.durationMinutes} นาที • สร้างโดย: {item.author}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#f5dddb] pt-4 mt-2">
                              <div className="text-[10px] text-[#59413f] font-mono">
                                {item.questions.length} คำถามที่จัดเตรียมไว้
                              </div>
                              <div className="flex gap-2">
                                <button
                                  id={`btn-simulate-exam-${item.id}`}
                                  onClick={() => setActiveTakingExam(item)}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8e171c] bg-[#fff0ef] border border-[#e0bfbc] py-1.5 px-4 rounded-full hover:bg-[#ffe9e7]"
                                >
                                  <Eye className="h-4 w-4" />
                                  จำลองการทำข้อสอบ
                                </button>
                                <button
                                  onClick={() => handleDeleteExam(item.id)}
                                  className="p-2 border border-[#e0bfbc] rounded-full text-[#8c706e] hover:text-[#8e171c] hover:bg-[#fff0ef]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTab === 'grading' && (
                    <GradingView
                      submissions={submissions}
                      exams={exams}
                      onGradeSubmit={handleGradeSubmit}
                      onReset={handleResetGrading}
                    />
                  )}

                  {currentTab === 'settings' && settings && (
                    <SettingsView
                      settings={settings}
                      onSave={handleSaveSettings}
                    />
                  )}

                  {currentTab === 'create-exam' && (
                    <TestBuilder
                      onSave={handleSaveExam}
                      onCancel={() => setCurrentTab('dashboard')}
                    />
                  )}
                </>
              ) : (
                /* Student tab mode (Exam Portal) */
                <div className="space-y-6">
                  <div className="border-b border-[#e0bfbc] pb-4">
                    <h1 className="text-2xl font-bold font-sans text-[#251817] flex items-center gap-2">
                      <Compass className="h-6 w-6 text-[#8e171c]" />
                      วิชาสอบที่สามารถเข้าถึงได้ (Active Exams)
                    </h1>
                    <p className="text-xs text-[#59413f] mt-1">
                      ยินดีต้อนรับสู่ระบบห้องสอบความปลอดภัยระดับสูงของสถาบัน โปรดเลือกหัวข้อวิชาสอบเพื่อเข้าร่วมทำข้อสอบ
                    </p>
                  </div>

                  {/* Student lobby exam selection grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    {exams.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] bg-[#fff0ef] border border-[#ffd0cc] px-3 py-1 rounded-full font-bold text-[#8e171c] font-mono">
                            {item.courseCode}
                          </span>
                          <h3 className="font-bold text-base text-[#251817] leading-snug pt-1">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-[#59413f] font-medium pt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-[#8e171c]" />
                              {item.durationMinutes} นาที
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-[#8e171c]" />
                              {item.questions.length} ข้อสอบ
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#f5dddb] flex justify-end">
                          <button
                            id={`btn-student-start-${item.id}`}
                            onClick={() => setActiveTakingExam(item)}
                            className="flex items-center gap-1.5 bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-semibold py-2 px-5 rounded-full shadow-sm transition-all"
                          >
                            เริ่มทำข้อสอบ
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      )}

    </div>
  );
}
