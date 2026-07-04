import { apiClient } from "./api-client";

export interface ResumeAnalysisResponse {
  id: number;
  score: number;
  suggestions: {
    missing_skills: string[];
    strengths: string[];
    improvements: string[];
    formatting_tips: string[];
    tailored_suggestions?: string[];
  };
  created_at: string;
}

export interface RoadmapResponse {
  id: number;
  current_skills: string;
  target_role: string;
  roadmap_data: {
    role: string;
    timeframe: string;
    difficulty: string;
    steps: {
      phase: string;
      title: string;
      description: string;
      skills_to_acquire: string[];
      projects_to_build: string[];
      certifications: string[];
      resources: string[];
      interview_prep: string[];
    }[];
  };
  created_at: string;
}

export interface InterviewMessage {
  role: "user" | "assistant";
  content: string;
}

export interface InterviewResponse {
  session_id: number;
  reply: string;
  history: InterviewMessage[];
  evaluation?: {
    score: number;
    feedback: string;
  };
  is_finished?: boolean;
}

export interface InterviewSessionInfo {
  id: number;
  role: string;
  created_at: string;
}

export const careerApi = {
  async analyzeResume(resumeText?: string, resumeFile?: File, jobDescription?: string): Promise<ResumeAnalysisResponse> {
    const formData = new FormData();
    if (resumeText) formData.append("resume_text", resumeText);
    if (resumeFile) formData.append("resume_file", resumeFile);
    if (jobDescription) formData.append("job_description", jobDescription);
    
    const response = await apiClient.post<ResumeAnalysisResponse>("/career/resume-analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },

  async getResumeAnalyses(): Promise<ResumeAnalysisResponse[]> {
    const response = await apiClient.get<ResumeAnalysisResponse[]>("/career/resume-analyses");
    return response.data;
  },

  async generateRoadmap(currentSkills: string, targetRole: string): Promise<RoadmapResponse> {
    const response = await apiClient.post<RoadmapResponse>("/career/roadmap", {
      current_skills: currentSkills,
      target_role: targetRole
    });
    return response.data;
  },

  async getRoadmaps(): Promise<RoadmapResponse[]> {
    const response = await apiClient.get<RoadmapResponse[]>("/career/roadmaps");
    return response.data;
  },

  async sendInterviewMessage(roleTarget: string, message: string, sessionId?: number): Promise<InterviewResponse> {
    const response = await apiClient.post<InterviewResponse>("/career/interview", {
      role_target: roleTarget,
      message,
      session_id: sessionId || null
    });
    return response.data;
  },

  async getInterviewSessions(): Promise<InterviewSessionInfo[]> {
    const response = await apiClient.get<InterviewSessionInfo[]>("/career/interview/sessions");
    return response.data;
  },

  async getInterviewSession(sessionId: number): Promise<InterviewResponse> {
    const response = await apiClient.get<InterviewResponse>(`/career/interview/sessions/${sessionId}`);
    return response.data;
  }
};
