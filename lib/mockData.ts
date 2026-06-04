export const MOCK_MESSAGES = [
  {
    id: '1',
    role: 'assistant' as const,
    content: '👋 Welcome back! Upload a PDF to get started with AI-powered Q&A, quizzes, mind maps, and more.\n\nTry typing:\n- **summarize** — get a smart summary\n- **quiz** — start an adaptive quiz\n- **flashcards** — generate SRS flashcards\n- **mindmap** — build a visual mind map',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];

export const MOCK_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is Bayesian Knowledge Tracing (BKT) primarily used for in educational technology?',
    options: [
      'Grading student essays automatically',
      'Estimating the probability that a student has mastered a skill',
      'Scheduling classroom activities',
      'Generating quiz questions from textbooks',
    ],
    answer: 'Estimating the probability that a student has mastered a skill',
    explanation: 'BKT models use four parameters (prior, learn, slip, guess) to estimate P(known) per topic using Bayes\'s rule.',
    topic: 'Bayesian Knowledge Tracing',
  },
  {
    id: 'q2',
    question: 'Which algorithm is used for spaced repetition in this application?',
    options: ['Leitner System', 'SuperMemo SM-2', 'Anki Algorithm', 'Ebbinghaus Forgetting Curve'],
    answer: 'SuperMemo SM-2',
    explanation: 'SM-2 calculates intervals based on recall quality ratings (0–5) and an ease factor that adjusts difficulty.',
    topic: 'Spaced Repetition',
  },
  {
    id: 'q3',
    question: 'What is Reciprocal Rank Fusion (RRF) used for in hybrid RAG?',
    options: [
      'Generating answers from retrieved context',
      'Merging rankings from multiple retrieval systems without score calibration',
      'Chunking documents into smaller pieces',
      'Evaluating the faithfulness of generated answers',
    ],
    answer: 'Merging rankings from multiple retrieval systems without score calibration',
    explanation: 'RRF (k=60) combines BM25 and dense embedding rankings into a single ranked list.',
    topic: 'Hybrid RAG',
  },
  {
    id: 'q4',
    question: 'In the "explain-my-mistake" feature, which of the following is NOT one of the four misconception categories?',
    options: ['Factual', 'Conceptual', 'Procedural', 'Motivational'],
    answer: 'Motivational',
    explanation: 'The four categories are: factual, conceptual, procedural, and careless — based on standard learning science taxonomy.',
    topic: 'Mistake Engine',
  },
  {
    id: 'q5',
    question: 'Which retrieval method finds exact term matches (like technical vocabulary)?',
    options: ['Dense embeddings', 'BM25', 'Cross-encoder reranker', 'TF-IDF'],
    answer: 'BM25',
    explanation: 'BM25 is a sparse retrieval algorithm that excels at matching exact terms and technical vocabulary.',
    topic: 'Hybrid RAG',
  },
];

export const MOCK_FLASHCARDS = [
  {
    id: 'f1',
    front: 'What does BKT stand for and what does it model?',
    back: 'Bayesian Knowledge Tracing — models the probability P(known) that a student has mastered a knowledge component, using 4 parameters: P(L₀), P(T), P(S), P(G).',
    category: 'Machine Learning',
    difficulty: 'medium' as const,
  },
  {
    id: 'f2',
    front: 'What is the SM-2 algorithm?',
    back: 'A spaced repetition algorithm by SuperMemo that schedules flashcard reviews at exponentially increasing intervals based on recall quality ratings (0–5). The ease factor adjusts difficulty dynamically.',
    category: 'Learning Algorithms',
    difficulty: 'medium' as const,
  },
  {
    id: 'f3',
    front: 'Define Reciprocal Rank Fusion (RRF)',
    back: 'A rank fusion technique that combines multiple ranked lists without requiring score calibration. Formula: RRF(d) = Σ 1/(k + rank(d)) where k=60 is the smoothing constant.',
    category: 'Information Retrieval',
    difficulty: 'hard' as const,
  },
  {
    id: 'f4',
    front: 'What is a cross-encoder reranker?',
    back: 'A model that jointly encodes a query-document pair and scores their relevance. More accurate than bi-encoders but slower — used as the final reranking stage in hybrid RAG.',
    category: 'NLP',
    difficulty: 'hard' as const,
  },
  {
    id: 'f5',
    front: 'What is RAGAS?',
    back: 'A framework for evaluating RAG pipelines using LLM-as-judge metrics: Faithfulness, Answer Relevance, Context Precision, and Context Recall.',
    category: 'Evaluation',
    difficulty: 'easy' as const,
  },
];

