/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Project, SiteContent } from './types';
import { INITIAL_PROJECTS, INITIAL_CONTENT } from './constants';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProjectDetail from './components/ProjectDetail';
import About from './components/About';
import Admin from './components/Admin';
import Footer from './components/Footer';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('portfolio_projects');
    const data = saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    
    // Migration: Add new sample projects if they are missing
    INITIAL_PROJECTS.forEach(initialProject => {
      if (!data.find((p: Project) => p.id === initialProject.id)) {
        data.push(initialProject);
      }
    });

    // Migration: Rename '중계' to '중계&음향' in projects
    data.forEach((p: Project) => {
      if (p.category === '중계') {
        p.category = '중계&음향';
      }
    });
    
    return data;
  });

  const [content, setContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem('portfolio_content');
    const data = saved ? JSON.parse(saved) : INITIAL_CONTENT;
    
    // Migration: Ensure '행사사진' category exists
    if (data.categories) {
      const hasEventCat = data.categories.some((c: any) => c.id === '행사사진');
      if (!hasEventCat) {
        const eventCat = INITIAL_CONTENT.categories?.find(c => c.id === '행사사진');
        if (eventCat) {
          data.categories.push(eventCat);
        }
      }
      
      // Migration: Sync all category English labels
      data.categories.forEach((cat: any) => {
        const initialCat = INITIAL_CONTENT.categories?.find(c => c.id === cat.id);
        if (initialCat) {
          cat.en = initialCat.en;
        }
      });
    }
    return data;
  });

  useEffect(() => {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('portfolio_content', JSON.stringify(content));
  }, [content]);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
        <Navbar name={content.about.name} onHomeClick={() => setSelectedCategory(null)} />
        
        <main className="pt-20 px-4 md:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Home 
                    projects={projects} 
                    categories={content.categories || INITIAL_CONTENT.categories} 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                </motion.div>
              } />
              <Route path="/works/:id" element={<ProjectDetail projects={projects} selectedCategory={selectedCategory} />} />
              <Route path="/about" element={<About content={content} />} />
              <Route path="/admin" element={<Admin projects={projects} setProjects={setProjects} content={content} setContent={setContent} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer name={content.about.name} socialLinks={content.socialLinks} />
      </div>
    </Router>
  );
}

