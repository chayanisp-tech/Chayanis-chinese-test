import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { QuestionType, Exam, Submission, SystemSettings, ActivityLog } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not configured in the Secrets panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Global In-Memory Database State
let settings: SystemSettings = {
  startTime: '08:30',
  endTime: '11:30',
  forceGmt7: true,
  lockdownBrowser: true,
  faceRecognition: true,
  strictnessLevel: 3,
  gDriveConnected: true,
  gDriveUsedGb: 32.5,
};

let exams: Exam[] = [
  {
    id: 'PHY-402',
    title: 'ฟิสิกส์และกลศาสตร์ชั้นสูง (PHY-402)',
    courseCode: 'PHY-402',
    gradeLevel: 'มัธยมศึกษาปีที่ 6',
    status: 'เปิดใช้งาน',
    durationMinutes: 60,
    author: 'ครูสมเจตน์ พิชิตภัย',
    questions: [
      {
        id: 'q1',
        type: QuestionType.MULTIPLE_CHOICE,
        title: 'สมการการเคลื่อนที่',
        description: 'ข้อใดคือสมการการเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (Simple Harmonic Motion)',
        points: 10,
        options: [
          'x(t) = A cos(wt + phi)',
          'F = ma',
          'E = mc^2',
          'v = u + at',
        ],
        correctAnswer: 'x(t) = A cos(wt + phi)',
      },
      {
        id: 'q12',
        type: QuestionType.ESSAY,
        title: 'ฟิสิกส์ทรงกระบอกกลิ้ง',
        description: `ทรงกระบอกเนื้อเดียวมวล M และรัศมี R วางอยู่บนพื้นราบที่มีความเสียดทาน มีแรงผลัก F ในแนวราบ กระทำที่จุดศูนย์กลางของทรงกระบอก\n\n1. จงหาความเร่งของจุดศูนย์กลางมวล\n2. วาดแผนภาพอิสระ (Free-body diagram) ด้านล่างและอธิบายบทบาทของแรงเสียดทานในการกลิ้งโดยไม่ไถล`,
        points: 20,
        responseType: 'both',
        wordLimit: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1616400619175-5ebd3009b403?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'HIST-202',
    title: 'ประวัติศาสตร์โลก II (HIST-202)',
    courseCode: 'HIST-202',
    gradeLevel: 'มัธยมศึกษาปีที่ 4',
    status: 'เปิดใช้งาน',
    durationMinutes: 45,
    author: 'ครูรัชนี วงศ์เทวา',
    questions: [
      {
        id: 'q14',
        type: QuestionType.ESSAY,
        title: 'ผลกระทบของแท่นพิมพ์กับการปฏิรูปศาสนา',
        description: 'วิเคราะห์ผลกระทบของแท่นพิมพ์ที่มีต่อการปฏิรูปโปรเตสแตนต์ การเผยแพร่ทางเทคโนโลยีเปลี่ยนแปลงอำนาจทางเทววิทยาอย่างไร?',
        points: 20,
        responseType: 'text',
        wordLimit: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'CHEM-301',
    title: 'เคมีอินทรีย์เบื้องต้น',
    courseCode: 'CHEM-301',
    gradeLevel: 'มัธยมศึกษาปีที่ 5',
    status: 'เปิดใช้งาน',
    durationMinutes: 90,
    author: 'ครูอรพินท์ มิ่งขวัญ',
    questions: [
      {
        id: 'c1',
        type: QuestionType.MULTIPLE_CHOICE,
        title: 'พันธะเคมี',
        description: 'ข้อใดจัดเป็นสารประกอบประเภทไฮโดรคาร์บอนอิ่มตัว',
        points: 10,
        options: ['Methane (CH4)', 'Ethylene (C2H4)', 'Acetylene (C2H2)', 'Benzene (C6H6)'],
        correctAnswer: 'Methane (CH4)',
      },
    ],
  },
  {
    id: 'AI-101',
    title: 'ความรู้เบื้องต้นเกี่ยวกับ AI',
    courseCode: 'AI-101',
    gradeLevel: 'มัธยมศึกษาปีที่ 6',
    status: 'เปิดใช้งาน',
    durationMinutes: 60,
    author: 'ครูปัญญา ฉลาดล้ำ',
    questions: [
      {
        id: 'ai1',
        type: QuestionType.ESSAY,
        title: 'แนวคิดปัญญาประดิษฐ์',
        description: 'ให้อธิบายความต่างระหว่าง Machine Learning และ Deep Learning มาโดยละเอียด',
        points: 10,
        responseType: 'text',
        wordLimit: 1000,
      },
    ],
  },
];

let submissions: Submission[] = [
  {
    id: 'sub-1',
    examId: 'HIST-202',
    studentName: 'Julianna Mercer',
    studentId: '44921',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'รอดำเนินการ',
    submittedAt: '2026-07-08T10:42:00Z',
    answers: {
      q14: {
        text: `The printing press, invented by Johannes Gutenberg around 1440, was a critical catalyst for the Reformation. Before its widespread use, the Church controlled the dissemination of scripture through hand-copied Latin manuscripts. Martin Luther used the press to distribute his 95 Theses in the vernacular (German), which challenged the centralized authority by allowing individuals to interpret scripture for themselves. This decentralized theological power and made literacy a spiritual necessity rather than an elite privilege...`,
      },
    },
    violations: [
      {
        type: 'window_switch',
        timestamp: '10:15 AM',
        description: 'ตรวจพบการสลับแท็บบราวเซอร์ 1 ครั้ง',
      },
    ],
  },
  {
    id: 'sub-2',
    examId: 'HIST-202',
    studentName: 'Marcus Thorne',
    studentId: '44922',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'ตรวจแล้ว',
    submittedAt: '2026-07-08T10:35:00Z',
    score: 88,
    rubricScores: {
      accuracy: 7,
      depth: 10,
    },
    teacherComment: 'วิเคราะห์โครงสร้างสังคมได้ยอดเยี่ยม แต่อยากให้เน้นผลกระทบทางเทววิทยาเพิ่มเติม',
    answers: {
      q14: {
        text: 'แท่นพิมพ์ของกูเตนเบิร์กทำให้คัมภีร์ไบเบิลได้รับการแปลและพิมพ์เป็นภาษาท้องถิ่นจำนวนมาก ส่งผลให้ลดบทบาทของพระคาทอลิกแบบดั้งเดิมที่ผูกขาดคัมภีร์ภาษาละติน มาร์ติน ลูเธอร์ สามารถเผยแพร่แนวคิดปฏิรูปนิกายโปรเตสแตนต์ได้อย่างรวดเร็วไปทั่วเยอรมนีและยุโรปอย่างไม่เคยปรากฏมาก่อน',
      },
    },
    violations: [],
  },
  {
    id: 'sub-3',
    examId: 'HIST-202',
    studentName: 'Elena Rodriguez',
    studentId: '44923',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'ตรวจแล้ว',
    submittedAt: '2026-07-08T10:15:00Z',
    score: 94,
    rubricScores: {
      accuracy: 8,
      depth: 11,
    },
    teacherComment: 'คำตอบสมบูรณ์แบบมาก อ้างอิงประวัติศาสตร์ได้แม่นยำและลึกซึ้ง มีลำดับความคิดที่เป็นระบบ',
    answers: {
      q14: {
        text: 'The print revolution shifted theological authority from the hierarchy of Rome to individual conscience. By standardizing translations, it enabled theological scrutiny and debated doctrines like indulgences. The visual and satirical woodcuts printed alongside texts brought theological debates to the non-literate masses, widening the Reformation into a truly popular socio-religious movement.',
      },
    },
    violations: [],
  },
];

let activityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '10:45 น.',
    type: 'publish',
    message: 'เผยแพร่ข้อสอบปลายภาค ฟิสิกส์และกลศาสตร์ชั้นสูง ม.5',
    course: 'PHY-402',
  },
  {
    id: 'log-2',
    timestamp: 'เมื่อวานนี้',
    type: 'register',
    message: 'การลงทะเบียนแบบกลุ่ม เพิ่มนักเรียนใหม่ 45 คนใน CS-101',
  },
  {
    id: 'log-3',
    timestamp: '2 วันที่แล้ว',
    type: 'update',
    message: 'อัปเดตระบบติดตั้งอัลกอริทึมการให้คะแนน v2.4 เรียบร้อยแล้ว',
  },
];

// --- REST API Endpoints ---

// Get Settings
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

// Update Settings
app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, settings });
});

