import React from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { SiteContent } from '../types';

export default function Footer({ name, socialLinks }: { name: string, socialLinks: SiteContent['socialLinks'] }) {
  const getIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('인스타그램') || lower.includes('instagram')) return <Instagram className="w-3.5 h-3.5" />;
    if (lower.includes('유튜브') || lower.includes('youtube')) return <Youtube className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <footer className="py-[30px] px-8 md:px-[60px] border-t border-border mt-20 flex flex-col md:flex-row justify-between items-center transition-all bg-bg">
      <div className="flex gap-8 mb-4 md:mb-0">
        {(socialLinks || [])
          .filter(link => link && link.platform && typeof link.platform === 'string' && !link.platform.toLowerCase().includes('vimeo') && !link.platform.includes('비메오'))
          .map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[12px] text-text-secondary hover:text-text-primary transition-colors tracking-tight"
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                {getIcon(link.platform)}
              </span>
              {link.platform}
            </a>
          ))}
      </div>


      <div className="text-[11px] text-text-secondary tracking-widest uppercase opacity-70">
        &copy; {new Date().getFullYear()} {name || 'DIGITAL GALLERY'}. ALL RIGHTS RESERVED.
      </div>

    </footer>
  );
}

