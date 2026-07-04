import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  MessageCircle,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { careerApi, InterviewMessage, InterviewSessionInfo } from "@/lib/career-api";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export function AIChatPage() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<InterviewSessionInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [history, setHistory] = useState<InterviewMessage[]>([]);
  const [roleTarget, setRoleTarget] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<{score: number, feedback: string} | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function selectSession(sessionId: number) {
    setCurrentSessionId(sessionId);
    setLoading(true);
    setLastEvaluation(null);
    setIsFinished(false);
    try {
      const sessionData = await careerApi.getInterviewSession(sessionId);
      setHistory(sessionData.history);
      // Grab role target from the first message
      const targetSess = sessions.find((s) => s.id === sessionId);
      if (targetSess) {
        setRoleTarget(targetSess.role);
      }
    } catch (e) {
      console.error("Failed to load session details:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions() {
    try {
      const sessList = await careerApi.getInterviewSessions();
      setSessions(sessList);
      if (sessList.length > 0) {
        selectSession(sessList[0].id);
      }
    } catch (e) {
      console.error("Failed to load interview sessions:", e);
    }
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    if (!roleTarget.trim()) return;

    setCreating(true);
    try {
      // Send an empty message to initialize the interview session
      const result = await careerApi.sendInterviewMessage(roleTarget, "Hello! I am ready to start the interview.");
      setCurrentSessionId(result.session_id);
      setHistory(result.history);
      
      const newSess: InterviewSessionInfo = {
        id: result.session_id,
        role: roleTarget,
        created_at: new Date().toISOString()
      };
      setSessions((prev) => [newSess, ...prev]);
      setRoleTarget("");
    } catch (e) {
      console.error("Failed to start new interview session:", e);
    } finally {
      setCreating(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !currentSessionId || isFinished) return;

    const userMsg = messageText;
    setMessageText("");

    // Append user message instantly for responsive feel
    setHistory((prev) => [...prev, { role: "user", content: userMsg }]);

    setLoading(true);
    try {
      const activeSess = sessions.find((s) => s.id === currentSessionId);
      const roleStr = activeSess ? activeSess.role : "General";
      const result = await careerApi.sendInterviewMessage(roleStr, userMsg, currentSessionId);
      setHistory(result.history);
      if (result.evaluation) setLastEvaluation(result.evaluation);
      if (result.is_finished) setIsFinished(true);
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 lg:grid lg:grid-cols-[18rem_1fr]">
      <DashboardSidebar />
      <div className="min-w-0 flex flex-col h-screen">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-5 md:px-8 flex-shrink-0">
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

        <div className="flex-1 min-h-0 grid lg:grid-cols-4 bg-slate-900">
          {/* Interview List Panel */}
          <div className="lg:col-span-1 border-r border-slate-800 p-4 space-y-4 flex flex-col min-h-0 bg-slate-950/40">
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Mock Interviews</h2>
              <form onSubmit={handleCreateSession} className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter target role..."
                  required
                  value={roleTarget}
                  onChange={(e) => setRoleTarget(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                />
                <Button
                  type="submit"
                  disabled={creating || !roleTarget.trim()}
                  className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg border-0 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> {creating ? "Starting..." : "Start Interview"}
                </Button>
              </form>
            </div>

            <hr className="border-slate-800" />

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => selectSession(sess.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                    currentSessionId === sess.id
                      ? "bg-purple-950/40 border-purple-500/50 text-white"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold truncate">{sess.role}</p>
                    <p className="text-[9px] text-slate-500">{new Date(sess.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-40" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3 flex flex-col min-h-0 bg-slate-900">
            {currentSessionId ? (
              <>
                {/* Session Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex items-center gap-3 flex-shrink-0">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      {sessions.find((s) => s.id === currentSessionId)?.role} Interview
                    </h3>
                    <p className="text-[10px] text-slate-500">AI Mock Interview session</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                  {history.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-purple-950 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-950 border border-slate-800 text-slate-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 max-w-xl">
                      <div className="h-8 w-8 rounded-full bg-purple-950 text-purple-400 border border-purple-500/20 flex items-center justify-center text-xs flex-shrink-0 animate-pulse">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="rounded-xl p-3.5 text-xs bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  {lastEvaluation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-4 bg-slate-950 border border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-300">Answer Feedback</span>
                        <span className="font-bold text-purple-400">Score: {lastEvaluation.score}/10</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{lastEvaluation.feedback}</p>
                    </motion.div>
                  )}
                  {isFinished && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-4 bg-purple-950/20 border border-purple-500/30 text-center text-sm font-bold text-purple-300"
                    >
                      Interview Finished!
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 pt-4 pb-2 border-t border-slate-800 bg-slate-950/20 flex-shrink-0 space-y-2">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !messageText.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 border-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <p className="text-[10px] text-slate-500 text-center pb-1">
                    ✦ Answers are based on CareerPilot AI knowledge base. Please verify important information.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-full">
                  <MessageSquare className="h-10 w-10 text-slate-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-300">No Active Interview</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Select a previous mock interview session from the list, or enter a target role to kickstart a brand new session.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