// Get Exams
app.get('/api/exams', (req, res) => {
  res.json(exams);
});

// Create/Update Exam
app.post('/api/exams', (req, res) => {
  const newExam: Exam = req.body;
  const existingIndex = exams.findIndex((e) => e.id === newExam.id);
  if (existingIndex > -1) {
    exams[existingIndex] = newExam;
  } else {
    exams.push(newExam);
  }
  
  // Add to Activity Log
  activityLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: 'เพิ่งผ่านมา',
    type: 'publish',
    message: `อัปเดตข้อมูลวิชา ${newExam.title}`,
    course: newExam.courseCode,
  });

  res.json({ success: true, exam: newExam });
});

// Delete Exam
app.delete('/api/exams/:id', (req, res) => {
  exams = exams.filter((e) => e.id !== req.params.id);
  res.json({ success: true });
});

// Get Submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Update Submission Score/Feedback (Grading)
app.post('/api/submissions/:id/grade', (req, res) => {
  const { score, rubricScores, teacherComment } = req.body;
  const subIndex = submissions.findIndex((s) => s.id === req.params.id);
  if (subIndex > -1) {
    submissions[subIndex].status = 'ตรวจแล้ว';
    submissions[subIndex].score = score;
    submissions[subIndex].rubricScores = rubricScores;
    submissions[subIndex].teacherComment = teacherComment;

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: 'เพิ่งผ่านมา',
      type: 'grade',
      message: `ตรวจข้อสอบของ ${submissions[subIndex].studentName} สำเร็จ (คะแนน: ${score})`,
    });

    res.json({ success: true, submission: submissions[subIndex] });
  } else {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Submit Exam (Student Exam Submission)
app.post('/api/submissions', (req, res) => {
  const newSubmission: Submission = {
    id: `sub-${Date.now()}`,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    ...req.body,
    submittedAt: new Date().toISOString(),
  };

  submissions.unshift(newSubmission);

  // Add violation log alert if any
  if (newSubmission.violations && newSubmission.violations.length > 0) {
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: 'เพิ่งผ่านมา',
      type: 'violation',
      message: `ตรวจพบการทุจริตข้อสอบวิชา ${newSubmission.examId} ของ ${newSubmission.studentName}`,
      course: newSubmission.examId,
    });
  }

  res.json({ success: true, submission: newSubmission });
});

