import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Loader2, Check, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatar_url);
  
  React.useEffect(() => {
    setAvatarUrl(user.avatar_url);
  }, [user.avatar_url]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError('圖片讀取失敗');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!avatarUrl) return;
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUpdate(updatedUser);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || '更新失敗');
      }
    } catch (err) {
      setError('網路連線錯誤');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-orange-900/5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(255,204,187,0.3)] w-full max-w-sm overflow-hidden flex flex-col border border-orange-50"
      >
            <div className="p-6 md:p-8 border-b border-orange-50 flex items-center justify-between bg-orange-50/20">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-orange-900 tracking-tight">個人檔案</h2>
                <p className="text-[8px] md:text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">
                  更新你的頭像與資訊
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-white rounded-xl md:rounded-2xl transition-all shadow-sm active:scale-90"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center gap-8">
              <div className="relative group">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 md:w-40 md:h-40 bg-orange-50 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-all overflow-hidden border-4 border-white shadow-2xl relative"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-orange-200" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-orange-300 animate-spin" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-black text-orange-900">@{user.username}</h3>
                <p className="text-xs font-bold text-orange-200 mt-1">{user.email}</p>
              </div>

              {error && (
                <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || isUploading || !avatarUrl || avatarUrl === user.avatar_url}
                className="w-full py-4 md:py-5 bg-orange-300 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(255,204,187,0.2)] active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : success ? (
                  <Check className="w-5 h-5" />
                ) : (
                  '儲存變更'
                )}
              </button>
            </div>
          </motion.div>
        </div>
  );
}
