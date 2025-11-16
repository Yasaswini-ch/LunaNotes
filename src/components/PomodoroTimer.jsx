import { useEffect, useMemo, useState } from 'react';

const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
};

const DEFAULT_PHASES = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const PomodoroTimer = () => {
  const [settings, setSettings] = useState(DEFAULT_PHASES);
  const [phase, setPhase] = useState('focus');
  const [cycleCount, setCycleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);

  const nextPhase = (currentPhase, count) => {
    if (currentPhase === 'focus') {
      if ((count + 1) % 4 === 0) {
        return 'longBreak';
      }
      return 'shortBreak';
    }
    return 'focus';
  };

  useEffect(() => {
    setTimeLeft(settings[phase] * 60);
  }, [settings, phase]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const next = nextPhase(phase, cycleCount);
          if (phase === 'focus') {
            setCycleCount((count) => count + 1);
          }
          setPhase(next);
          return settings[next] * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, cycleCount, phase, settings]);

  const progress = useMemo(() => {
    const total = settings[phase] * 60;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, settings, phase]);

  const handleInputChange = (key, value) => {
    const minutes = Math.max(1, Math.min(60, Number(value) || 0));
    setSettings((prev) => ({ ...prev, [key]: minutes }));
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('focus');
    setCycleCount(0);
    setTimeLeft(settings.focus * 60);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <p className="uppercase tracking-wide text-xs text-light-heading/70 dark:text-dark-glow/60">
          Pomodoro Timer
        </p>
        <h2 className="text-3xl font-display font-bold text-light-heading dark:text-dark-glow">
          {phase === 'focus' ? 'Deep Focus' : phase === 'shortBreak' ? 'Micro Break' : 'Long Recharge'}
        </h2>
      </div>

      <div className="text-center space-y-3">
        <div className="text-6xl font-mono font-semibold">{formatTime(timeLeft)}</div>
        <div className="w-full bg-white/20 dark:bg-black/30 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-light-accent to-light-heading dark:from-dark-button dark:to-dark-accent transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-light-heading/80 dark:text-dark-glow/80">
          Completed focus rounds: <span className="font-semibold">{cycleCount}</span>
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          className="px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-light-accent to-light-heading dark:from-dark-button dark:to-dark-accent"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-full font-semibold border border-light-accent/60 dark:border-dark-button/60"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Focus (min)', key: 'focus' },
          { label: 'Short Break', key: 'shortBreak' },
          { label: 'Long Break', key: 'longBreak' },
        ].map(({ label, key }) => (
          <label key={key} className="flex flex-col gap-2 text-sm font-semibold">
            <span>{label}</span>
            <input
              type="number"
              min="1"
              max="60"
              value={settings[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="rounded-xl border border-light-accent/40 dark:border-dark-button/40 bg-white/40 dark:bg-black/20 px-3 py-2 focus:outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default PomodoroTimer;
