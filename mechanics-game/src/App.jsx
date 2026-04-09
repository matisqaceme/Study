import { useState, useMemo, useCallback, useEffect } from 'react';
import questions, { TOPICS, TOPIC_LIST } from './data/questions';
import './App.css';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q) {
  const indices = q.options.map((_, i) => i);
  const shuffled = shuffleArray(indices);
  return {
    ...q,
    options: shuffled.map(i => q.options[i]),
    correct: shuffled.indexOf(q.correct),
    _originalOptions: q.options,
    _originalCorrect: q.correct,
  };
}

function App() {
  const [screen, setScreen] = useState('menu');
  const [selectedTopics, setSelectedTopics] = useState(new Set(TOPIC_LIST));
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [results, setResults] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const startGame = useCallback(() => {
    const filtered = questions.filter(q => selectedTopics.has(q.topic));
    if (filtered.length === 0) return;
    const shuffled = shuffleArray(filtered).map(shuffleOptions);
    setGameQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setScreen('game');
  }, [selectedTopics]);

  const handleAnswer = useCallback((idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const q = gameQuestions[currentIndex];
    const correct = idx === q.correct;
    if (correct) {
      setStreak(prev => {
        const n = prev + 1;
        setBestStreak(b => Math.max(b, n));
        return n;
      });
    } else {
      setStreak(0);
    }
    setResults(prev => [...prev, { question: q, correct, selected: idx }]);
  }, [selectedAnswer, gameQuestions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= gameQuestions.length) {
      setScreen('summary');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowHint(false);
    }
  }, [currentIndex, gameQuestions.length]);

  const toggleTopic = useCallback((topic) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }, []);

  const selectAll = () => setSelectedTopics(new Set(TOPIC_LIST));
  const selectNone = () => setSelectedTopics(new Set());

  const topicPerformance = useMemo(() => {
    const perf = {};
    TOPIC_LIST.forEach(t => { perf[t] = { correct: 0, total: 0 }; });
    results.forEach(r => {
      perf[r.question.topic].total++;
      if (r.correct) perf[r.question.topic].correct++;
    });
    return perf;
  }, [results]);

  const currentQ = gameQuestions[currentIndex];

  // ── MENU SCREEN ──
  if (screen === 'menu') {
    return (
      <div className="app">
        <header className="header">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
            {theme === 'dark' ? '\u2600\ufe0f' : '\u{1F319}'}
          </button>
          <h1>9709 Mechanics</h1>
          <p className="subtitle">Paper 4 Practice Game</p>
        </header>
        <div className="menu-card">
          <h2>Select Topics</h2>
          <div className="topic-actions">
            <button className="btn-small" onClick={selectAll}>All</button>
            <button className="btn-small" onClick={selectNone}>None</button>
          </div>
          <div className="topic-grid">
            {TOPIC_LIST.map(topic => (
              <label key={topic} className={`topic-chip ${selectedTopics.has(topic) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedTopics.has(topic)}
                  onChange={() => toggleTopic(topic)}
                />
                <span>{topic}</span>
              </label>
            ))}
          </div>
          <p className="q-count">{questions.filter(q => selectedTopics.has(q.topic)).length} questions available</p>
          <button
            className="btn-start"
            onClick={startGame}
            disabled={selectedTopics.size === 0}
          >
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  // ── GAME SCREEN ──
  if (screen === 'game' && currentQ) {
    const answered = selectedAnswer !== null;
    return (
      <div className="app">
        <div className="game-header">
          <button className="theme-toggle small" onClick={toggleTheme} title="Toggle light/dark mode">
            {theme === 'dark' ? '\u2600\ufe0f' : '\u{1F319}'}
          </button>
          <div className="progress-info">
            <span className="q-num">Q{currentIndex + 1}/{gameQuestions.length}</span>
            <span className={`topic-badge ${currentQ.difficulty}`}>{currentQ.topic}</span>
            <span className={`diff-badge ${currentQ.difficulty}`}>{currentQ.difficulty}</span>
          </div>
          <div className="streak-display">
            <span className="streak-icon">&#x1F525;</span>
            <span className="streak-num">{streak}</span>
            {bestStreak > 0 && <span className="best-streak">Best: {bestStreak}</span>}
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / gameQuestions.length) * 100}%` }} />
        </div>

        <div className="question-card">
          <div className="question-text">{currentQ.question}</div>

          {!answered && !showHint && (
            <button className="btn-hint" onClick={() => setShowHint(true)}>
              Show Hint
            </button>
          )}
          {showHint && !answered && (
            <div className="hint-box">
              <strong>Hint:</strong> {currentQ.hint}
            </div>
          )}

          <div className="options-grid">
            {currentQ.options.map((opt, idx) => {
              let cls = 'option-btn';
              if (answered) {
                if (idx === currentQ.correct) cls += ' correct';
                else if (idx === selectedAnswer) cls += ' wrong';
                else cls += ' dimmed';
              }
              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="solution-section">
              <div className={`result-banner ${selectedAnswer === currentQ.correct ? 'correct' : 'wrong'}`}>
                {selectedAnswer === currentQ.correct ? 'Correct!' : 'Incorrect'}
              </div>
              <div className="solution-box">
                <h3>Worked Solution</h3>
                <pre className="solution-text">{currentQ.solution}</pre>
              </div>
              <button className="btn-next" onClick={nextQuestion}>
                {currentIndex + 1 >= gameQuestions.length ? 'View Results' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SUMMARY SCREEN ──
  if (screen === 'summary') {
    const totalCorrect = results.filter(r => r.correct).length;
    const pct = results.length > 0 ? Math.round((totalCorrect / results.length) * 100) : 0;
    return (
      <div className="app">
        <header className="header">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
            {theme === 'dark' ? '\u2600\ufe0f' : '\u{1F319}'}
          </button>
          <h1>Session Complete</h1>
        </header>
        <div className="summary-card">
          <div className="score-circle">
            <div className="score-pct">{pct}%</div>
            <div className="score-detail">{totalCorrect}/{results.length}</div>
          </div>
          {bestStreak > 1 && <p className="best-streak-summary">Best streak: {bestStreak} &#x1F525;</p>}

          <h2>Performance by Topic</h2>
          <div className="topic-breakdown">
            {TOPIC_LIST.filter(t => topicPerformance[t].total > 0).map(topic => {
              const p = topicPerformance[topic];
              const topicPct = Math.round((p.correct / p.total) * 100);
              return (
                <div key={topic} className="topic-row">
                  <div className="topic-row-name">{topic}</div>
                  <div className="topic-row-bar-bg">
                    <div
                      className={`topic-row-bar ${topicPct >= 70 ? 'good' : topicPct >= 40 ? 'ok' : 'weak'}`}
                      style={{ width: `${topicPct}%` }}
                    />
                  </div>
                  <div className="topic-row-score">{p.correct}/{p.total}</div>
                </div>
              );
            })}
          </div>

          <h2>Review Answers</h2>
          <div className="review-list">
            {results.map((r, i) => (
              <details key={i} className={`review-item ${r.correct ? 'correct' : 'wrong'}`}>
                <summary>
                  <span className={`review-mark ${r.correct ? 'correct' : 'wrong'}`}>
                    {r.correct ? '\u2713' : '\u2717'}
                  </span>
                  Q{i + 1}: {r.question.topic}
                </summary>
                <div className="review-detail">
                  <p className="review-q">{r.question.question}</p>
                  <p><strong>Your answer:</strong> {r.question.options[r.selected]}</p>
                  <p><strong>Correct answer:</strong> {r.question.options[r.question.correct]}</p>
                  <pre className="solution-text">{r.question.solution}</pre>
                </div>
              </details>
            ))}
          </div>

          <button className="btn-start" onClick={() => setScreen('menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
