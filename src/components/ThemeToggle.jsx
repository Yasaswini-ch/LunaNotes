import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🤍' : '💗'}
    </button>
  );
};

export default ThemeToggle;
