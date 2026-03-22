import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MapPin, Calendar, Quote, Globe, Edit2 } from 'lucide-react';
import { Story, CATEGORIES, User } from '../types';

interface FlashbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  onEdit?: (story: Story) => void;
  currentUser?: User | null;
}

export default function FlashbackModal({ isOpen, onClose, story, onEdit, currentUser }: FlashbackModalProps) {
  if (!story) return null;

  const canEdit = currentUser && (story.author === currentUser.username);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-orange-900/5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 40 }}
        className="bg-white rounded-[4rem] shadow-[0_50px_150px_rgba(255,204,187,0.3)] w-full max-w-2xl overflow-hidden flex flex-col border border-orange-50 relative"
      >
            {/* Background Accent */}
            <div className={`absolute top-0 left-0 right-0 h-40 opacity-10 ${
              story.color || CATEGORIES.find(c => c.value === story.category)?.color || 'bg-orange-300'
            }`} />

            <div className="p-12 flex flex-col items-center text-center relative z-10">
              <div className={`w-20 h-20 ${story.color || 'bg-orange-300'} rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transform -rotate-3`}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${story.color || CATEGORIES.find(c => c.value === story.category)?.color || 'bg-orange-300'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-200">
                  回憶時光機 • {CATEGORIES.find(c => c.value === story.category)?.label || '一般'}
                </span>
              </div>

              <h2 className="text-5xl font-black text-orange-900 tracking-tighter leading-none mb-8">
                {story.title}
              </h2>

              {story.image_url && (
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 shadow-xl border border-orange-50">
                  <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-6 mb-12">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                  <Calendar className="w-4 h-4" />
                  {new Date(story.created_at).toLocaleDateString()}
                </div>
                <div className="w-1 h-1 bg-orange-100 rounded-full" />
                <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                  <MapPin className="w-4 h-4" />
                  {story.lat.toFixed(2)}, {story.lng.toFixed(2)}
                </div>
              </div>

              <div className="relative max-w-lg mb-12">
                <Quote className="absolute -top-8 -left-8 w-16 h-16 text-orange-50 opacity-50" />
                <p className="text-xl font-medium text-orange-400 leading-relaxed italic">
                  "{story.content}"
                </p>
                <Quote className="absolute -bottom-8 -right-8 w-16 h-16 text-orange-50 opacity-50 transform rotate-180" />
              </div>

              <div className="flex items-center gap-3 pt-8 border-t border-orange-50 w-full justify-center">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-xs font-black text-orange-200 overflow-hidden border border-orange-100">
                  {story.author_avatar ? (
                    <img src={story.author_avatar} className="w-full h-full object-cover" />
                  ) : (
                    story.author[0]
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest">分享者</p>
                  <p className="text-sm font-bold text-orange-900">@{story.author}</p>
                </div>
                {canEdit && onEdit && (
                  <button 
                    onClick={() => onEdit(story)}
                    className="ml-6 flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    編輯
                  </button>
                )}
              </div>

              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-4 hover:bg-orange-50 rounded-[2rem] transition-all active:scale-90 group"
              >
                <X className="w-8 h-8 text-orange-100 group-hover:text-orange-900 transition-colors" />
              </button>
            </div>
          </motion.div>
        </div>
  );
}
