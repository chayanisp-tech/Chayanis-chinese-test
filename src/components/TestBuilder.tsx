import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Image, 
  X, 
  Check, 
  FileText, 
  Save, 
  Share2,
  ListOrdered,
  Layers,
  Sparkles
} from 'lucide-react';
import { Exam, Question, QuestionType } from '../types';

interface TestBuilderProps {
  onSave: (exam: Exam) => void;
  onCancel: () => void;
}

export default function TestBuilder({ onSave, onCancel }: TestBuilderProps) {
  // General Exam Parameters
  const [title, setTitle] = useState('ฟิสิกส์วิเคราะห์สถิตศาสตร์เบื้องต้น');
  const [courseCode, setCourseCode] = useState('PHY-201');
  const [gradeLevel, setGradeLevel] = useState('มัธยมศึกษาปีที่ 5');
  const [defaultPoints, setDefaultPoints] = useState(10);
  const [randomize, setRandomize] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Question list state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'qb1',
      type: QuestionType.MULTIPLE_CHOICE,
      title: 'คำถามข้อที่ 1',
      description: 'กรอกโจทย์คำถามปรนัยที่นี่...',
      points: 10,
      options: [
        'ตัวเลือก ก: การวิเคราะห์โครงสร้าง',
        'ตัวเลือก ข: การสร้างแบบจำลองพลวัต',
        'ตัวเลือก ค: การหาแรงปฏิกิริยาเฉลี่ย',
      ],
      correctAnswer: 'ตัวเลือก ก: การวิเคราะห์โครงสร้าง',
    },
    {
      id: 'qb2',
      type: QuestionType.ESSAY,
      title: 'คำถามข้อที่ 2',
      description: 'เขียนโจทย์เรียงความสะท้อนความคิดเห็นเกี่ยวกับประโยชน์ของสถิตศาสตร์ในชีวิตประจำวัน...',
      points: 20,
      responseType: 'both',
      wordLimit: 2000,
    }
  ]);

  // Total points calculation
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  // Add multiple choice choice
  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: [...q.options, `ตัวเลือกใหม่ลำดับที่ ${q.options.length + 1}`]
        };
      }
      return q;
    }));
  };

  // Remove multiple choice choice
  const handleRemoveOption = (questionId: string, optIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter((_, idx) => idx !== optIndex)
        };
      }
      return q;
    }));
  };

  // Update choice text
  const handleUpdateOption = (questionId: string, optIndex: number, newText: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const updatedOptions = [...q.options];
        updatedOptions[optIndex] = newText;
        return {
          ...q,
          options: updatedOptions
        };
      }
      return q;
    }));
  };

  // Add new question shell of a specific type
  const handleAddNewQuestion = (type: QuestionType) => {
    const newId = `q-${Date.now()}`;
    const newQ: Question = {
      id: newId,
      type,
      title: `คำถามข้อที่ ${questions.length + 1}`,
      description: type === QuestionType.MULTIPLE_CHOICE ? 'โจทย์ปรนัย...' : 'โจทย์อัตนัย / เรียงความ...',
      points: defaultPoints,
      options: type === QuestionType.MULTIPLE_CHOICE ? ['ตัวเลือก ก', 'ตัวเลือก ข', 'ตัวเลือก ค'] : undefined,
      responseType: type === QuestionType.ESSAY ? 'both' : undefined,
      wordLimit: type === QuestionType.ESSAY ? 2000 : undefined,
    };
    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleUpdateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, description: text } : q));
  };

  const handleUpdateQuestionPoints = (id: string, pts: number) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, points: pts } : q));
  };

  const handlePublish = () => {
    const exam: Exam = {
      id: courseCode || `EXAM-${Date.now()}`,
      title: `${title} (${courseCode})`,
      courseCode,
      gradeLevel,
      status: 'เปิดใช้งาน',
      questions,
      durationMinutes,
      author: 'ครูผู้ควบคุมระบบสถิต',
    };
    onSave(exam);
  };

  return (
    <div className="space-y-6">
      {/* Title Header bar */}
      <div className="flex items-center justify-between border-b border-[#e0bfbc] pb-4">
        <div>
          <h1 className="text-[#251817] font-bold text-2xl font-sans tracking-tight">
            ระบบสร้างแบบทดสอบใหม่ (Test Builder)
          </h1>
          <p className="text-xs text-[#59413f] mt-1">
            กำหนดพารามิเตอร์การประเมินผลและเพิ่มข้อสอบลงในเครื่องมือสร้างที่ทรงพลัง
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="text-xs font-semibold px-5 py-2.5 rounded-full border border-[#e0bfbc] text-[#59413f] hover:bg-[#fff0ef] transition-all"
          >
            ยกเลิกการแก้ไข
          </button>
          <button
            id="btn-publish-exam"
            onClick={handlePublish}
            className="flex items-center gap-2 bg-[#8e171c] hover:bg-[#b03131] text-white text-xs font-semibold py-2.5 px-6 rounded-full shadow-sm transition-all"
          >
            <Share2 className="h-4 w-4" />
            เผยแพร่แบบทดสอบนี้
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Parameters control panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-[#251817] flex items-center gap-2 border-b border-[#f5dddb] pb-3">
              <Settings className="h-5 w-5 text-[#8e171c]" />
              การตั้งค่าทั่วไป
            </h3>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#59413f] block mb-1.5">ชื่อแบบทดสอบ</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#59413f] block mb-1.5">รหัสวิชา</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#59413f] block mb-1.5">ระดับชั้น</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#59413f] block mb-1.5">คะแนนเริ่มต้นต่อข้อ</label>
                <input
                  type="number"
                  value={defaultPoints}
                  onChange={(e) => setDefaultPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#59413f] block mb-1.5">ระยะเวลาทำข้อสอบ (นาที)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none focus:ring-1 focus:ring-[#8e171c]"
                />
              </div>

              {/* Randomization switch */}
              <div className="flex items-center justify-between p-4 bg-[#fff8f7] rounded-2xl border border-[#f5dddb]">
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#251817] block">สลับลำดับข้อสอบ</span>
                  <span className="text-[10px] text-[#8c706e] block mt-0.5">สลับข้อสอบสำหรับนักเรียนแต่ละคนเพื่อป้องกันการทุจริต</span>
                </div>
                <button
                  onClick={() => setRandomize(!randomize)}
                  className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${randomize ? 'bg-[#8e171c]' : 'bg-[#e0bfbc]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${randomize ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Red Badge Summary Box */}
            <div className="bg-[#8e171c] rounded-2xl p-5 text-white flex items-center justify-between shadow">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#ffd0cc]">สรุปภาพรวมข้อสอบ</span>
                <span className="text-2xl font-extrabold font-mono mt-1">
                  {questions.length.toString().padStart(2, '0')} <span className="text-xs font-normal">ข้อสอบ</span>
                </span>
              </div>
              <div className="h-10 w-[1px] bg-[#ffd0cc]/30" />
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium text-[#ffd0cc]">คะแนนรวมทั้งสิ้น</span>
                <span className="text-2xl font-extrabold font-mono mt-1">
                  {totalPoints} <span className="text-xs font-normal">คะแนน</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Form items list for each question */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-3xl border border-[#e0bfbc] p-6 shadow-sm space-y-4 relative">
                
                {/* Delete button top right */}
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="absolute top-4 right-4 text-[#8c706e] hover:text-[#8e171c] transition-colors p-1.5 hover:bg-[#fff0ef] rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Question title header */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-[#8e171c] px-2.5 py-0.5 rounded-full font-mono">
                    ข้อที่ {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#59413f]">
                    {q.type === QuestionType.MULTIPLE_CHOICE ? 'ปรนัย (หลายตัวเลือก)' : 'อัตนัย / เรียงความ'}
                  </span>
                  
                  {/* Points override block */}
                  <div className="flex items-center gap-1.5 ml-auto mr-10">
                    <span className="text-[10px] text-[#8c706e]">คะแนน:</span>
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => handleUpdateQuestionPoints(q.id, Number(e.target.value))}
                      className="w-12 text-center p-1 border border-[#e0bfbc] rounded font-mono text-xs text-[#8e171c] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Prompt textbox */}
                <div>
                  <textarea
                    value={q.description}
                    onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                    placeholder="กรอกโจทย์คำถามหรือรายละเอียดคำสั่งการเขียนที่นี่..."
                    rows={3}
                    className="w-full p-4 border border-[#e0bfbc] rounded-2xl text-xs text-[#251817] focus:ring-1 focus:ring-[#8e171c] focus:outline-none bg-[#fff8f7]"
                  />
                </div>

                {/* Custom Image attachment drag simulate */}
                <div className="border border-dashed border-[#e0bfbc] rounded-2xl p-4 text-center bg-[#fffbfb] hover:bg-[#fff5f4] cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2">
                  <Image className="h-6 w-6 text-[#8e171c]" />
                  <span className="text-[10px] font-bold text-[#8e171c]">คลิกเพื่อจำลองอัปโหลดรูปภาพ</span>
                  <span className="text-[9px] text-[#8c706e]">รองรับไฟล์ภาพประกอบ JPG, PNG (สูงสุด 5MB)</span>
                </div>

                {/* Multiple choice choices form */}
                {q.type === QuestionType.MULTIPLE_CHOICE && q.options && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-[#59413f] block">ตัวเลือกคำตอบ:</span>
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-[#8e171c] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#8e171c]">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(q.id, i, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border border-[#e0bfbc] text-xs text-[#251817] bg-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleRemoveOption(q.id, i)}
                          className="text-[#8c706e] hover:text-[#8e171c] shrink-0 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddOption(q.id)}
                      className="text-[10px] font-bold text-[#8e171c] hover:underline flex items-center gap-1 mt-1"
                    >
                      <Plus className="h-3 w-3" />
                      เพิ่มตัวเลือกคำตอบใหม่
                    </button>
                  </div>
                )}

                {/* Essay properties form */}
                {q.type === QuestionType.ESSAY && (
                  <div className="grid grid-cols-2 gap-4 bg-[#fff8f7] p-4 rounded-2xl border border-[#f5dddb] text-xs text-[#59413f]">
                    <div>
                      <span className="font-semibold block mb-1">รูปแบบการส่งคำตอบ</span>
                      <div className="flex gap-2">
                        <span className="bg-[#8e171c] text-white px-3 py-1.5 rounded-xl font-semibold text-[10px]">พิมพ์ข้อความ</span>
                        <span className="bg-white border border-[#e0bfbc] text-[#59413f] px-3 py-1.5 rounded-xl font-semibold text-[10px] flex items-center gap-1">
                          วาด / เขียนมือ (Sketch)
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold block mb-1">จำกัดจำนวนคำ/อักขระ</span>
                      <input
                        type="number"
                        value={q.wordLimit || 2000}
                        onChange={(e) => {
                          const limit = Number(e.target.value);
                          setQuestions(questions.map(item => item.id === q.id ? { ...item, wordLimit: limit } : item));
                        }}
                        className="w-24 p-1.5 border border-[#e0bfbc] rounded-xl text-center font-mono text-xs bg-white text-[#8e171c]"
                      />
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Add Question Controls Menu bar */}
          <div className="bg-[#fff8f7] border border-dashed border-[#e0bfbc] rounded-3xl p-5 flex items-center justify-around gap-4 shadow-sm">
            <button
              onClick={() => handleAddNewQuestion(QuestionType.MULTIPLE_CHOICE)}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#e0bfbc] hover:bg-[#fff0ef] hover:border-[#8e171c] transition-all text-center"
            >
              <Layers className="h-5 w-5 text-[#8e171c]" />
              <span className="text-xs font-bold text-[#251817]">ปรนัย (หลายตัวเลือก)</span>
            </button>

            <button
              onClick={() => handleAddNewQuestion(QuestionType.ESSAY)}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#e0bfbc] hover:bg-[#fff0ef] hover:border-[#8e171c] transition-all text-center"
            >
              <FileText className="h-5 w-5 text-[#8e171c]" />
              <span className="text-xs font-bold text-[#251817]">อัตนัย / เรียงความ</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
