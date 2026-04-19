import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import { Project, SiteContent } from '../types';
import { INITIAL_CONTENT } from '../constants';
import { cn } from '../lib/utils';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '5283') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const deleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const saveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    if (projects.find(p => p.id === editingProject.id)) {
      setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
    } else {
      setProjects([...projects, editingProject]);
    }
    setEditingProject(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'media') => {
    const files = e.target.files;
    if (!files) return;

    // In a real app with a backend, we would upload to storage (S3, Firebase, etc.)
    // Here we use FileReader to create a local Data URL for preview/local persistence
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
      setContent(prev => ({ ...prev, about: { ...prev.about, avatar: result } }));
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
      setContent({ ...content, categories: newCategories });
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((p) => p.id === active.id);
        const newIndex = items.findIndex((p) => p.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const categories = content.categories || INITIAL_CONTENT.categories;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-[320px] text-center"
        >
          <p className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-2.5">시스템 제한됨 / SYSTEM RESTRICTED</p>
          <h2 className="text-2xl font-light tracking-[2px] mb-[30px] uppercase underline underline-offset-8 decoration-white/10">관리자 접속 / ADMIN</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border p-[15px] text-white text-center text-[18px] tracking-[4px] outline-none focus:border-white/30 transition-all font-mono"
              autoFocus
            />
            {error && <p className="text-[#ff4444] text-[12px]">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-white text-black py-[15px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
            >
              로그인하기 / LOGIN
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-[40px] px-8 md:px-[60px]">
      <div className="flex justify-between items-center mb-12 border-b border-border pb-10">
        <div>
          <h1 className="text-3xl font-light tracking-tight uppercase">대시보드 / DASHBOARD</h1>
          <p className="text-text-secondary text-xs mt-2 uppercase tracking-widest italic opacity-50">콘텐츠 관리 인터페이스 / MANAGEMENT INTERFACE</p>
        </div>
        <button 
          onClick={createNewProject}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> 프로젝트 추가 / ADD WORK
        </button>
      </div>

      {/* Project Management Divided by Category */}
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
          
          {/* Uncategorized or others if any */}
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

      {/* Social Links Management */}
      <div className="border-t border-border pt-16 mb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-light tracking-tight uppercase">소셜 링크 관리 / SOCIAL LINKS</h2>
          <p className="text-text-secondary text-xs mt-2 uppercase tracking-widest italic opacity-50">푸터의 소셜 미디어 링크를 설정합니다</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {content.socialLinks
            .filter(link => !link.platform.toLowerCase().includes('vimeo') && !link.platform.includes('비메오'))
            .map((link, index) => (
              <div key={index} className="space-y-3">
                <label className="text-[10px] uppercase tracking-[2px] text-text-secondary block">{link.platform}</label>
                <input 
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...content.socialLinks];
                    // Find actual index in original content for setContent
                    const actualIdx = content.socialLinks.findIndex(l => l.platform === link.platform);
                    if (actualIdx !== -1) {
                      newLinks[actualIdx] = { ...newLinks[actualIdx], url: e.target.value };
                      setContent({ ...content, socialLinks: newLinks });
                    }
                  }}
                  className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-mono text-xs"
                  placeholder={`${link.platform} URL`}
                />
              </div>
            ))}
        </div>

      </div>

      {/* Profile Page Management */}
      <div className="border-t border-border pt-16 mb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-light tracking-tight uppercase">프로필 페이지 관리 / PROFILE PAGE</h2>
          <p className="text-text-secondary text-xs mt-2 uppercase tracking-widest italic opacity-50">프로필 페이지의 개인 정보 및 경력을 관리합니다</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div className="space-y-6">
            <div className="flex gap-8 items-start">
              <div className="shrink-0">
                <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">프로필 사진 / AVATAR</label>
                <div className="relative group w-24 h-24">
                  {content.about.avatar ? (
                    <img src={content.about.avatar} className="w-full h-full object-cover rounded-full border border-border grayscale" alt="Avatar Preview" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-surface border border-border flex items-center justify-center text-[10px] text-text-secondary">NO IMG</div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <span className="text-[10px] font-bold text-white">변경</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">이름 / NAME</label>
                  <input 
                    value={content.about.name}
                    onChange={e => setContent({ ...content, about: { ...content.about, name: e.target.value }})}
                    className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">이메일 / EMAIL</label>
                  <input 
                    value={content.about.email}
                    onChange={e => setContent({ ...content, about: { ...content.about, email: e.target.value }})}
                    className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">한 줄 소개 / DESCRIPTION</label>
              <input 
                value={content.about.description}
                onChange={e => setContent({ ...content, about: { ...content.about, description: e.target.value }})}
                className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">상세 소개 / BIO</label>
              <textarea 
                rows={4}
                value={content.about.bio}
                onChange={e => setContent({ ...content, about: { ...content.about, bio: e.target.value }})}
                className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light resize-none h-[184px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="border-t border-border pt-16 mb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-light tracking-tight uppercase">카테고리 관리 / CATEGORY MANAGEMENT</h2>
          <p className="text-text-secondary text-xs mt-2 uppercase tracking-widest italic opacity-50">홈 화면의 3가지 카테고리 썸네일을 관리합니다</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(content.categories || INITIAL_CONTENT.categories).map((cat) => (
            <div key={cat.id} className="space-y-4 bg-surface p-6 border border-border">
              <div className="aspect-[16/10] overflow-hidden relative group">
                <img src={cat.img || null} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200">
                    변경 / CHANGE
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleCategoryImgUpload(e, cat.id)} 
                    />
                  </label>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-light uppercase tracking-widest">{cat.ko}</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-[2px]">{cat.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal Overlay */}
      {editingProject && (
        <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg border border-border w-full max-w-4xl p-10 m-auto relative"
          >
            <button onClick={() => setEditingProject(null)} className="absolute top-8 right-8 text-text-secondary hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest">
              닫기 / CLOSE <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-light tracking-tight mb-10 pb-4 border-b border-border uppercase">시스템 항목 수정 / EDIT ENTRY</h2>
            
            <form onSubmit={saveProject} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">항목 제목</label>
                    <input 
                      required
                      value={editingProject.title} 
                      onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                      className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">분류 / CATEGORY</label>
                    <select 
                      required
                      value={editingProject.category} 
                      onChange={e => setEditingProject({...editingProject, category: e.target.value})}
                      className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light text-white"
                    >
                      <option value="">카테고리 선택 / SELECT</option>
                      <option value="중계&음향">중계&음향 (Live Production)</option>
                      <option value="홍보영상">홍보영상 (Promotional Video)</option>
                      <option value="뮤직비디오">뮤직비디오 (Music Video)</option>
                      <option value="행사사진">행사사진 (Event Photography)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">사용 장비 / PRODUCTION GEAR</label>
                    <input 
                      value={editingProject.equipment || ''} 
                      onChange={e => setEditingProject({...editingProject, equipment: e.target.value})}
                      className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light"
                      placeholder="예: Sony FX9, ARRI Alexa Mini"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">미디어 유형</label>
                      <select 
                        value={editingProject.type} 
                        onChange={e => setEditingProject({...editingProject, type: e.target.value as any})}
                        className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light text-white"
                      >
                        <option value="photography">사진 (Still Imagery)</option>
                        <option value="video">영상 (Motion Array)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">썸네일 이미지 업로드</label>
                    <div className="space-y-4">
                      {editingProject.thumbnail && (
                        <img src={editingProject.thumbnail || null} className="w-20 h-20 object-cover border border-border" alt="Thumbnail Preview" referrerPolicy="no-referrer" />
                      )}
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'thumbnail')}
                        className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all text-xs text-text-secondary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">기획 의도 / 설명</label>
                    <textarea 
                      rows={4}
                      value={editingProject.description} 
                      onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                      className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all font-light resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[2px] text-text-secondary mb-3 block">미디어 에셋 추가 (이미지 파일들)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {editingProject.media.map((m, i) => {
                      if (!m) return null;
                      return (
                        <div key={i} className="relative group aspect-square">
                          {m && typeof m === 'string' && (m.startsWith?.('data:image') || m.includes?.('picsum')) ? (
                            <img src={m || null} className="w-full h-full object-cover border border-border" referrerPolicy="no-referrer" />
                          ) : m && typeof m === 'string' && m.startsWith?.('data:video') ? (
                            <div className="w-full h-full bg-surface border border-border flex items-center justify-center text-[8px] overflow-hidden p-1 text-center">LOCAL VIDEO</div>
                          ) : m ? (
                            <div className="w-full h-full bg-surface border border-border flex items-center justify-center text-[8px] overflow-hidden p-1 text-center font-mono">EMBED</div>
                          ) : null}
                          <button 
                            type="button"
                            onClick={() => setEditingProject({...editingProject, media: editingProject.media.filter((_, idx) => idx !== i)})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input 
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={e => handleFileUpload(e, 'media')}
                        className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all text-xs text-text-secondary"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        placeholder="또는 영상/유튜브 URL 입력 후 엔터"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              setEditingProject({...editingProject, media: [...editingProject.media, val]});
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="w-full bg-surface border border-border p-4 outline-none focus:border-white/30 transition-all text-xs text-text-secondary"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-text-secondary italic">이미지 파일을 직접 선택하여 업로드하거나, 영상 임베드 URL을 추가할 수 있습니다.</p>
                </div>
              </div>

              <div className="pt-10 flex justify-end gap-5">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-10 py-4 text-xs uppercase tracking-widest font-bold text-text-secondary hover:text-white transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-3"
                >
                  <Save className="w-5 h-5" /> 저장하기
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

interface SortableItemProps {
  project: Project;
  setEditingProject: React.Dispatch<React.SetStateAction<Project | null>>;
  deleteProject: (id: string) => void;
  key?: React.Key;
}

function SortableItem({ project, setEditingProject, deleteProject }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-surface border border-border p-5 group hover:border-white/20 transition-all relative rounded-[2px]",
        isDragging && "scale-105 shadow-2xl ring-1 ring-white/20"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
      />
      
      <div className="relative z-10 pointer-events-none">
        <div className="aspect-video mb-5 overflow-hidden rounded-[2px] border border-border/20">
          <img 
            src={project.thumbnail || null} 
            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-light truncate text-base mb-1 uppercase tracking-tight">{project.title}</h3>
            <p className="text-[9px] text-text-secondary uppercase tracking-[2px] opacity-60">{project.category}</p>
          </div>
          <div className="flex gap-1 shrink-0 pointer-events-auto">
            <button 
              onClick={() => setEditingProject(project)} 
              className="p-2 hover:bg-white/10 transition-colors text-text-secondary hover:text-white" 
              title="수정 / Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => deleteProject(project.id)} 
              className="p-2 hover:bg-red-500/10 transition-colors text-text-secondary hover:text-red-500" 
              title="삭제 / Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

