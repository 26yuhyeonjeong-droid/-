import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar({ name, onHomeClick }: { name: string, onHomeClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + F10 or Cmd + F10
      // Adding Shift + Ctrl + A as a backup because some browsers block F10
      const isF10 = e.key === 'F10';
      const isAdminKey = (e.key === 'a' || e.key === 'A') && e.shiftKey;
      
      if ((e.ctrlKey || e.metaKey) && (isF10 || isAdminKey)) {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Reset category filter if provided
    if (onHomeClick) {
      onHomeClick();
    }
    
    // Hidden feature: Click name 5 times to go to admin
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        navigate('/admin');
        return 0;
      }
      return next;
    });

    // Reset count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  const links = [
    { name: '프로젝트 / PROJECTS', path: '/' },
    { name: '프로필 / PROFILE', path: '/about' },
  ];


  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-bg/80 backdrop-blur-sm border-b border-border py-10 px-8 md:px-[60px] flex justify-between items-center transition-all">
      <Link 
        to="/" 
        onClick={handleLogoClick}
        className="text-[18px] font-bold tracking-[2px] uppercase hover:opacity-70 transition-opacity"
      >
        {name || 'GALLERY'}.
      </Link>
      
      <ul className="flex gap-10 items-center">
        {links.map((link) => (
          <li key={link.path}>
            <Link 
              to={link.path}
              onClick={() => {
                if (link.path === '/' && onHomeClick) {
                  onHomeClick();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={cn(
                "text-[14px] uppercase tracking-[1px] font-medium transition-colors",
                location.pathname === link.path ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