export const MOCK_MASTERY_TOPICS = [
  { topic: 'Bayesian Knowledge Tracing', p_known: 0.82, attempts: 15, correct: 12 },
  { topic: 'Hybrid RAG', p_known: 0.74, attempts: 20, correct: 15 },
  { topic: 'Spaced Repetition', p_known: 0.91, attempts: 10, correct: 9 },
  { topic: 'Mistake Engine', p_known: 0.45, attempts: 8, correct: 4 },
  { topic: 'Knowledge Graph', p_known: 0.38, attempts: 12, correct: 5 },
  { topic: 'RAGAS Evaluation', p_known: 0.67, attempts: 9, correct: 6 },
  { topic: 'Cross-encoder Reranking', p_known: 0.29, attempts: 7, correct: 2 },
  { topic: 'SM-2 Algorithm', p_known: 0.88, attempts: 11, correct: 10 },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, username: 'alex_chen', xp: 1840, level: 19, streak: 21 },
  { rank: 2, username: 'priya_sharma', xp: 1620, level: 17, streak: 14 },
  { rank: 3, username: 'kai_nakamura', xp: 1450, level: 15, streak: 9 },
  { rank: 4, username: 'student_demo', xp: 350, level: 4, streak: 7, isMe: true },
  { rank: 5, username: 'sofia_reyes', xp: 290, level: 3, streak: 5 },
  { rank: 6, username: 'james_okonkwo', xp: 210, level: 3, streak: 3 },
  { rank: 7, username: 'yuna_park', xp: 180, level: 2, streak: 2 },
  { rank: 8, username: 'arjun_gupta', xp: 140, level: 2, streak: 1 },
  { rank: 9, username: 'mei_zhang', xp: 90, level: 1, streak: 0 },
  { rank: 10, username: 'carlos_mendez', xp: 60, level: 1, streak: 0 },
];

export const MOCK_ANALYTICS = {
  quizHistory: [
    { date: '2024-01-15', accuracy: 60, questions: 5 },
    { date: '2024-01-16', accuracy: 70, questions: 5 },
    { date: '2024-01-17', accuracy: 65, questions: 5 },
    { date: '2024-01-18', accuracy: 80, questions: 5 },
    { date: '2024-01-19', accuracy: 75, questions: 5 },
    { date: '2024-01-20', accuracy: 85, questions: 5 },
    { date: '2024-01-21', accuracy: 90, questions: 5 },
  ],
  byDifficulty: [
    { difficulty: 'Easy', accuracy: 88 },
    { difficulty: 'Medium', accuracy: 72 },
    { difficulty: 'Hard', accuracy: 54 },
  ],
  totalQuizzes: 35,
  totalCorrect: 26,
  avgAccuracy: 74,
  studySessions: 12,
};

export const ALL_BADGES = [
  { key: 'first_quiz', name: 'Quiz Starter', icon: '🎯', description: 'Complete your first quiz', earned: true },
  { key: 'perfect_score', name: 'Perfect Score', icon: '💯', description: 'Score 100% on a quiz', earned: false },
  { key: 'streak_3', name: 'On Fire', icon: '🔥', description: '3-day study streak', earned: true },
  { key: 'streak_7', name: 'Week Warrior', icon: '⚡', description: '7-day study streak', earned: true },
  { key: 'xp_100', name: 'XP Hunter', icon: '⭐', description: 'Earn 100 XP', earned: true },
  { key: 'xp_500', name: 'XP Master', icon: '🌟', description: 'Earn 500 XP', earned: false },
  { key: 'doc_upload', name: 'Document Master', icon: '📄', description: 'Upload your first document', earned: true },
  { key: 'flashcard_10', name: 'Card Collector', icon: '📇', description: 'Review 10 SRS cards', earned: false },
  { key: 'notes_gen', name: 'Note Taker', icon: '📝', description: 'Generate study notes', earned: true },
  { key: 'mindmap_gen', name: 'Mind Mapper', icon: '🧠', description: 'Create a mind map', earned: false },
  { key: 'plan_gen', name: 'Planner', icon: '📅', description: 'Create a study plan', earned: false },
  { key: 'audio_upload', name: 'Audio Learner', icon: '🎙️', description: 'Summarize an audio lecture', earned: false },
  { key: 'answer_graded', name: 'Free Thinker', icon: '✍️', description: 'Get a free-text answer graded', earned: false },
  { key: 'multi_doc', name: 'Multi-Scholar', icon: '📚', description: 'Use multi-document RAG', earned: false },
  { key: 'level_5', name: 'Level 5', icon: '🏅', description: 'Reach level 5', earned: false },
  { key: 'level_10', name: 'Level 10', icon: '🏆', description: 'Reach level 10', earned: false },
];

export const MOCK_SRS_CARDS = [
  { id: 1, front: 'What is P(L₀) in BKT?', back: 'The prior probability that a student knows a skill before any practice.', category: 'BKT', difficulty: 'medium', nextReview: 'Today', interval: 1, repetitions: 0 },
  { id: 2, front: 'What does "slip" mean in BKT?', back: 'P(S) — probability of answering incorrectly despite knowing the skill.', category: 'BKT', difficulty: 'easy', nextReview: 'Today', interval: 3, repetitions: 2 },
  { id: 3, front: 'What is Reciprocal Rank Fusion?', back: 'A score-free rank fusion technique: RRF(d) = Σ 1/(k + rank(d)), k=60.', category: 'RAG', difficulty: 'hard', nextReview: 'Today', interval: 1, repetitions: 0 },
  { id: 4, front: 'Define "faithfulness" in RAGAS', back: 'The fraction of claims in the generated answer that are supported by the retrieved context.', category: 'Evaluation', difficulty: 'medium', nextReview: 'Tomorrow', interval: 7, repetitions: 3 },
  { id: 5, front: 'What SM-2 quality rating means "perfect recall"?', back: 'Quality 5 — correct response with no hesitation.', category: 'SRS', difficulty: 'easy', nextReview: 'Today', interval: 1, repetitions: 1 },
];
