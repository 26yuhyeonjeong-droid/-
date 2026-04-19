import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { cn } from '../lib/utils';

export default function Home({ 
  projects, 
  categories,
  selectedCategory,
  setSelectedCategory
}: { 
  projects: Project[], 
  categories: any[],
  selectedCategory: string | null,
  setSelectedCategory: (cat: string | null) => void
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCategory && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

  const filteredProjects = selectedCategory 
    ? projects.filter(p => p.category === selectedCategory)
    : projects;

  return (
    <div className="py-10 max-w-[1400px] mx-auto min-h-[calc(100vh-200px)] flex flex-col gap-16">
      
      {/* 4 Categories Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 h-auto md:h-[500px]">
        {categories.map((cat, index) => {
          const isActive = selectedCategory === cat.id;
          const categoryImg = cat.img;
          
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              onClick={() => setSelectedCategory(isActive ? null : cat.id)}
              className={`relative cursor-pointer overflow-hidden rounded-[8px] group transition-all duration-700 ${
                selectedCategory && !isActive ? 'opacity-30 scale-[0.98] grayscale' : 'opacity-100 scale-100'
              } ${isActive ? 'ring-2 ring-white/30' : ''}`}
            >
              <img 
                src={categoryImg || null} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'bg-black/40' : 'bg-black/60 group-hover:bg-black/40'}`} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <span className="text-[10px] uppercase tracking-[4px] text-white/50 mb-2">{cat.en}</span>
                <h2 className="text-3xl md:text-3xl font-display font-light tracking-widest text-white uppercase">{cat.ko}</h2>
                <div className={`mt-6 h-[1px] bg-white transition-all duration-700 ${isActive ? 'w-24' : 'w-0 group-hover:w-16'}`} />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="mt-4 text-[10px] uppercase tracking-[2px] text-white/70"
                  >
                    필터링 됨 / FILTERED
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div ref={gridRef} className="space-y-8 scroll-mt-20">
        <div className="flex justify-between items-end border-b border-border pb-6">
          <h3 className="text-[10px] uppercase tracking-[4px] text-text-secondary">
            {selectedCategory ? `${selectedCategory} 아카이브 / ${selectedCategory.toUpperCase()} ARCHIVE` : '전체 작업물 / ALL WORKS'}
          </h3>
          <span className="text-[10px] font-mono text-text-secondary opacity-50">
            {filteredProjects.length} ITEMS
          </span>
        </div>

        <motion.div 
          layout
          className={cn(
            "grid gap-8",
            selectedCategory === '행사사진' 
              ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group cursor-pointer"
              >
                <Link to={`/works/${project.id}`}>
                  {selectedCategory === '행사사진' ? (
                    <div className="aspect-square overflow-hidden rounded-[2px] bg-surface relative">
                      <img 
                        src={project.thumbnail || null} 
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="aspect-[16/10] overflow-hidden rounded-[4px] bg-surface mb-4 relative">
                        <img 
                          src={project.thumbnail || null} 
                          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-[10px] uppercase tracking-widest text-white underline underline-offset-4">자세히 보기 / VIEW CASE</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-display font-light tracking-tight group-hover:text-white transition-colors uppercase">{project.title}</h4>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-[2px] text-text-secondary group-hover:text-white/60 transition-colors">
                          <span>{project.category}</span>
                        </div>
                      </div>
                    </>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-text-secondary italic uppercase tracking-widest text-xs opacity-50">해당 카테고리에 등록된 작업물이 없습니다 / NO PROJECTS FOUND</p>
          </div>
        )}
      </div>

    </div>
  );
}


