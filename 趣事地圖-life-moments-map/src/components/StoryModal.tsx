import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import { Category, CATEGORIES, Story, PRESET_COLORS } from '../types';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; category: string; image_url?: string; color?: string }) => void;
  lat: number;
  lng: number;
  story?: Story | null;
}

export default function StoryModal({ isOpen, onClose, onSubmit, lat, lng, story }: StoryModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [color, setColor] = useState<string>(PRESET_COLORS[0].value);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (story) {
      setContent(story.content);
      setCategory(story.category as Category);
      setImageUrl(story.image_url || undefined);
      setColor(story.color || PRESET_COLORS[0].value);
    } else {
      setContent('');
      setCategory('general');
      setImageUrl(undefined);
      setColor(PRESET_COLORS[0].value);
    }
  }, [story, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    onSubmit({ content, category, image_url: imageUrl, color });
    // Reset
    setContent('');
    setCategory('general');
    setImageUrl(undefined);
    setColor(PRESET_COLORS[0].value);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-orange-900/5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(255,204,187,0.3)] w-full max-w-lg overflow-hidden flex flex-col border border-orange-50"
      >
            <div className="p-6 md:p-8 border-b border-orange-50 flex items-center justify-between bg-orange-50/20">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-orange-900 tracking-tight">
                  {story ? '編輯回憶' : '紀錄這刻'}
                </h2>
                <p className="text-[8px] md:text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">
                  {story ? 'Update Memory' : 'New Memory'} • {lat.toFixed(2)}, {lng.toFixed(2)}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-white rounded-xl md:rounded-2xl transition-all shadow-sm active:scale-90"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
              <div className="space-y-2">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">故事內容</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在這裡寫下你的故事..."
                  className="w-full h-32 md:h-40 p-4 md:p-6 bg-orange-50/30 border border-orange-100 rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-orange-900/5 focus:border-orange-200 transition-all resize-none text-orange-800 font-medium placeholder:text-orange-200"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">上傳照片</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-orange-50/30 border-2 border-dashed border-orange-100 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50 transition-all overflow-hidden group"
                >
                  {imageUrl ? (
                    <div className="relative w-full h-full">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-3 shadow-sm">
                        {isUploading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-orange-300 animate-spin" /> : <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-300" />}
                      </div>
                      <p className="text-[8px] md:text-[10px] font-black text-orange-200 uppercase tracking-widest">點擊或拖曳照片</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">分類</label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${
                        category === cat.value
                          ? `${cat.color} text-white border-transparent shadow-lg scale-105`
                          : 'bg-white text-orange-200 border-orange-50 hover:border-orange-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-orange-200 uppercase tracking-widest block">選擇地標顏色</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${c.value} ${
                        color === c.value ? 'border-orange-900 scale-110 shadow-lg' : 'border-white hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 md:py-5 bg-orange-300 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(255,204,187,0.2)] active:scale-[0.98] mt-2 md:mt-4"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
                {story ? '更新回憶' : '發布回憶'}
              </button>
            </form>
          </motion.div>
        </div>
  );
}
