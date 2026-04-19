import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit3, X, Save, LogOut } from 'lucide-react';
import { Project, SiteContent } from '../types';
import { INITIAL_CONTENT } from '../constants';
import { cn } from '../lib/utils';
import { db, auth, loginWithGoogle, logout, doc, setDoc, deleteDoc } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

interface AdminProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
}

export default function Admin({ projects, setProjects, content, setContent }: AdminProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login Error:", err);
      alert("로그인 중 오류가 발생했습니다 / Login Error");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const deleteProject = async (id: string) => {
    if (window.confirm('정말 이 프로젝트를 삭제하시겠습니까? / Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        // State will be updated via onSnapshot in App.tsx
      } catch (err) {
        console.error("Delete Error:", err);
        alert("삭제 중 오류가 발생했습니다 / Delete Error");
      }
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSaving(true);
    try {
      const existingProject = projects.find(p => p.id === editingProject.id);
      const projectToSave = {
        ...editingProject,
        order: (existingProject as any)?.order ?? projects.length
      };
      await setDoc(doc(db, 'projects', editingProject.id), projectToSave);
      setEditingProject(null);
    } catch (err) {
      console.error("Save Error:", err);
      alert("저장 중 오류가 발생했습니다 / Save Error");
    } finally {
      setIsSaving(false);
    }
  };

  const syncGlobalContent = async (updatedContent: SiteContent) => {
    try {
      await setDoc(doc(db, 'content', 'global'), updatedContent);
    } catch (err) {
      console.error("Content Sync Error:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'media') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'thumbnail') {
          setEditingProject(prev => prev ? { ...prev, thumbnail: result } : null);
        } else {
          setEditingProject(prev => prev ? { ...prev, media: [...prev.media, result] } : null);
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const updated = { ...content, about: { ...content.about, avatar: result } };
      setContent(updated);
      syncGlobalContent(updated);
    };
    reader.readAsDataURL(file);
  };

  const createNewProject = () => {
    setEditingProject({
      id: Date.now().toString(),
      title: '',
      description: '',
      type: 'photography',
      thumbnail: '',
      media: [],
      category: '',
    });
  };

  const handleCategoryImgUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const currentCats = content.categories || INITIAL_CONTENT.categories;
      const newCategories = currentCats.map(cat => 
        cat.id === categoryId ? { ...cat, img: result } : cat
      );
      const updated = { ...content, categories: newCategories };
      setContent(updated);
      syncGlobalContent(updated);
    };
    reader.readAsDataURL(file);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(projects, oldIndex, newIndex);
      
      try {
        await Promise.all(reordered.map((p, idx) => 
          setDoc(doc(db, 'projects', p.id), { ...p, order: idx }, { merge: true })
        ));
      } catch (err) {
        console.error("Reorder Save Error:", err);
      }
    }
  };

  const categories = content.categories || INITIAL_CONTENT.categories;

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-[101]">
        <div className="text-white text-[10px] uppercase tracking-[4px] animate-pulse">인증 확인 중 / AUTH CHECKING...</div>
      </div>
    );
  }

  const isAdmin = user && user.email === '26.yuhyeonjeong@gmail.com';

  if (!user || !isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-[320px] text-center"
        >
          <p className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-2.5">시스템 제한됨 / SYSTEM RESTRICTED</p>
          <h2 className="text-2xl font-light tracking-[2px] mb-[30px] uppercase underline underline-offset-8 decoration-white/10">관리자 접속 / ADMIN</h2>
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-black py-[15px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-3"
            >
              구글로 로그인 / GOOGLE LOGIN
            </button>
            {user && !isAdmin && (
              <p className="text-[#ff4444] text-[10px] mt-4 uppercase tracking-widest leading-loose">
                권한이 없는 계정입니다<br/>ACCESS DENIED: {user.email}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-[40px] px-8 md:px-[60px]">
      <div className="flex justify-between items-center mb-12 border-b border-border pb-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight uppercase">대시보드 / DASHBOARD</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-text-secondary text-[10px] uppercase tracking-widest italic opacity-50">{user.email}</p>
            <button onClick={handleLogout} className="text-[9px] uppercase tracking-widest text-text-secondary hover:text-white flex items-center gap-1">
              <LogOut className="w-3 h-3" /> 로그아웃
            </button>
          </div>
        </div>
        <button 
          onClick={createNewProject}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> 프로젝트 추가 / ADD WORK
        </button>
      </div>

      <div className="space-y-16 mb-24">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          {categories.map((cat) => {
            const categoryProjects = projects.filter(p => p.category === cat.id);
            if (categoryProjects.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-light tracking-widest uppercase">{cat.ko} <span className="text-text-secondary">/ {cat.en}</span></h2>
                  <div className="flex-1 h-[1px] bg-border opacity-30"></div>
                </div>

                <SortableContext
                  items={categoryProjects.map(p => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {categoryProjects.map((project) => (
                      <SortableItem 
                        key={project.id} 
                        project={project} 
                        setEditingProject={setEditingProject} 
                        deleteProject={deleteProject} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
          
          {(() => {
            const categorizedIds = categories.map(c => c.id);
            const uncategorized = projects.filter(p => !categorizedIds.includes(p.category));
            if (uncategorized.length === 0) return null;

            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-light tracking-widest uppercase text-yellow-500/50">기타 / UNCATEGORIZED</h2>
                  <div className="flex-1 h-[1px] bg-border opacity-30"></div>
                </div>
                <SortableContext
                  items={uncategorized.map(p => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {uncategorized.map((project) => (
                      <SortableItem 
                        key={project.id} 
                        project={project} 
                        setEditingProject={setEditingProject} 
                        deleteProject={deleteProject} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })()}
        </DndContext>
      </div>

      <div className="border-t border-border pt-16 mb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-light tracking-tight uppercase">소셜 링크 관리 / SOCIAL LINKS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {content.socialLinks
            .filter(link => !link.platform.toLowerCase().includes('vimeo') && !link.platform.includes('비메오'))
            .map((link, index) => {
              const getDisplayName = (platform: string) => {
                const lower = platform.toLowerCase();
                if (lower.includes('인스타그램') || lower === 'instagram') return 'INSTAGRAM';
                if (lower.includes('유튜브') || lower === 'youtube') return 'YOUTUBE';
                return platform.toUpperCase();
              };

              return (
                <div key={index} className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[2px] text-text-secondary block">{getDisplayName(link.platform)}</label>
                  <input 
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...content.socialLinks];
                      const actualIdx = content.socialLinks.findIndex(l => l.platform === link.platform);
                      if (actualIdx !== -1) {
                        newLinks[actualIdx] = { ...newLinks[actualIdx], url: e.target.value };
                        const updated = { ...content, socialLinks: newLinks };
                        setContent(updated);
                        syncGlobalContent(updated);
                      }
                    }}
                    className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-mono text-xs"
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="border-t border-border pt-16 mb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-light tracking-tight uppercase">프로필 페이지 관리 / PROFILE PAGE</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div className="space-y-6">
            <div className="flex gap-8 items-start">
              <div className="shrink-0">
                <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">프로필 사진</label>
                <div className="relative group w-24 h-24">
                  {content.about.avatar && <img src={content.about.avatar} className="w-full h-full object-cover rounded-full border border-border" referrerPolicy="no-referrer" />}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <span className="text-[10px] font-bold text-white">변경</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">이름</label>
                  <input value={content.about.name} onChange={e => syncGlobalContent({ ...content, about: { ...content.about, name: e.target.value }})} className="w-full bg-surface border border-border p-4 outline-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">상세 소개</label>
            <textarea rows={4} value={content.about.bio} onChange={e => syncGlobalContent({ ...content, about: { ...content.about, bio: e.target.value }})} className="w-full bg-surface border border-border p-4 outline-none resize-none" />
          </div>
        </div>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 1, opacity: 1 }} className="bg-bg border border-border w-full max-w-4xl p-10 m-auto relative">
            <button onClick={() => setEditingProject(null)} className="absolute top-8 right-8 text-text-secondary hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest">
              닫기 <X className="w-5 h-5" />
            </button>
            <form onSubmit={saveProject} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <input required value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full bg-surface border border-border p-4 outline-none" placeholder="제목" />
                <select required value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full bg-surface border border-border p-4 outline-none">
                  <option value="">카테고리 선택</option>
                  <option value="중계&음향">중계&음향</option>
                  <option value="홍보영상">홍보영상</option>
                  <option value="뮤직비디오">뮤직비디오</option>
                  <option value="행사사진">행사사진</option>
                </select>
              </div>
              <div className="flex justify-end gap-5">
                <button type="submit" disabled={isSaving} className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SortableItem({ project, setEditingProject, deleteProject }: { project: Project, setEditingProject: any, deleteProject: any, key?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.3 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="bg-surface border border-border p-5 group hover:border-white/20 transition-all relative">
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing z-0" />
      <div className="relative z-10 pointer-events-none flex justify-between items-center">
        <h3 className="font-light truncate uppercase tracking-tight">{project.title}</h3>
        <div className="flex gap-1 pointer-events-auto">
          <button onClick={() => setEditingProject(project)} className="p-2 hover:bg-white/10 text-text-secondary hover:text-white"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => deleteProject(project.id)} className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
