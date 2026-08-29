export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string | null;
          current_level: number;
          plan_type: 'free' | 'pro_plus';
          role: 'entrepreneur' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          business_name?: string | null;
          current_level?: number;
          plan_type?: 'free' | 'pro_plus';
          role?: 'entrepreneur' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          current_level?: number;
          plan_type?: 'free' | 'pro_plus';
          role?: 'entrepreneur' | 'admin';
          created_at?: string;
        };
      };
      diagnostic_responses: {
        Row: {
          id: string;
          user_id: string;
          answers: Json;
          total_score: number;
          assigned_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          answers: Json;
          total_score?: number;
          assigned_level: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          answers?: Json;
          total_score?: number;
          assigned_level?: number;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          thumbnail_url: string | null;
          level_required: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          thumbnail_url?: string | null;
          level_required?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          level_required?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          slug: string;
          video_url: string | null;
          content_markdown: string | null;
          duration_minutes: number;
          resources: Json;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          slug: string;
          video_url?: string | null;
          content_markdown?: string | null;
          duration_minutes?: number;
          resources?: Json;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          slug?: string;
          video_url?: string | null;
          content_markdown?: string | null;
          duration_minutes?: number;
          resources?: Json;
          order_index?: number;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string | null;
          course_id: string | null;
          title: string;
          min_passing_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string | null;
          course_id?: string | null;
          title: string;
          min_passing_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string | null;
          course_id?: string | null;
          title?: string;
          min_passing_score?: number;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          explanation: string | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          explanation?: string | null;
          order_index?: number;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          explanation?: string | null;
          order_index?: number;
        };
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          is_correct?: boolean;
        };
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          last_watched_second: number;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          last_watched_second?: number;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          last_watched_second?: number;
          completed_at?: string | null;
        };
      };
      user_quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
          answers_summary: Json;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed?: boolean;
          answers_summary: Json;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          passed?: boolean;
          answers_summary?: Json;
          attempted_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DiagnosticResponse = Database['public']['Tables']['diagnostic_responses']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type CourseModule = Database['public']['Tables']['course_modules']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];
export type QuizOption = Database['public']['Tables']['quiz_options']['Row'];
export type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];
export type UserQuizAttempt = Database['public']['Tables']['user_quiz_attempts']['Row'];
