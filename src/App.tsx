/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, SiteContent } from './types';
import { INITIAL_PROJECTS, INITIAL_CONTENT } from './constants';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProjectDetail from './components/ProjectDetail';
import About from './components/About';
import Admin from './components/Admin';
import Footer from './components/Footer';
import { db, collection, onSnapshot, doc, getDoc, setDoc } from './lib/firebase';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(true);

  // Safety timer for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timed out. Proceeding to app...");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds fallback
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Sync projects from Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
        if (!snapshot.empty) {
          const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
          const sorted = [...projectsData].sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
          setProjects(sorted);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Firestore Projects Sync Error:", error);
        setIsLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.error("Firebase Projects initiation error:", e);
      setIsLoading(false);
    }
  }, []);

  // Sync site content from Firestore (refactored to split documents)
  useEffect(() => {
    try {
      const unsubAbout = onSnapshot(doc(db, 'content', 'about'), (snapshot) => {
        if (snapshot.exists()) {
          setContent(prev => ({ ...prev, about: { ...prev.about, ...snapshot.data() } as any }));
        }
      });

      const unsubSocial = onSnapshot(doc(db, 'content', 'social'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          if (data.links) {
            setContent(prev => ({ ...prev, socialLinks: data.links }));
          }
        }
      });

      const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
        if (!snapshot.empty) {
          const cats = snapshot.docs.map(doc => doc.data() as any);
          setContent(prev => ({ ...prev, categories: cats }));
        }
      });

      // Fallback for migration: still listen to global if any part is missing
      const unsubGlobal = onSnapshot(doc(db, 'content', 'global'), (snapshot) => {
        if (snapshot.exists()) {
          const globalData = snapshot.data() as SiteContent;
          if (!globalData) return;
          
          setContent(prev => {
            const newAbout = (!prev.about.avatar || prev.about.avatar === INITIAL_CONTENT.about.avatar) && globalData.about?.avatar ? globalData.about : prev.about;
            const newSocial = prev.socialLinks.length <= 2 && globalData.socialLinks?.length > 0 ? globalData.socialLinks : prev.socialLinks;
            const newCats = (!prev.categories || prev.categories.length <= 4) && globalData.categories?.length > 0 ? globalData.categories : prev.categories;
            return {
              ...prev,
              about: newAbout || prev.about,
              socialLinks: newSocial || prev.socialLinks,
              categories: newCats || prev.categories
            };
          });
        }
      });

      return () => {
        unsubAbout();
        unsubSocial();
        unsubCategories();
        unsubGlobal();
      };
    } catch (e) {
      console.error("Firebase Content initiation error:", e);
    }
  }, []);

  // Initialize DB with default values if empty (optional but helpful for first run)
  useEffect(() => {
    const initDb = async () => {
      try {
        const contentDoc = await getDoc(doc(db, 'content', 'global'));
        if (!contentDoc.exists()) {
          await setDoc(doc(db, 'content', 'global'), INITIAL_CONTENT);
        }
      } catch (e) {
        console.warn("Could not initialize DB. Permissions might be restricted.");
      }
    };
    initDb();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-[10px] uppercase tracking-[4px] animate-pulse">Syncing Archive...</div>
      </div>
    );
  }

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