// Get Activity Logs
app.get('/api/logs', (req, res) => {
  res.json(activityLogs);
});

// Clean and Reset database
app.post('/api/reset', (req, res) => {
  submissions = submissions.filter((s) => s.id === 'sub-1' || s.id === 'sub-2' || s.id === 'sub-3');
  submissions[0].status = 'รอดำเนินการ';
  delete submissions[0].score;
  delete submissions[0].rubricScores;
  delete submissions[0].teacherComment;
  res.json({ success: true });
});

// --- AI Auto Grading with Gemini API ---
app.post('/api/grade-ai', async (req, res) => {
  const { questionText, studentAnswer, points } = req.body;
  
  if (!questionText || !studentAnswer) {
    return res.status(400).json({ error: 'Missing required parameters: questionText and studentAnswer' });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      คุณคือผู้ช่วยตรวจข้อสอบปัญญาประดิษฐ์ระดับมืออาชีพ กรุณาประเมินคำตอบของนักเรียนโดยใช้เกณฑ์ (Rubric) ต่อไปนี้:
      
      คำถาม: "${questionText}"
      คำตอบของนักเรียน: "${studentAnswer}"
      คะแนนเต็มรวมของข้อนี้: ${points} คะแนน
      
      โปรดประเมินออกเป็น 2 ด้านอย่างละเอียด:
      1. ความถูกต้องทางวิชาการ/ประวัติศาสตร์ (คะแนนเต็มสูงสุด 8 คะแนน)
         - จำกัด (1-2 คะแนน): มีข้อผิดพลาดทางข้อมูลร้ายแรง
         - พื้นฐาน (3-4 คะแนน): ระบุข้อมูลสำคัญได้ถูกต้องบางส่วน
         - ชำนาญ (5-6 คะแนน): ข้อมูลเท็จจริงถูกต้องและชัดเจน
         - ดีเยี่ยม (7-8 คะแนน): ถูกต้อง สมบูรณ์ ลึกซึ้ง และมีหลักฐานสนับสนุนเด่นชัด
      
      2. ความลึกของการวิเคราะห์ทางเทววิทยาและสังคม (คะแนนเต็มสูงสุด 12 คะแนน)
         - ผิวเผิน (1-4 คะแนน): เขียนเชิงพรรณนาทั่วไป ไม่เห็นเหตุผลเชื่อมโยง
         - พื้นฐาน (5-8 คะแนน): อธิบายเหตุและผลได้พอเข้าใจ
         - วิเคราะห์ลึกซึ้ง (9-12 คะแนน): วิเคราะห์อย่างลึกซึ้งถึงโครงสร้างอำนาจ การกระจายเสียง และพลวัตทางสังคม
         
      ตอบกลับด้วยรูปแบบ JSON เสมอ โดยใช้ Schema โครงสร้างดังนี้:
      {
        "accuracyScore": ตัวเลขคะแนนความถูกต้อง (0-8),
        "accuracyJustification": "เหตุผลสั้นๆ สำหรับคะแนนความถูกต้องทางประวัติศาสตร์",
        "depthScore": ตัวเลขคะแนนการวิเคราะห์ (0-12),
        "depthJustification": "เหตุผลสั้นๆ สำหรับคะแนนความลึกของการวิเคราะห์",
        "feedbackThai": "คำแนะนำและข้อเสนอแนะเชิงบวกและเป็นประโยชน์สำหรับนักเรียน (เป็นภาษาไทย)",
        "suggestedTotalScore": ตัวเลขผลรวมคะแนนที่เหมาะสม (0-20)
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracyScore: { type: Type.INTEGER, description: 'Score between 0 and 8' },
            accuracyJustification: { type: Type.STRING },
            depthScore: { type: Type.INTEGER, description: 'Score between 0 and 12' },
            depthJustification: { type: Type.STRING },
            feedbackThai: { type: Type.STRING },
            suggestedTotalScore: { type: Type.INTEGER, description: 'Combined score' },
          },
          required: ['accuracyScore', 'accuracyJustification', 'depthScore', 'depthJustification', 'feedbackThai', 'suggestedTotalScore'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini');
    }

    const evaluation = JSON.parse(resultText);
    res.json(evaluation);
  } catch (error: any) {
    console.error('Gemini AI grading error:', error);
    // Graceful fallback if API key is not configured or fails
    const fallbackResponse = {
      accuracyScore: 7,
      accuracyJustification: 'คำตอบระบุเหตุการณ์สำคัญและมาร์ติน ลูเธอร์ได้ถูกต้องแม่นยำ (ระบบจำลองทำงานเนื่องจากคีย์ยังไม่พร้อม)',
      depthScore: 10,
      depthJustification: 'สามารถเชื่อมโยงอิทธิพลของแท่นพิมพ์กับการสลายการผูกขาดเทววิทยาของฝ่ายโบสถ์ได้ลึกซึ้ง',
      feedbackThai: 'วิเคราะห์โครงสร้างสังคมได้ยอดเยี่ยม แต่อยากให้เน้นผลกระทบทางเทววิทยาเชิงลึกเพิ่มเติม ข้อเขียนเรียบเรียงได้ลื่นไหลดีมาก',
      suggestedTotalScore: 17,
      isFallback: true,
      errorMessage: error.message,
    };
    res.json(fallbackResponse);
  }
});

// Serve frontend assets and start server
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
