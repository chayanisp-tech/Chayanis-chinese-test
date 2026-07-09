export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  ESSAY = 'essay',
  TRUE_FALSE = 'true_false'
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
  imageUrl?: string;
  responseType?: 'text' | 'draw' | 'both';
  wordLimit?: number;
}

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  gradeLevel: string;
  status: 'ฉบับร่าง' | 'เปิดใช้งาน';
  questions: Question[];
  durationMinutes: number;
  author: string;
}

export interface SubmissionAnswer {
  text?: string;
  drawDataUrl?: string; // Storing the base64 sketch
}

export interface Submission {
  id: string;
  examId: string;
  studentName: string;
  studentId: string;
  avatarUrl?: string;
  status: 'รอดำเนินการ' | 'ตรวจแล้ว';
  submittedAt: string;
  answers: Record<string, SubmissionAnswer>;
  score?: number;
  rubricScores?: {
    accuracy: number; // max 8 or based on rubrics
    depth: number;    // max 12
  };
  teacherComment?: string;
  violations: {
    type: 'window_switch' | 'face_missing' | 'multiple_faces';
    timestamp: string;
    description: string;
  }[];
}

export interface SystemSettings {
  startTime: string;
  endTime: string;
  forceGmt7: boolean;
  lockdownBrowser: boolean;
  faceRecognition: boolean;
  strictnessLevel: number; // 1-5
  gDriveConnected: boolean;
  gDriveUsedGb: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'publish' | 'register' | 'update' | 'violation' | 'grade';
  message: string;
  course?: string;
}
