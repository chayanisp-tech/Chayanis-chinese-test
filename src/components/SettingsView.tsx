import React, { useState } from 'react';
import { 
  Clock, 
  KeyRound, 
  HardDrive, 
  ShieldAlert, 
  Save, 
  Undo,
  CheckCircle,
  Eye,
  EyeOff,
  Sliders
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSave: (newSettings: SystemSettings) => void;
}

export default function SettingsView({ settings, onSave }: SettingsViewProps) {
  const [startTime, setStartTime] = useState(settings.startTime);
  const [endTime, setEndTime] = useState(settings.endTime);
  const [forceGmt7, setForceGmt7] = useState(settings.forceGmt7);
  const [lockdownBrowser, setLockdownBrowser] = useState(settings.lockdownBrowser);
  const [faceRecognition, setFaceRecognition] = useState(settings.faceRecognition);
  const [strictnessLevel, setStrictnessLevel] = useState(settings.strictnessLevel);
  const [gDriveConnected, setGDriveConnected] = useState(settings.gDriveConnected);
  
  // Credentials states
  const [currPassword, setCurrPassword] = useState('********');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdated(true);
    setTimeout(() => {
      setPasswordUpdated(false);
      setNewPassword('');
    }, 2000);
  };

  const handleFormSubmit = () => {
    setSaving(true);
    const updated: SystemSettings = {
      startTime,
      endTime,
      forceGmt7,
      lockdownBrowser,
      faceRecognition,
      strictnessLevel,
      gDriveConnected,
      gDriveUsedGb: settings.gDriveUsedGb
    };
    
    setTimeout(() => {
      onSave(updated);
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-[#e0bfbc] pb-4">
        <h1 className="text-[#251817] font-bold text-2xl font-sans tracking-tight">
          ตั้งค่าระบบหลัก (System Settings)
        </h1>
        <p className="text-xs text-[#59413f] mt-1">
          จัดการระบบโครงสร้างพื้นฐาน ความเสถียร และมาตรการความปลอดภัยสำหรับการทดสอบทั้งหมดในระบบสถาบัน
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        
        {/* 1. Exam Timings Control Panel */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#251817] flex items-center gap-2 border-b border-[#f5dddb] pb-3">
            <Clock className="h-5 w-5 text-[#8e171c]" />
            ควบคุมการเข้าถึงการสอบ
          </h3>
          <p className="text-[10px] text-[#59413f]">กำหนดช่วงเวลาเปิดสอบสำหรับวิชาที่ใช้งานอยู่ทั้งหมด</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#8c706e] block mb-1.5">เวลาเริ่มเปิดสอบเริ่มต้น</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8c706e] block mb-1.5">เวลาปิดสอบเริ่มต้น</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setForceGmt7(!forceGmt7)}
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                forceGmt7 ? 'bg-[#8e171c] border-[#8e171c] text-white' : 'border-[#e0bfbc]'
              }`}
            >
              {forceGmt7 && <span className="text-[10px] font-bold">✔</span>}
            </button>
            <span className="text-xs font-medium text-[#59413f]">
              บังคับใช้เขตเวลาของสถาบัน (GMT+7) สำหรับนักศึกษาทุกคน
            </span>
          </div>
        </div>

        {/* 2. Credentials update */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#251817] flex items-center gap-2 border-b border-[#f5dddb] pb-3">
            <KeyRound className="h-5 w-5 text-[#8e171c]" />
            การยืนยันสิทธิ์การเข้าถึงของผู้ดูแลระบบ
          </h3>
          <p className="text-[10px] text-[#59413f]">อัปเดตข้อมูลรับรองหลักของผู้ดูแลระบบและผู้ตรวจประเมินข้อสอบ</p>

          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#8c706e] block mb-1.5">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#8c706e]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8c706e] block mb-1.5">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  placeholder="อย่างน้อย 8 ตัวอักขระ..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#8e171c] hover:bg-[#b03131] text-white text-[11px] font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                {passwordUpdated ? 'ข้อมูลรับรองอัปเดตแล้ว!' : 'อัปเดตข้อมูลรับรอง'}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Google Drive Storage bindings */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#251817] flex items-center gap-2 border-b border-[#f5dddb] pb-3">
            <HardDrive className="h-5 w-5 text-[#8e171c]" />
            การเชื่อมต่อพื้นที่จัดเก็บข้อมูลภายนอก
          </h3>
          <p className="text-[10px] text-[#59413f]">เชื่อมต่อบริการพื้นที่เก็บข้อมูลของสถาบันเพื่อสำรองข้อมูลผลการสอบโดยอัตโนมัติ</p>

          <div className="border border-[#e0bfbc] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffbfb]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                ▲
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#251817]">เชื่อมต่อกับบัญชี Google Drive ของสถานศึกษา</h4>
                <p className="text-[10px] text-[#8c706e] mt-1">ซิงค์ผลการสอบและข้อมูลการสตรีมประวัติคำตอบของนักศึกษาไปยังไดรฟ์ของสถาบันโดยตรง</p>
              </div>
            </div>
            
            <button
              onClick={() => setGDriveConnected(!gDriveConnected)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                gDriveConnected
                  ? 'bg-[#fff0ef] text-[#8e171c] border border-[#e0bfbc]'
                  : 'bg-[#8e171c] text-white hover:bg-[#b03131]'
              }`}
            >
              {gDriveConnected ? 'ตัดการเชื่อมต่อ Google Drive' : 'เชื่อมต่อบริการ'}
            </button>
          </div>
        </div>

        {/* 4. Anti-Cheating and Security Levels */}
        <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-[#251817] flex items-center gap-2 border-b border-[#f5dddb] pb-3">
            <ShieldAlert className="h-5 w-5 text-[#8e171c]" />
            ระบบป้องกันการทุจริตและการสอบที่ปลอดภัย (Anti-Cheating)
          </h3>

          {/* Strictness slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#59413f]">ระดับความเข้มงวดในการป้องกัน</span>
              <span className="bg-[#8e171c] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {strictnessLevel === 3 ? 'ระดับมาตรฐาน (ระดับ 3)' : strictnessLevel < 3 ? 'ระดับต่ำ' : 'ระดับสูงสุด'}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={strictnessLevel}
              onChange={(e) => setStrictnessLevel(Number(e.target.value))}
              className="w-full accent-[#8e171c]"
            />
            <div className="flex justify-between text-[8px] font-bold text-[#8c706e] uppercase tracking-wider">
              <span>ต่ำสุด</span>
              <span>มาตรฐาน</span>
              <span>สูงสุด</span>
            </div>
          </div>

          {/* Secure Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Lockdown Browser */}
            <button
              onClick={() => setLockdownBrowser(!lockdownBrowser)}
              className={`p-4 rounded-2xl border text-left flex gap-3 items-start transition-all ${
                lockdownBrowser 
                  ? 'bg-[#fff8f7] border-[#8e171c] ring-1 ring-[#8e171c]' 
                  : 'bg-white border-[#e0bfbc]'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                lockdownBrowser ? 'bg-[#8e171c] border-[#8e171c] text-white' : 'border-[#e0bfbc]'
              }`}>
                {lockdownBrowser && <span className="text-[10px]">✔</span>}
              </div>
              <div>
                <span className="text-xs font-bold text-[#251817] block">ล็อกดาวน์เบราว์เซอร์</span>
                <span className="text-[10px] text-[#8c706e] block mt-1 leading-snug">
                  ป้องกันไม่ให้นักศึกษาเปิดแท็บบราวเซอร์ใหม่ ย่อหน้าต่าง หรือสลับไปใช้โปรแกรมอื่นในขณะทำการสอบ
                </span>
              </div>
            </button>

            {/* AI Facial Recognition */}
            <button
              onClick={() => setFaceRecognition(!faceRecognition)}
              className={`p-4 rounded-2xl border text-left flex gap-3 items-start transition-all ${
                faceRecognition 
                  ? 'bg-[#fff8f7] border-[#8e171c] ring-1 ring-[#8e171c]' 
                  : 'bg-white border-[#e0bfbc]'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                faceRecognition ? 'bg-[#8e171c] border-[#8e171c] text-white' : 'border-[#e0bfbc]'
              }`}>
                {faceRecognition && <span className="text-[10px]">✔</span>}
              </div>
              <div>
                <span className="text-xs font-bold text-[#251817] block">AI ตรวจจับใบหน้าผ่านกล้อง (Face ID)</span>
                <span className="text-[10px] text-[#8c706e] block mt-1 leading-snug">
                  เปิดการใช้งานอัลกอริทึมกล้องถ่ายรูปในการยืนยันตัวตนและการตรวจจับใบหน้าผู้สอบตลอดเวลาเพื่อป้องกันการออกนอกเฟรม
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Form bottom summary and saves */}
        <div className="flex items-center justify-between p-4 bg-[#fff0ef] rounded-2xl border border-[#ffd0cc]">
          <span className="text-[10px] text-[#59413f] italic">
            * การบันทึกปรับเปลี่ยนการตั้งค่าทั้งหมดจะถูกจารึกลงในฐานข้อมูล และสร้างประวัติ Audit Log ล่าสุดของระบบสถาบัน
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleFormSubmit}
              disabled={saving}
              className="bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-sm transition-all flex items-center gap-1.5"
            >
              {saving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกสำเร็จ!' : 'บันทึกการเปลี่ยนแปลงทั้งหมด'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
