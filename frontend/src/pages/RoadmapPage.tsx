import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Route,
  Compass,
  History,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Layers,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { careerApi, RoadmapResponse } from "@/lib/career-api";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const SAMPLE_ROADMAPS = [
  { skills: "HTML, CSS, basic JavaScript", role: "Frontend Developer" },
  { skills: "Python, SQL", role: "DevOps Engineer" }
];

export function RoadmapPage() {
  const { logout } = useAuth();
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapResponse[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapResponse | null>(null);

  async function loadRoadmaps() {
    try {
      const history = await careerApi.getRoadmaps();
      setRoadmaps(history);
      if (history.length > 0) {
        setSelectedRoadmap(history[0]);
      }
    } catch (e) {
      console.error("Failed to load roadmaps:", e);
    }
  }

  useEffect(() => {
    loadRoadmaps();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentSkills.trim() || !targetRole.trim()) return;

    setLoading(true);
    try {
      const result = await careerApi.generateRoadmap(currentSkills, targetRole);
      setSelectedRoadmap(result);
      setRoadmaps((prev) => [result, ...prev]);
    } catch (e) {
      console.error("Failed to generate roadmap:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 lg:grid lg:grid-cols-[18rem_1fr]">
      <DashboardSidebar />
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-5 md:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo surface="dark" className="h-10 w-auto max-w-[190px]" />
          </div>
          <div className="flex items-center gap-3">
            <Button asChild type="button" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
              <Link to="/profile">Profile</Link>
            </Button>
            <Button type="button" onClick={logout} className="bg-red-600 hover:bg-red-700 text-white border-0">
              Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 space-y-8">
          {/* Header Card */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-10 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-3 py-1 text-xs text-blue-400 font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Navigation Core
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Career Roadmap Planner
                </h1>
                <p className="text-sm text-slate-400">
                  Input your skills and your target position to generate a detailed, phase-by-phase learning roadmap.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Form & History */}
            <div className="lg:col-span-1 space-y-6">
              {/* Form Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-blue-400" /> Plan Roadmap
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sample Configurations</label>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_ROADMAPS.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCurrentSkills(sample.skills);
                          setTargetRole(sample.role);
                        }}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md px-2 py-1 transition"
                      >
                        {sample.role}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="curr-skills" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Skills</label>
                    <textarea
                      id="curr-skills"
                      rows={3}
                      required
                      placeholder="e.g. JavaScript, HTML, CSS, Git"
                      value={currentSkills}
                      onChange={(e) => setCurrentSkills(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="target-role" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Desired Role</label>
                    <input
                      id="target-role"
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !currentSkills.trim() || !targetRole.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg border-0 shadow-lg shadow-purple-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Map Generation...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Generate Roadmap <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>

              {/* History Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" /> Active Maps
                </h2>
                {roadmaps.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No roadmaps generated yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {roadmaps.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRoadmap(r)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                          selectedRoadmap?.id === r.id
                            ? "bg-purple-950/40 border-purple-500/50 text-white"
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-xs truncate">{r.target_role}</p>
                          <p className="text-[10px] text-slate-500 truncate">Skills: {r.current_skills}</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Display Roadmap */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedRoadmap ? (
                  <motion.div
                    key={selectedRoadmap.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* General stats */}
                    <div className="grid gap-4 sm:grid-cols-3 rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg text-center">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Position</p>
                        <p className="text-sm font-bold text-white truncate">{selectedRoadmap.roadmap_data.role}</p>
                      </div>
                      <div className="space-y-0.5 border-t sm:border-t-0 sm:border-x border-slate-800 py-2 sm:py-0">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Timeframe</p>
                        <p className="text-sm font-bold text-blue-400">{selectedRoadmap.roadmap_data.timeframe}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Difficulty</p>
                        <p className="text-sm font-bold text-purple-400">{selectedRoadmap.roadmap_data.difficulty}</p>
                      </div>
                    </div>

                    {/* Timeline Flow */}
                    <div className="relative pl-6 border-l border-slate-800 space-y-8">
                      {selectedRoadmap.roadmap_data.steps.map((step, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-purple-500">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/15">
                                {step.phase || `Step ${idx + 1}`}
                              </span>
                              <h3 className="text-base font-bold text-white">{step.title}</h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                            
                            <div className="grid gap-4 md:grid-cols-2 pt-2">
                              {/* Skills to learn */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                                  <Layers className="h-3 w-3" /> Core Competencies
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {step.skills_to_acquire.map((sk, sidx) => (
                                    <span
                                      key={sidx}
                                      className="text-[10px] font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Projects */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                                  <Sparkles className="h-3 w-3" /> Projects to Build
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {step.projects_to_build?.map((pr, pidx) => (
                                    <span
                                      key={pidx}
                                      className="text-[10px] font-semibold bg-blue-950/30 border border-blue-500/20 px-2 py-0.5 rounded text-blue-300"
                                    >
                                      {pr}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Resources */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                                  <BookOpen className="h-3 w-3" /> Resources & Certs
                                </h4>
                                <ul className="text-[10px] text-slate-400 space-y-1">
                                  {step.resources.map((res, ridx) => (
                                    <li key={ridx} className="flex gap-1.5 items-start">
                                      <span className="text-purple-500">•</span>
                                      <span>{res}</span>
                                    </li>
                                  ))}
                                  {step.certifications?.map((cert, cidx) => (
                                    <li key={cidx} className="flex gap-1.5 items-start">
                                      <span className="text-emerald-500">★</span>
                                      <span>{cert}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {/* Interview Prep */}
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                                  <Compass className="h-3 w-3" /> Interview Prep
                                </h4>
                                <ul className="text-[10px] text-slate-400 space-y-1">
                                  {step.interview_prep?.map((prep, pidx) => (
                                    <li key={pidx} className="flex gap-1.5 items-start">
                                      <span className="text-amber-500">▶</span>
                                      <span>{prep}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 border-dashed p-16 bg-slate-950/40 min-h-[400px] text-center space-y-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-full">
                      <Route className="h-10 w-10 text-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-300">No Roadmap Loaded</h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Submit your skills and transition target on the input panel to plot your customized path here.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
