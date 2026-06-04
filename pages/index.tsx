import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain, Network, Camera, Trophy, BarChart3, Microscope,
  Code2, Cpu, BookOpen, ArrowRight, Github, Sparkles, Activity,
  CheckCircle2, Layers, Workflow,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// Section components (kept inline for easy review by examiners)
// ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5">
      <div className="flex items-center gap-2 font-mono font-semibold tracking-tight">
        <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <span>study<span className="text-purple-500">.ai</span></span>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-300">
        <a href="#features" className="hover:text-white transition">Features</a>
        <a href="#architecture" className="hover:text-white transition hidden sm:inline">Architecture</a>
        <a href="#research" className="hover:text-white transition hidden md:inline">Research</a>
        <Link
          href="/login"
          className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-white hover:bg-purple-500/30 transition"
        >
          Open app →
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative z-10 px-6 md:px-12 pt-12 md:pt-24 pb-32">
      {/* Ambient blobs */}
      <div className="blob bg-purple-500 top-[10%] -left-20 w-[400px] h-[400px] animate-blob" />
      <div className="blob bg-cyan-500 top-[40%] right-[5%] w-[350px] h-[350px] animate-blob" style={{animationDelay:'2s'}} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-5xl mx-auto"
      >
        {/* Pre-tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono text-slate-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          v4 · Hybrid RAG · BKT · Multimodal · 9,300 LoC
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8">
          <span className="block">Study smarter,</span>
          <span className="block">
            <span className="font-display gradient-text">scientifically</span>.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
          A research-grade study assistant built on three pillars:
          <span className="text-white font-medium"> hybrid retrieval</span>,
          <span className="text-white font-medium"> Bayesian Knowledge Tracing</span>, and
          <span className="text-white font-medium"> live multiplayer learning</span>. Not just another chat-with-PDF tool.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500 text-white font-medium glow-purple hover:scale-105 transition"
          >
            Launch the app
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-white hover:bg-white/5 transition"
          >
            <Sparkles className="w-4 h-4" />
            See what's inside
          </a>
        </div>

        {/* Stats strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "9,300+", l: "lines of code" },
            { n: "44", l: "passing tests" },
            { n: "12", l: "AI features" },
            { n: "4", l: "RAGAS metrics" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              className="border-l-2 border-purple-500/30 pl-4"
            >
              <div className="font-display text-4xl md:text-5xl text-white mb-1">{s.n}</div>
              <div className="text-sm text-slate-400 font-mono uppercase tracking-wider">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Features grid
// ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: "Bayesian Knowledge Tracing",
    desc: "Per-topic mastery estimation using the classical Corbett–Anderson model. Slips and guesses are baked into the math.",
    color: "purple",
    accent: "Corbett & Anderson, 1995",
  },
  {
    icon: Layers,
    title: "Hybrid RAG retrieval",
    desc: "BM25 + dense embeddings fused via Reciprocal Rank Fusion, then re-scored by a cross-encoder. Two-stage, by design.",
    color: "cyan",
    accent: "MiniLM-L6 + ms-marco-MiniLM-L-6",
  },
  {
    icon: Trophy,
    title: "Live quiz battles",
    desc: "Real-time multiplayer rooms with join codes, timed questions, and a speed-bonus leaderboard. No WebSockets needed.",
    color: "amber",
    accent: "st.fragment polling @ 2Hz",
  },
  {
    icon: Microscope,
    title: "RAGAS evaluation dashboard",
    desc: "Faithfulness, answer relevance, context precision, context recall — all computed live, with an A/B comparison vs TF-IDF.",
    color: "green",
    accent: "RAGAS-style LLM-as-judge",
  },
  {
    icon: Camera,
    title: "Snap & Study (multimodal)",
    desc: "Photograph any textbook page or whiteboard. OCR pipeline turns it into flashcards, summaries, or SRS cards instantly.",
    color: "rose",
    accent: "Tesseract + adaptive preprocessing",
  },
  {
    icon: Network,
    title: "Knowledge Graph",
    desc: "Entities and relations extracted from your document, rendered as a force-directed graph colored by your BKT mastery.",
    color: "purple",
    accent: "Custom canvas physics engine",
  },
  {
    icon: Activity,
    title: "Explain-my-mistake",
    desc: "Every wrong answer is diagnosed (factual / conceptual / procedural / careless), explained with source citations, and followed by 2 targeted MCQs.",
    color: "cyan",
    accent: "Cognitive diagnosis from learning science",
  },
  {
    icon: BookOpen,
    title: "Spaced repetition + classroom mode",
    desc: "SM-2 algorithm for flashcards. Teachers create classrooms, share docs, monitor student mastery — all built-in.",
    color: "amber",
    accent: "SuperMemo SM-2 algorithm",
  },
];

const COLORMAP = {
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-300",
  cyan:   "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-300",
  green:  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300",
  amber:  "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300",
  rose:   "from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-300",
};

function Features() {
  return (
    <section id="features" className="relative z-10 px-6 md:px-12 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-500 mb-3">
            ◆ Capabilities
          </div>
          <h2 className="text-4xl md:text-6xl tracking-tight max-w-3xl mb-4">
            Eight features. <span className="font-display gradient-text">Each grounded in research.</span>
          </h2>
          <p className="text-slate-300 max-w-2xl">
            Most study apps are chat-with-PDF wrappers. This one ships with calibrated probability models, two-stage retrieval, and a live evaluation harness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default group`}
              >
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${COLORMAP[f.color as keyof typeof COLORMAP]} border mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{f.desc}</p>
                <div className="text-xs font-mono text-slate-400 border-t border-white/5 pt-3">
                  {f.accent}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Architecture section — visual diagram
// ──────────────────────────────────────────────────────────────────────

function Architecture() {
  return (
    <section id="architecture" className="relative z-10 px-6 md:px-12 py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-500 mb-3">
          ◆ How it fits together
        </div>
        <h2 className="text-4xl md:text-6xl tracking-tight max-w-3xl mb-12">
          The <span className="font-display gradient-text">retrieval pipeline</span>.
        </h2>

        {/* Pipeline diagram */}
        <div className="glass rounded-3xl p-8 md:p-12 overflow-x-auto">
          <div className="flex items-stretch gap-3 min-w-max font-mono text-sm">
            {/* Input */}
            <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-4 min-w-[140px] border border-white/10">
              <BookOpen className="w-6 h-6 mb-2 text-slate-300" />
              <div className="font-semibold text-white">Document</div>
              <div className="text-xs text-slate-400 mt-1">PDF · YouTube · Photo</div>
            </div>

            <Arrow />

            {/* Chunking */}
            <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-4 min-w-[140px] border border-white/10">
              <Layers className="w-6 h-6 mb-2 text-amber-400" />
              <div className="font-semibold text-white">Chunk</div>
              <div className="text-xs text-slate-400 mt-1">1500 chars · overlap</div>
            </div>

            <Arrow />

            {/* Parallel retrieval */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2">
                <span className="text-amber-300 font-bold">BM25</span>
                <span className="text-xs text-slate-400">term match</span>
              </div>
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-2">
                <span className="text-cyan-300 font-bold">Dense</span>
                <span className="text-xs text-slate-400">MiniLM-L6</span>
              </div>
            </div>

            <Arrow />

            <div className="flex flex-col items-center justify-center bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 min-w-[140px]">
              <Workflow className="w-6 h-6 mb-2 text-purple-400" />
              <div className="font-semibold text-purple-300">RRF</div>
              <div className="text-xs text-slate-400 mt-1">k=60</div>
            </div>

            <Arrow />

            <div className="flex flex-col items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 min-w-[140px]">
              <Cpu className="w-6 h-6 mb-2 text-emerald-400" />
              <div className="font-semibold text-emerald-300">Reranker</div>
              <div className="text-xs text-slate-400 mt-1">cross-encoder</div>
            </div>

            <Arrow />

            <div className="flex flex-col items-center justify-center bg-white text-black rounded-xl p-4 min-w-[140px] font-bold">
              <Sparkles className="w-6 h-6 mb-2" />
              <div>Top-4</div>
              <div className="text-xs text-gray-600 mt-1 font-normal">to LLM</div>
            </div>
          </div>
        </div>

        {/* Architecture description */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              h: "Stage 1 — Recall",
              p: "BM25 finds exact term matches (technical vocab, names). Dense embeddings find paraphrases (synonyms, similar concepts). Both run in parallel.",
            },
            {
              h: "Stage 2 — Fusion",
              p: "Reciprocal Rank Fusion (k=60) merges the two rankings without needing score calibration. Whichever retriever ranks a chunk highly, it bubbles up.",
            },
            {
              h: "Stage 3 — Rerank",
              p: "A cross-encoder re-scores the top-20 candidates with full query-chunk attention. Slower, but dramatically more accurate than bi-encoder cosine.",
            },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="font-mono text-xs uppercase tracking-wider text-purple-500 mb-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h4 className="font-semibold text-white mb-2">{s.h}</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <div className="flex items-center px-1">
      <div className="w-8 h-px bg-gradient-to-r from-white/30 to-white/50" />
      <ArrowRight className="w-4 h-4 -ml-1 text-white/50" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Research / methodology section
// ──────────────────────────────────────────────────────────────────────

function Research() {
  return (
    <section id="research" className="relative z-10 px-6 md:px-12 py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-500 mb-3">
          ◆ Methodology
        </div>
        <h2 className="text-4xl md:text-6xl tracking-tight max-w-3xl mb-4">
          Cited. Tested. <span className="font-display gradient-text">Reproducible.</span>
        </h2>
        <p className="text-slate-300 max-w-2xl mb-12">
          Every algorithm choice has a paper behind it and a unit test in front of it.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              t: "Bayesian Knowledge Tracing",
              c: "Corbett & Anderson (1995)",
              d: "P(known) updated via Bayes' rule + learning step. Four parameters: prior, learn, slip, guess. Unit-tested for monotonicity and convergence.",
              link: "https://en.wikipedia.org/wiki/Bayesian_knowledge_tracing",
            },
            {
              t: "Reciprocal Rank Fusion",
              c: "Cormack, Clarke & Buettcher (SIGIR 2009)",
              d: "Standard technique for combining rankings without score calibration. We use k=60 as recommended in the original paper.",
              link: "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf",
            },
            {
              t: "RAGAS evaluation",
              c: "Es et al. (2023)",
              d: "Faithfulness, answer relevance, context precision/recall — implemented as lightweight LLM-as-judge calls without LangChain dependency.",
              link: "https://arxiv.org/abs/2309.15217",
            },
            {
              t: "SM-2 spaced repetition",
              c: "SuperMemo, Wozniak (1985)",
              d: "Classical spaced repetition algorithm. Card difficulty adjusts based on user-reported recall quality, scheduling reviews exponentially.",
              link: "https://en.wikipedia.org/wiki/SuperMemo",
            },
          ].map((r, i) => (
            <a
              key={i}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl p-6 hover:bg-white/5 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-white text-lg">{r.t}</h4>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition" />
              </div>
              <div className="font-mono text-xs text-purple-500 mb-3">{r.c}</div>
              <p className="text-sm text-slate-300 leading-relaxed">{r.d}</p>
            </a>
          ))}
        </div>

        {/* Test status row */}
        <div className="mt-12 glass rounded-2xl p-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <div className="font-mono text-sm text-white">44 tests passing</div>
              <div className="text-xs text-slate-400">CI runs on every push</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10" />
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-cyan-500" />
            <div>
              <div className="font-mono text-sm text-white">Python 3.11+ / 3.12</div>
              <div className="text-xs text-slate-400">Multi-version CI matrix</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10" />
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <div>
              <div className="font-mono text-sm text-white">Coverage on utils/</div>
              <div className="text-xs text-slate-400">BKT · RAG · scoring · KG</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Footer
// ──────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="relative z-10 px-6 md:px-12 py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div className="max-w-md">
            <h3 className="text-3xl md:text-4xl tracking-tight mb-4">
              Final-year project,
              <br />
              <span className="font-display italic text-purple-500">graduate-grade depth.</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Built end-to-end: hybrid RAG, BKT, multimodal OCR, real-time multiplayer, RAGAS evaluation, knowledge graphs, and a tested Docker deployment.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition"
            >
              Open the app <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full glass text-white hover:bg-white/5 transition"
            >
              <Github className="w-4 h-4" /> View source
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-white/5 font-mono text-xs text-slate-400">
          <div>
            study<span className="text-purple-500">.ai</span> · v4 · 9,300 LoC · 44 tests
          </div>
          <div>Built with Streamlit · sentence-transformers · Groq · SQLite</div>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Page assembly
// ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <Features />
      <Architecture />
      <Research />
      <Footer />
    </main>
  );
}
