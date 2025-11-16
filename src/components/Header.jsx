import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Auth from './Auth';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 p-4">
      <nav className="container mx-auto flex items-center justify-between rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl glass-card">
        <Link to="/" className="text-2xl font-bold tracking-tighter font-display bg-gradient-to-r from-light-accent to-light-heading dark:from-dark-button dark:to-dark-accent bg-clip-text text-transparent">
          LunaNotes 🌙
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-light-heading/80 dark:text-dark-glow/80">
          <NavLink to="/output" className={({isActive}) => isActive ? 'font-bold text-light-accent dark:text-dark-button' : 'hover:text-light-accent dark:hover:text-dark-button transition-colors'}>Notes</NavLink>
          <NavLink to="/mindmap" className={({isActive}) => isActive ? 'font-bold text-light-accent dark:text-dark-button' : 'hover:text-light-accent dark:hover:text-dark-button transition-colors'}>Mindmap</NavLink>
          <NavLink to="/chat" className={({isActive}) => isActive ? 'font-bold text-light-accent dark:text-dark-button' : 'hover:text-light-accent dark:hover:text-dark-button transition-colors'}>Chat</NavLink>
          <NavLink to="/history" className={({isActive}) => isActive ? 'font-bold text-light-accent dark:text-dark-button' : 'hover:text-light-accent dark:hover:text-dark-button transition-colors'}>History</NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <Auth />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
