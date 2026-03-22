import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, Lock, Loader2, ArrowRight, Mail, Camera, Image as ImageIcon } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, loginReward?: number) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { username, password } 
        : { username, email, password, avatar_url: avatarUrl };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          onSuccess(data, data.loginReward);
        } else {
          onSuccess(data);
        }
        onClose();
      } else {
        setError(data.error || '驗證失敗');
      }
    } catch (err) {
      setError('網路連線錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-orange-900/5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(255,204,187,0.3)] w-full max-w-md overflow-hidden flex flex-col border border-orange-50"
      >
            <div className="p-6 md:p-8 border-b border-orange-50 flex items-center justify-between bg-orange-50/20">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-orange-900 tracking-tight">
                  {isLogin ? '歡迎回來' : '加入我們'}
                </h2>
                <p className="text-[8px] md:text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">
                  {isLogin ? '登入帳號以紀錄回憶' : '註冊帳號開始你的旅程'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-white rounded-xl md:rounded-2xl transition-all shadow-sm active:scale-90"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6">
              {error && (
                <div className="p-3 md:p-4 bg-red-50 border border-red-100 rounded-xl md:rounded-2xl text-red-500 text-[10px] md:text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">使用者名稱</label>
                  <div className="relative">
                    <UserIcon className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-orange-200" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="你的暱稱"
                      className="w-full pl-12 md:pl-14 pr-5 md:pr-6 py-4 md:py-5 bg-orange-50/30 border border-orange-100 rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-orange-900/5 focus:border-orange-200 transition-all text-orange-800 font-bold placeholder:text-orange-200 text-sm md:text-base"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">電子郵件</label>
                      <div className="relative">
                        <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-orange-200" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-12 md:pl-14 pr-5 md:pr-6 py-4 md:py-5 bg-orange-50/30 border border-orange-100 rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-orange-900/5 focus:border-orange-200 transition-all text-orange-800 font-bold placeholder:text-orange-200 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">個人頭像 (選填)</label>
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 md:w-20 md:h-20 bg-orange-50/30 border-2 border-dashed border-orange-100 rounded-2xl md:rounded-[2rem] flex items-center justify-center cursor-pointer hover:bg-orange-50 transition-all overflow-hidden group"
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            isUploading ? <Loader2 className="w-5 h-5 text-orange-200 animate-spin" /> : <Camera className="w-5 h-5 text-orange-200 group-hover:text-orange-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] md:text-[10px] text-orange-200 font-bold leading-tight">點擊上傳你的專屬頭像，讓地圖上的你更具特色</p>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 ml-2">密碼</label>
                  <div className="relative">
                    <Lock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-orange-200" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 md:pl-14 pr-5 md:pr-6 py-4 md:py-5 bg-orange-50/30 border border-orange-100 rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-orange-900/5 focus:border-orange-200 transition-all text-orange-800 font-bold placeholder:text-orange-200 text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 md:py-5 bg-orange-300 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(255,204,187,0.2)] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
                {isLogin ? '立即登入' : '完成註冊'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] font-black text-orange-200 uppercase tracking-widest hover:text-orange-900 transition-colors"
                >
                  {isLogin ? '還沒有帳號？立即註冊' : '已經有帳號了？立即登入'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
  );
}
