import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import {
  BookOpen,
  Zap,
  Brain,
  Shield,
  Star,
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ChevronRight,
  Sparkles,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "login" | "signup";
type Role = "student" | "teacher";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

// ─── Feature Pills Data ───────────────────────────────────────────────────────

const FEATURE_PILLS = [
  { label: "Spaced Repetition", icon: Brain, color: "purple" },
  { label: "Adaptive Quizzes", icon: Zap, color: "cyan" },
  { label: "Mind Maps", icon: Sparkles, color: "green" },
  { label: "Answer Grading", icon: Star, color: "amber" },
  { label: "Audio Summaries", icon: BookOpen, color: "rose" },
  { label: "Multilingual Notes", icon: Mail, color: "purple" },
  { label: "Battle Rooms", icon: Shield, color: "cyan" },
  { label: "BKT Mastery", icon: GraduationCap, color: "green" },
] as const;

const PILL_COLOR_MAP = {
  purple: "border-violet-500/30 bg-violet-500/10 text-violet-300 hover:border-violet-400/50 hover:bg-violet-500/20",
  cyan:   "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/20",
  green:  "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/20",
  amber:  "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/20",
  rose:   "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/20",
};

// ─── Stats Data ───────────────────────────────────────────────────────────────

const CARD_STATS = [
  { value: "12+", label: "AI Features" },
  { value: "RAG", label: "Smart Q&A" },
  { value: "SM-2", label: "SRS Algorithm" },
  { value: "ML", label: "Score Predictor" },
];

const BOTTOM_STATS = [
  { value: "9,300+", label: "lines of code" },
  { value: "44", label: "passing tests" },
  { value: "12", label: "AI features" },
  { value: "4", label: "RAGAS metrics" },
];

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastNotification({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-xl",
        toast.type === "success"
          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
          : "bg-rose-500/15 border-rose-500/40 text-rose-200"
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {toast.message}
    </motion.div>
  );
}

// ─── CAPTCHA Helper ───────────────────────────────────────────────────────────

function generateCaptcha(): { a: number; b: number; answer: number } {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

// ─── Input Field Component ────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

function InputField({
  id, type, placeholder, value, onChange, icon: Icon, rightElement, disabled,
}: InputFieldProps) {
  return (
    <div className="relative group">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-violet-500 transition-colors duration-200" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          "input-base !pl-10 !pr-10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        autoComplete="off"
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
  );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("login");

  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Captcha
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");

  // Sign up fields
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [signupLoading, setSignupLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  // ── Login Handler ─────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      addToast("error", "Please enter your username.");
      return;
    }
    if (!loginPassword) {
      addToast("error", "Please enter your password.");
      return;
    }
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      addToast("error", `Incorrect CAPTCHA. ${captcha.a} + ${captcha.b} = ${captcha.answer}`);
      refreshCaptcha();
      return;
    }

    setLoginLoading(true);
    try {
      await login(loginUsername.trim(), loginPassword);
      addToast("success", `Welcome back, ${loginUsername}! 🎉`);
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err: any) {
      addToast("error", err.message || "Login failed. Please check your credentials.");
      refreshCaptcha();
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup Handler ────────────────────────────────────────────────────────

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername.trim()) {
      addToast("error", "Username is required.");
      return;
    }
    if (signupUsername.trim().length < 3) {
      addToast("error", "Username must be at least 3 characters.");
      return;
    }
    if (!signupPassword) {
      addToast("error", "Password is required.");
      return;
    }
    if (signupPassword.length < 6) {
      addToast("error", "Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      addToast("error", "Passwords do not match.");
      return;
    }

    setSignupLoading(true);
    try {
      await register(signupUsername.trim(), signupPassword, selectedRole);
      addToast("success", `Account created! Welcome, ${signupUsername}! 🚀`);
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err: any) {
      addToast("error", err.message || "Registration failed. Try a different username.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center">

      {/* ── Animated Background Orbs ── */}
      <div
        className="blob animate-blob"
        style={{
          background: "radial-gradient(circle, #7C3AED 0%, #06b6d4 60%, transparent 80%)",
          width: "60vw",
          height: "60vw",
          top: "-20%",
          left: "-10%",
          position: "fixed",
          opacity: 0.6,
        }}
      />
      <div
        className="blob animate-blob2"
        style={{
          background: "radial-gradient(circle, #e11d48 0%, #7C3AED 60%, transparent 80%)",
          width: "50vw",
          height: "50vw",
          bottom: "-20%",
          right: "-10%",
          position: "fixed",
          opacity: 0.4,
        }}
      />

      {/* ── Scan Line ── */}
      <div
        className="animate-scan pointer-events-none fixed inset-x-0 h-px z-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5) 40%, rgba(6,182,212,0.5) 60%, transparent)",
        }}
      />

      {/* ── Toast Container ── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastNotification key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-1">

        {/* ── Hero Section (Left Column) ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center lg:text-left space-y-8 w-full"
        >
          {/* Chip Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-xs font-mono text-violet-300 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <span className="tracking-wide">AI-Powered Learning Platform v4.0</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.1]"
          >
            <span className="block text-[var(--text)] mb-2">Master your</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">
              studies with AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[var(--text-muted)] text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            Research-grade study tools powered by{" "}
            <span className="text-violet-400">Hybrid RAG</span>,{" "}
            <span className="text-cyan-400">BKT mastery</span>, and{" "}
            <span className="text-emerald-400">live multiplayer</span>. Outperform your peers effortlessly.
          </motion.p>

          {/* Feature Bento Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="grid grid-cols-2 gap-3 pt-6 lg:pt-10 w-full max-w-lg mx-auto lg:mx-0"
          >
            {FEATURE_PILLS.slice(0, 4).map(({ label, icon: PillIcon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={clsx(
                  "flex flex-col items-start gap-3 p-4 rounded-2xl border cursor-default transition-all duration-300 shadow-lg backdrop-blur-md",
                  PILL_COLOR_MAP[color]
                )}
              >
                <div className="p-2 rounded-xl bg-black/20">
                  <PillIcon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Auth Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
          className="glass-strong rounded-3xl w-full max-w-md mx-auto lg:mx-0 lg:ml-auto overflow-hidden relative backdrop-blur-3xl mt-8 lg:mt-0 border border-white/10"
          style={{
            boxShadow: "0 0 80px rgba(124, 58, 237, 0.3), inset 0 0 40px rgba(255,255,255,0.05)",
          }}
        >
          {/* Card Header Glow */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6) 30%, rgba(6,182,212,0.6) 70%, transparent)",
            }}
          />

          <div className="p-6 md:p-8">
            {/* Tabs */}
            <div className="tab-list mb-6">
              {(["login", "signup"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx("tab-trigger capitalize", activeTab === tab && "active")}
                >
                  {tab === "login" ? "🔑 Login" : "✨ Sign Up"}
                </button>
              ))}
            </div>

            {/* ── LOGIN TAB ── */}
            <AnimatePresence mode="wait">
              {activeTab === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label htmlFor="login-user" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Username
                    </label>
                    <InputField
                      id="login-user"
                      type="text"
                      placeholder="Enter your username"
                      value={loginUsername}
                      onChange={setLoginUsername}
                      icon={User}
                      disabled={loginLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="login-pass" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Password
                    </label>
                    <InputField
                      id="login-pass"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      icon={Lock}
                      disabled={loginLoading}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((p) => !p)}
                          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          tabIndex={-1}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />
                  </div>

                  {/* CAPTCHA */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Security Check
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 font-mono text-sm text-violet-200 select-none min-w-[130px]">
                        <Shield className="w-3.5 h-3.5 text-violet-400" />
                        <span className="font-bold text-[var(--text)]">{captcha.a}</span>
                        <span className="text-[var(--text-muted)]">+</span>
                        <span className="font-bold text-[var(--text)]">{captcha.b}</span>
                        <span className="text-[var(--text-muted)]">=</span>
                        <span className="text-violet-600">?</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Answer"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        disabled={loginLoading}
                        className="input-base w-24 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="p-2.5 rounded-xl glass border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-violet-500/40 transition-all"
                        title="Refresh CAPTCHA"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    disabled={loginLoading}
                    whileTap={{ scale: 0.98 }}
                    className={clsx(
                      "btn-primary w-full mt-2 relative overflow-hidden",
                      loginLoading && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-[var(--text-muted)] mt-1">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signup")}
                      className="text-violet-600 hover:text-violet-500 font-medium transition-colors"
                    >
                      Create one →
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── SIGN UP TAB ── */}
              {activeTab === "signup" && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label htmlFor="signup-user" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Username
                    </label>
                    <InputField
                      id="signup-user"
                      type="text"
                      placeholder="Choose a username"
                      value={signupUsername}
                      onChange={setSignupUsername}
                      icon={User}
                      disabled={signupLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="signup-pass" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Password
                    </label>
                    <InputField
                      id="signup-pass"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a password (min. 6 chars)"
                      value={signupPassword}
                      onChange={setSignupPassword}
                      icon={Lock}
                      disabled={signupLoading}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((p) => !p)}
                          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          tabIndex={-1}
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                    {/* Password strength bar */}
                    {signupPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-1"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((lvl) => {
                            const strength = Math.min(
                              Math.floor(
                                (signupPassword.length >= 12 ? 1 : 0) +
                                (/[A-Z]/.test(signupPassword) ? 1 : 0) +
                                (/[0-9]/.test(signupPassword) ? 1 : 0) +
                                (signupPassword.length >= 6 ? 1 : 0)
                              ),
                              4
                            );
                            return (
                              <div
                                key={lvl}
                                className={clsx(
                                  "h-1 flex-1 rounded-full transition-all duration-300",
                                  lvl <= strength
                                    ? strength <= 1
                                      ? "bg-rose-500"
                                      : strength === 2
                                      ? "bg-amber-400"
                                      : strength === 3
                                      ? "bg-cyan-400"
                                      : "bg-emerald-400"
                                    : "bg-white/10"
                                )}
                              />
                            );
                          })}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {signupPassword.length < 6
                            ? "Too short"
                            : /[A-Z]/.test(signupPassword) && /[0-9]/.test(signupPassword) && signupPassword.length >= 12
                            ? "Strong password 💪"
                            : signupPassword.length >= 8
                            ? "Good password"
                            : "Acceptable"}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="signup-confirm" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <InputField
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={signupConfirm}
                      onChange={setSignupConfirm}
                      icon={Lock}
                      disabled={signupLoading}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                    {signupConfirm && signupPassword && (
                      <p className={clsx("text-xs mt-0.5", signupPassword === signupConfirm ? "text-emerald-400" : "text-rose-400")}>
                        {signupPassword === signupConfirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                      </p>
                    )}
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      I am a…
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["student", "teacher"] as Role[]).map((role) => (
                        <motion.button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          whileTap={{ scale: 0.97 }}
                          className={clsx(
                            "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                            selectedRole === role
                              ? "border-violet-500/60 bg-violet-500/15 text-violet-900"
                              : "border-black/5 bg-black/5 text-[var(--text-muted)] hover:border-black/10 hover:bg-black/5"
                          )}
                        >
                          {role === "student" ? (
                            <GraduationCap className={clsx("w-6 h-6", selectedRole === role ? "text-violet-300" : "text-ink-500")} />
                          ) : (
                            <BookOpen className={clsx("w-6 h-6", selectedRole === role ? "text-cyan-300" : "text-ink-500")} />
                          )}
                          <span className="text-sm font-semibold capitalize">{role}</span>
                          {selectedRole === role && (
                            <motion.div
                              layoutId="role-indicator"
                              className="absolute inset-0 rounded-xl border-2 border-violet-400/60 pointer-events-none"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <motion.button
                    type="submit"
                    disabled={signupLoading}
                    whileTap={{ scale: 0.98 }}
                    className={clsx(
                      "btn-primary w-full mt-2",
                      signupLoading && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating account…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-[var(--text-muted)]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-violet-600 hover:text-violet-500 font-medium transition-colors"
                    >
                      Sign in →
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            {/* ── Card Stats Bar ── */}
            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-4 gap-3">
              {CARD_STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-sm font-bold gradient-text-purple">{value}</div>
                  <div className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5 font-mono">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Bottom Stats Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full lg:col-span-2 glass rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-2xl backdrop-blur-xl border border-white/5 mt-8 lg:mt-16"
        >
          {BOTTOM_STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              className="text-center"
            >
              <div className="text-lg font-bold text-[var(--text)] font-display">{value}</div>
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-mono mt-0.5">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Footer Note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="lg:col-span-2 text-xs text-[var(--text-dim)] font-mono text-center pb-2 w-full mt-4"
        >
          study<span className="text-violet-500">.ai</span> · v4 · Built on Hybrid RAG · BKT · SM-2 · RAGAS
        </motion.p>
      </div>
    </div>
  );
}
