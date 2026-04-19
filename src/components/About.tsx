import React from 'react';
import { motion } from 'motion/react';
import { SiteContent } from '../types';

export default function About({ content }: { content: SiteContent }) {
  const { about } = content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-12 md:py-24"
    >
      <div className="space-y-24">
        {/* Text Section */}
        <div className="space-y-16">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-0 space-y-10"
          >
            <h3 className="text-[10px] uppercase tracking-[3px] font-bold text-text-secondary border-b border-border pb-5">개인 정보 / PERSONAL INFO</h3>
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[2px] text-text-secondary opacity-60">이름 / NAME</span>
                <div className="flex items-center gap-6">
                  <p className="text-xl md:text-2xl font-light tracking-tight uppercase">{about.name}</p>
                  {about.avatar && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-border shrink-0">
                      <img src={about.avatar} alt={about.name} className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[2px] text-text-secondary opacity-60">이메일 / EMAIL</span>
                <p className="text-xl font-light tracking-tight">{about.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-[10px] uppercase tracking-[4px] text-text-secondary mb-6 block">프로필 / PROFILE</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-12 leading-[1.1] uppercase underline underline-offset-[16px] decoration-border">
              {about.description}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-12 italic opacity-80 border-l-[3px] border-border pl-8 max-w-2xl">
              "{about.bio}"
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

