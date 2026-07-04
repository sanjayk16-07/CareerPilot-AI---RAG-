import { Link, useNavigate } from "react-router";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const RECENT_ACTIVITY = [
  { activity: "Resume uploaded", module: "Resume Analyzer", date: "25 May 2026", status: "Completed" },
  { activity: "Roadmap generated", module: "Career Roadmap", date: "24 May 2026", status: "Completed" },
  { activity: "Mock interview taken", module: "AI Mock Interview", date: "23 May 2026", status: "Completed" }
];

export function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[18rem_1fr]">
      <DashboardSidebar />
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-background px-5 md:px-8">
          <BrandLogo surface="light" className="h-10 w-auto max-w-[190px]" />
          <div className="flex items-center gap-3">
            <Button asChild type="button" variant="outline">
              <Link to="/profile">Profile</Link>
            </Button>
            <Button type="button" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 space-y-8">
          {/* 3 Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Resume Card */}
            <div className="group relative rounded-xl border border-slate-800 bg-slate-950/70 p-6 hover:border-blue-500/30 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/15 uppercase tracking-wider">
                  ATS Scanner
                </span>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition">Resume Analyzer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload your CV, evaluate ATS scoring guidelines, discover missing skills, and optimize against job descriptions.
                </p>
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg border-0">
                <Link to="/dashboard/resume">Analyze Now</Link>
              </Button>
            </div>

            {/* Roadmap Card */}
            <div className="group relative rounded-xl border border-slate-800 bg-slate-950/70 p-6 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/15 uppercase tracking-wider">
                  Planner
                </span>
                <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition">Career Roadmap</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chart your professional learning timeline, bridge skills gaps, and unlock customized milestones.
                </p>
              </div>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg border-0">
                <Link to="/dashboard/roadmap">Generate Plan</Link>
              </Button>
            </div>

            {/* Chat Card */}
            <div className="group relative rounded-xl border border-slate-800 bg-slate-950/70 p-6 hover:border-pink-500/30 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/15 uppercase tracking-wider">
                  Simulator
                </span>
                <h3 className="font-bold text-lg text-white group-hover:text-pink-400 transition">AI Mock Interview</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Practice core behavioral and technical interview questions, receive instant recruiter feedback, and level up.
                </p>
              </div>
              <Button asChild className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg border-0">
                <Link to="/dashboard/chat">Start Session</Link>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-200">Recent Activity</h2>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Activity</th>
                  <th className="px-5 py-3 text-left font-semibold">Module</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ACTIVITY.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3 text-slate-200">{row.activity}</td>
                    <td className="px-5 py-3 text-slate-400">{row.module}</td>
                    <td className="px-5 py-3 text-slate-400">{row.date}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
