import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { careerApi, ResumeAnalysisResponse, RoadmapResponse, InterviewSessionInfo } from "@/lib/career-api";

export function HistoryPage() {
  const { logout } = useAuth();
  const [analyses, setAnalyses] = useState<ResumeAnalysisResponse[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapResponse[]>([]);
  const [interviews, setInterviews] = useState<InterviewSessionInfo[]>([]);

  useEffect(() => {
    async function loadAllHistory() {
      const [a, r, i] = await Promise.all([
        careerApi.getResumeAnalyses(),
        careerApi.getRoadmaps(),
        careerApi.getInterviewSessions()
      ]);
      setAnalyses(a);
      setRoadmaps(r);
      setInterviews(i);
    }
    loadAllHistory();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[18rem_1fr]">
      <DashboardSidebar />
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-background px-5 md:px-8">
          <BrandLogo surface="light" className="h-10 w-auto max-w-[190px]" />
          <Button onClick={logout}>Logout</Button>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 space-y-8">
          <h1 className="text-2xl font-bold">Activity History</h1>
          
          <section>
            <h2 className="text-lg font-semibold mb-4">Resume Analyses</h2>
            {/* Table or List... */}
            <div className="space-y-2">
              {analyses.map(a => <div key={a.id} className="p-4 border rounded">Analysis #{a.id} - {new Date(a.created_at).toLocaleDateString()} <Link to="/dashboard/resume" className="text-blue-500 ml-4">Reopen</Link></div>)}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Roadmaps</h2>
            <div className="space-y-2">
              {roadmaps.map(r => <div key={r.id} className="p-4 border rounded">{r.target_role} - {new Date(r.created_at).toLocaleDateString()} <Link to="/dashboard/roadmap" className="text-blue-500 ml-4">Reopen</Link></div>)}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Interviews</h2>
            <div className="space-y-2">
              {interviews.map(i => <div key={i.id} className="p-4 border rounded">{i.role} - {new Date(i.created_at).toLocaleDateString()} <Link to="/dashboard/chat" className="text-blue-500 ml-4">Reopen</Link></div>)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
