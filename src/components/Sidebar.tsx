import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Settings, 
  User, 
  GraduationCap, 
  Plus, 
  Activity, 
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentRole: 'teacher' | 'student';
  currentTab: string;
  onRoleChange: (role: 'teacher' | 'student') => void;
  onTabChange: (tab: string) => void;
  onOpenCreateExam: () => void;
  gDriveConnected: boolean;
}

export default function Sidebar({
  currentRole,
  currentTab,
  onRoleChange,
  onTabChange,
  onOpenCreateExam,
  gDriveConnected
}: SidebarProps) {
  return (
    <div className="w-64 bg-[#fff8f7] border-r border-[#e0bfbc] flex flex-col justify-between h-screen fixed left-0 top-0 z-20">
      <div>
        {/* Logo / Brand Header */}
        <div className="p-6 border-b border-[#e0bfbc] flex flex-col">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-[#8e171c]" />
            <span className="font-bold text-xl text-[#8e171c] tracking-tight font-sans">
              ChineseEduTest
            </span>
          </div>
          <span className="text-[10px] text-[#59413f] font-mono mt-1">
            ผู้ดูแลระบบสถาบัน
          </span>
        </div>

        {/* Navigation items (Teacher Mode) */}
        {currentRole === 'teacher' ? (
          <div className="p-4 space-y-1">
            <button
              id="sidebar-btn-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-[#ffe9e7] text-[#8e171c] shadow-sm'
                  : 'text-[#59413f] hover:bg-[#fff0ef] hover:text-[#8e171c]'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              แดชบอร์ด
            </button>

            <button
              id="sidebar-btn-exams"
              onClick={() => onTabChange('exams')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'exams'
                  ? 'bg-[#ffe9e7] text-[#8e171c] shadow-sm'
                  : 'text-[#59413f] hover:bg-[#fff0ef] hover:text-[#8e171c]'
              }`}
            >
              <FileText className="h-5 w-5" />
              คลังข้อสอบ
            </button>

            <button
              id="sidebar-btn-grading"
              onClick={() => onTabChange('grading')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'grading'
                  ? 'bg-[#ffe9e7] text-[#8e171c] shadow-sm'
                  : 'text-[#59413f] hover:bg-[#fff0ef] hover:text-[#8e171c]'
              }`}
            >
              <CheckSquare className="h-5 w-5" />
              การตรวจให้คะแนน
            </button>

            <button
              id="sidebar-btn-settings"
              onClick={() => onTabChange('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'settings'
                  ? 'bg-[#ffe9e7] text-[#8e171c] shadow-sm'
                  : 'text-[#59413f] hover:bg-[#fff0ef] hover:text-[#8e171c]'
              }`}
            >
              <Settings className="h-5 w-5" />
              ตั้งค่าระบบ
            </button>

            {/* Quick Action Button */}
            <div className="pt-4">
              <button
                id="sidebar-btn-create-exam"
                onClick={onOpenCreateExam}
                className="w-full flex items-center justify-center gap-2 bg-[#8e171c] hover:bg-[#b03131] text-white py-3 px-4 rounded-full text-xs font-semibold shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                สร้างแบบทดสอบใหม่
              </button>
            </div>
          </div>
        ) : (
          /* Student Navigation mode */
          <div className="p-4 space-y-1">
            <div className="bg-[#fff0ef] p-4 rounded-2xl mb-4 border border-[#e0bfbc]">
              <span className="text-xs font-semibold text-[#8e171c] block">
                ระบบสอบออนไลน์สำหรับนักเรียน
              </span>
              <span className="text-[10px] text-[#59413f] mt-1 block">
                โปรดอ่านคู่มือและรักษาความซื่อสัตย์ในการทดสอบ
              </span>
            </div>

            <button
              id="sidebar-btn-student-lobby"
              onClick={() => onTabChange('student-lobby')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'student-lobby' || currentTab === 'student-exam'
                  ? 'bg-[#ffe9e7] text-[#8e171c] shadow-sm'
                  : 'text-[#59413f] hover:bg-[#fff0ef] hover:text-[#8e171c]'
              }`}
            >
              <Compass className="h-5 w-5" />
              วิชาที่เปิดสอบ
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#e0bfbc] space-y-4">
        {/* Google Drive Status Widget if connected */}
        {gDriveConnected && (
          <div className="bg-[#fff0ef] p-3 rounded-2xl border border-[#ffd0cc] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-[#59413f] block font-medium">Google Drive เชื่อมต่ออยู่</span>
              <span className="text-[9px] text-[#8c706e] block">ใช้ไป 32.5 GB จาก 50 GB</span>
            </div>
          </div>
        )}

        {/* Role Toggle Switch */}
        <div className="flex items-center justify-between p-2 bg-[#ffe9e7] rounded-full">
          <button
            id="role-toggle-teacher"
            onClick={() => onRoleChange('teacher')}
            className={`flex-1 text-center py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentRole === 'teacher'
                ? 'bg-[#8e171c] text-white shadow'
                : 'text-[#59413f] hover:text-[#8e171c]'
            }`}
          >
            ผู้สอน
          </button>
          <button
            id="role-toggle-student"
            onClick={() => onRoleChange('student')}
            className={`flex-1 text-center py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentRole === 'student'
                ? 'bg-[#8e171c] text-white shadow'
                : 'text-[#59413f] hover:text-[#8e171c]'
            }`}
          >
            นักเรียน
          </button>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover border border-[#8e171c]"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-[#251817] block truncate">
              {currentRole === 'teacher' ? 'โปรไฟล์ผู้ดูแล' : 'โปรไฟล์นักเรียน'}
            </span>
            <span className="text-[10px] text-[#59413f] block truncate">
              {currentRole === 'teacher' ? 'admin@institution.edu' : 'student@banmuang.ac.th'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
