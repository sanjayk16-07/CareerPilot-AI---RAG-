import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Briefcase,
  History,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { careerApi, ResumeAnalysisResponse } from "@/lib/career-api";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const SAMPLE_RESUMES = [
  {
    name: "Frontend Developer (Junior)",
    text: "John Doe\nEmail: john.doe@email.com\nSkills: HTML, CSS, JavaScript, React (basic), Git\n\nExperience:\nJunior Frontend Developer at WebCorp (2025 - Present)\n- Developed landing pages using HTML and CSS.\n- Helped integrate simple JavaScript features.\n- Maintained existing web assets."
  },
  {
    name: "Python Engineer (Mid)",
    text: "Alice Smith\nEmail: alice@email.com\nSkills: Python, Django, REST APIs, SQL, Git\n\nExperience:\nSoftware Engineer at DevSol (2023 - 2026)\n- Built RESTful endpoints using Django REST framework.\n- Structured database queries using PostgreSQL.\n- Wrote unit tests to improve coverage to 80%."
  }
];

export function ResumePage() {
  const { logout } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<ResumeAnalysisResponse[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysisResponse | null>(null);

  async function loadHistory() {
    try {
      const history = await careerApi.getResumeAnalyses();
      setAnalyses(history);
      if (history.length > 0) {
        setSelectedAnalysis(history[0]);
      }
    } catch (e) {
      console.error("Failed to load resume analysis history:", e);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeText.trim() && !resumeFile) return;

    setLoading(true);
    try {
      const result = await careerApi.analyzeResume(resumeText, resumeFile || undefined, jobDescription);
      setSelectedAnalysis(result);
      setAnalyses((prev) => [result, ...prev]);
      setResumeFile(null);
    } catch (e) {
      console.error("Failed to analyze resume:", e);
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
                  <Sparkles className="h-3 w-3" /> AI Engine
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Resume Analyzer
                </h1>
                <p className="text-sm text-slate-400">
                  Upload or paste your resume and optional job target to receive automated AI improvements instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Form & History */}
            <div className="lg:col-span-1 space-y-6">
              {/* Form Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" /> Analysis Input
                </h2>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sample Resumes</label>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_RESUMES.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setResumeText(sample.text)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md px-2 py-1 transition"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Resume Content or File</label>
                    <textarea
                      id="resume-text"
                      rows={6}
                      placeholder="Paste your text resume here..."
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setResumeFile(null);
                      }}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                    />
                    <div className="text-center text-xs text-slate-500">OR</div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                          setResumeText("");
                        }
                      }}
                      className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-purple-400 hover:file:bg-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="job-desc" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Target Job Description (Optional)</label>
                    <textarea
                      id="job-desc"
                      rows={4}
                      placeholder="Paste target job listing description to match skills..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || (!resumeText.trim() && !resumeFile)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg border-0 shadow-lg shadow-purple-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Analyze Resume <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>

              {/* History Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg space-y-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" /> Recent Analyses
                </h2>
                {analyses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No previous analyses found.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {analyses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAnalysis(a)}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition flex justify-between items-center ${
                          selectedAnalysis?.id === a.id
                            ? "bg-purple-950/40 border-purple-500/50 text-white"
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs">Analysis #{a.id}</p>
                          <p className="text-[10px] text-slate-500">{new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-blue-400">
                          {a.score}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedAnalysis ? (
                  <motion.div
                    key={selectedAnalysis.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Score Panel */}
                    <div className="grid gap-6 md:grid-cols-4 rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
                      <div className="md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                        <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-4 border-slate-800 bg-slate-900 shadow-inner">
                          {/* Radial indicator */}
                          <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin-slow opacity-30" />
                          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {selectedAnalysis.score}
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">ATS Score</p>
                      </div>

                      <div className="md:col-span-3 space-y-3 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-500" /> 
                          {selectedAnalysis.score >= 80 ? "Excellent Profile Ready" : selectedAnalysis.score >= 70 ? "Solid Foundation, Needs Tailoring" : "Needs Profile Optimizations"}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Your profile has a matches of key industry markers. Review the detailed feedback below on missing keywords, core improvements, and formatting layout highlights to maximize your call-back rate.
                        </p>
                      </div>
                    </div>

                    {/* Detailed Breakdowns */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Strengths */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-md space-y-3">
                        <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" /> Core Strengths
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {selectedAnalysis.suggestions.strengths.map((str, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-md space-y-3">
                        <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" /> Recommended Adjustments
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {selectedAnalysis.suggestions.improvements.map((imp, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Missing Keywords */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-md space-y-3">
                        <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Key Missing Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedAnalysis.suggestions.missing_skills.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No major missing skills identified.</p>
                          ) : (
                            selectedAnalysis.suggestions.missing_skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-950/50 text-rose-400 border border-rose-500/20"
                              >
                                {skill}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Formatting Tips */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-md space-y-3">
                        <h4 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" /> Structural & Formatting Tips
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {selectedAnalysis.suggestions.formatting_tips.map((tip, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-sky-500 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tailored suggestions if any */}
                    {selectedAnalysis.suggestions.tailored_suggestions && selectedAnalysis.suggestions.tailored_suggestions.length > 0 && (
                      <div className="rounded-xl border border-blue-500/20 bg-slate-950 p-5 shadow-md space-y-3">
                        <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" /> Target Role Customizations
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {selectedAnalysis.suggestions.tailored_suggestions.map((sug, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 border-dashed p-16 bg-slate-950/40 min-h-[400px] text-center space-y-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-full">
                      <FileText className="h-10 w-10 text-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-300">No Analysis Loaded</h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Submit a resume using the input panel to see the AI evaluation and actionable recommendations here.
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
