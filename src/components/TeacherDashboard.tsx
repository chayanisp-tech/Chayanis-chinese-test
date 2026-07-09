import React, { useState } from 'react';
import { 
  BarChart2, 
  Users, 
  BookOpen, 
  HardDrive, 
  RefreshCw, 
  Plus, 
  ArrowUpRight, 
  UserCheck, 
  Settings,
  History,
  FileCheck
} from 'lucide-react';
import { Exam, ActivityLog } from '../types';

interface TeacherDashboardProps {
  exams: Exam[];
  logs: ActivityLog[];
  onStartExam: (examId: string) => void;
  onOpenCreateExam: () => void;
}

export default function TeacherDashboard({
  exams,
  logs,
  onStartExam,
  onOpenCreateExam
}: TeacherDashboardProps) {
  const [syncingGDrive, setSyncingGDrive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 นาทีที่แล้ว');

  const handleGDriveSync = () => {
    setSyncingGDrive(true);
    setTimeout(() => {
      setSyncingGDrive(false);
      setLastSyncTime('เพิ่งประสานข้อมูลเสร็จสิ้น');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#251817] font-bold text-2xl tracking-tight font-sans">
            แดชบอร์ดภาพรวม (Dashboard)
          </h1>
          <p className="text-xs text-[#59413f] mt-1">
            ยินดีต้อนรับกลับ ผู้ดูแลระบบ นี่คือความเคลื่อนไหวและการควบคุมการซื่อสัตย์ในการทดสอบในวันนี้
          </p>
        </div>
        <button
          id="btn-dash-create-exam"
          onClick={onOpenCreateExam}
          className="flex items-center gap-2 bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-semibold py-2.5 px-6 rounded-full shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          สร้างแบบทดสอบใหม่
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#59413f] font-medium block">การสอบทั้งหมด</span>
              <span className="text-3xl font-extrabold text-[#251817] block font-sans mt-2">1,284</span>
            </div>
            <div className="bg-[#fff0ef] p-3 rounded-2xl border border-[#ffd0cc]">
              <FileCheck className="h-6 w-6 text-[#8e171c]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              +12%
            </span>
            <span className="text-[10px] text-[#8c706e]">เพิ่มขึ้นจากเดือนที่แล้ว</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#59413f] font-medium block">นักเรียนที่ใช้งานอยู่</span>
              <span className="text-3xl font-extrabold text-[#251817] block font-sans mt-2">8,421</span>
            </div>
            <div className="bg-[#fff0ef] p-3 rounded-2xl border border-[#ffd0cc]">
              <Users className="h-6 w-6 text-[#8e171c]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              +4%
            </span>
            <span className="text-[10px] text-[#8c706e]">ความเคลื่อนไหวชั่วโมงนี้</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#59413f] font-medium block">วิชาเปิดใช้งานในระบบ</span>
              <span className="text-3xl font-extrabold text-[#251817] block font-sans mt-2">42</span>
            </div>
            <div className="bg-[#fff0ef] p-3 rounded-2xl border border-[#ffd0cc]">
              <BookOpen className="h-6 w-6 text-[#8e171c]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-[#8c706e]">เซสชันเปิดสอบอยู่เรียลไทม์</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Left lists & Right status widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: วิชาที่กำลังดำเนินการและระดับชั้น */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#251817]">วิชาที่กำลังดำเนินการและระดับชั้น</h3>
            <span className="text-xs text-[#8e171c] hover:underline cursor-pointer">ดูวิชาทั้งหมด</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f5dddb] bg-[#fff8f7]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#59413f]">ชื่อวิชา</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#59413f]">ระดับชั้น</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#59413f]">ผู้สอน</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#59413f]">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffe9e7] text-xs">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-[#fffcfb] transition-all">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#251817]">{exam.title}</div>
                      <div className="text-[10px] text-[#8c706e] font-mono">{exam.courseCode}</div>
                    </td>
                    <td className="py-3 px-4 text-[#59413f]">{exam.gradeLevel}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=50&h=50&q=80"
                          className="w-5 h-5 rounded-full object-cover border border-[#e0bfbc]"
                          alt="teacher"
                        />
                        <span className="text-slate-700">{exam.author}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        exam.status === 'เปิดใช้งาน'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#fff0ef] text-[#8e171c] border border-[#ffd0cc]'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Storage Health & Activity Log Widgets */}
        <div className="space-y-6">
          
          {/* Storage & Cloud Connection Widget */}
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold text-[#251817] flex items-center gap-1.5">
              <HardDrive className="h-5 w-5 text-[#8e171c]" />
              สุขภาพที่เก็บข้อมูลสำรอง
            </span>
            <span className="text-[10px] text-[#59413f] block bg-[#fff8f7] p-2 rounded-xl border border-[#f5dddb]">
              เชื่อมต่อโดยตรงกับบัญชีสถาบัน Google Drive
            </span>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-[#59413f]">
                <span>ความจุที่ใช้ไป</span>
                <span className="font-mono font-semibold">32.5 GB / 50 GB</span>
              </div>
              <div className="w-full bg-[#fff0ef] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#8e171c] h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2 text-[10px] text-[#59413f]">
              <div className="flex justify-between">
                <span>จำนวนซิงค์สะสม:</span>
                <span className="font-mono font-bold">1,402 ครั้ง</span>
              </div>
              <div className="flex justify-between">
                <span>สำรองข้อมูลล่าสุด:</span>
                <span className="font-mono font-bold text-[#8e171c]">{lastSyncTime}</span>
              </div>
            </div>

            <button
              id="btn-force-sync"
              onClick={handleGDriveSync}
              disabled={syncingGDrive}
              className="w-full flex items-center justify-center gap-2 bg-[#fff0ef] hover:bg-[#ffe9e7] text-[#8e171c] border border-[#e0bfbc] text-xs font-bold py-2.5 rounded-2xl transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${syncingGDrive ? 'animate-spin' : ''}`} />
              {syncingGDrive ? 'กำลังติดต่อคลาวด์...' : 'บังคับซิงค์สำรองข้อมูลทันที'}
            </button>
          </div>

          {/* Activity Logs Widget */}
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold text-[#251817] flex items-center gap-1.5">
              <History className="h-5 w-5 text-[#8e171c]" />
              บันทึกกิจกรรมล่าสุด (Audit Logs)
            </span>

            <div className="space-y-4">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex gap-3 items-start text-[11px] leading-snug">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.type === 'violation' ? 'bg-amber-400 animate-ping' : 'bg-[#8e171c]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[#251817] ${log.type === 'violation' ? 'font-semibold text-amber-900' : ''}`}>
                      {log.message}
                    </p>
                    <span className="text-[9px] text-[#8c706e] font-mono mt-0.5 block">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
