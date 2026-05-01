import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import { getEmbedUrl } from '../lib/video';

export default function ProjectDetail({ projects, selectedCategory }: { projects: Project[], selectedCategory: string | null }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Filter projects by category if a category is selected
  const filteredProjects = selectedCategory 
    ? projects.filter(p => p.category === selectedCategory)
    : projects;

  const currentIndex = filteredProjects.findIndex(p => p.id === id);
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-2xl font-light uppercase tracking-widest text-text-secondary">항목을 찾을 수 없습니다 / ENTRY NOT FOUND.</p>
        <button onClick={() => navigate('/')} className="text-sm uppercase tracking-widest border border-border px-6 py-2 hover:bg-white hover:text-black transition-all">
          홈으로 돌아가기 / RETURN HOME
        </button>
      </div>
    );
  }

  const prevProject = currentIndex > 0 ? filteredProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < filteredProjects.length - 1 ? filteredProjects[currentIndex + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto py-12"
    >
      {/* Header Info */}
      <div className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end border-b border-border pb-16">
        <div className="lg:col-span-9">
          <Link to="/" className="inline-flex items-center text-[10px] uppercase tracking-[4px] text-text-secondary hover:text-white mb-10 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" /> 아카이브로 돌아가기 / BACK TO ARCHIVE
          </Link>
          <span className="text-[10px] uppercase tracking-[4px] text-text-secondary mb-4 block opacity-50">프로젝트 상세 정보 / PROJECT SPECIFICATION</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-light tracking-tight leading-[1.1] mb-8 uppercase">
            {project.title}
          </h1>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl font-light leading-relaxed border-l border-border pl-8 opacity-60">
            {project.description}
          </p>
        </div>
        
        <div className="lg:col-span-3 pb-4 space-y-6 bg-surface p-8 border border-border rounded-[2px]">
          <div>
            <span className="text-[10px] uppercase tracking-[2px] text-text-secondary block mb-1 opacity-50">분류 / CLASSIFICATION</span>
            <span className="text-xs font-medium tracking-[1px] uppercase">{project.category}</span>
          </div>
          {project.client && (
            <div>
              <span className="text-[10px] uppercase tracking-[2px] text-text-secondary block mb-1 opacity-50">클라이언트 / CLIENT</span>
              <span className="text-xs font-medium tracking-[1px] uppercase leading-tight block">{project.client}</span>
            </div>
          )}
          {project.equipment && (
            <div>
              <span className="text-[10px] uppercase tracking-[2px] text-text-secondary block mb-1 opacity-50">장비 / PRODUCTION GEAR</span>
              <span className="text-xs font-medium tracking-[1px] uppercase leading-tight block">{project.equipment}</span>
            </div>
          )}
        </div>
      </div>

      {/* Media Content */}
      <div className="space-y-16 mb-24">
        {project.media.map((url, index) => {
          if (!url) return null;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full relative group overflow-hidden rounded-[4px] border border-border"
            >
              {url.startsWith('data:video') ? (
                <div className="aspect-video w-full bg-surface">
                  <video
                    src={url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('drive.google.com') ? (
                <div className="aspect-video w-full bg-surface">
                  <iframe
                    src={getEmbedUrl(url)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative overflow-hidden aspect-[3/2] bg-surface">
                  <img
                    src={url || null}
                    alt={`${project.title} media ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <button 
                    onClick={() => window.open(url, '_blank')}
                    className="absolute bottom-6 right-6 p-4 bg-black/80 backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Flow */}
      <div className="py-24 border-t border-border flex justify-between items-center px-4">
        <div className="flex-1">
          {prevProject && (
            <Link 
              to={`/works/${prevProject.id}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group flex flex-col items-start gap-4 transition-all"
            >
              <span className="text-[10px] uppercase tracking-[4px] text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity">이전 프로젝트 / PREV</span>
              <div className="flex items-center gap-4">
                <ChevronLeft className="w-6 h-6 text-text-secondary group-hover:text-white transition-colors" />
                <span className="text-lg md:text-xl font-light tracking-tight group-hover:underline underline-offset-8 uppercase">{prevProject.title}</span>
              </div>
            </Link>
          )}
        </div>

        <div className="flex-1 flex justify-end">
          {nextProject && (
            <Link 
              to={`/works/${nextProject.id}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group flex flex-col items-end gap-4 transition-all text-right"
            >
              <span className="text-[10px] uppercase tracking-[4px] text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity">다음 프로젝트 / NEXT</span>
              <div className="flex items-center gap-4 text-right">
                <span className="text-lg md:text-xl font-light tracking-tight group-hover:underline underline-offset-8 uppercase">{nextProject.title}</span>
                <ChevronRight className="w-6 h-6 text-text-secondary group-hover:text-white transition-colors" />
              </div>
            </Link>
          )}
        </div>
      </div>

    </motion.div>
  );
}

