import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Menu, X, History, Info, Globe, Loader2, Calendar as CalendarIcon, Sparkles, Map as MapIcon, Users, Trophy, LogOut, User as UserIcon, ShoppingBag } from 'lucide-react';
import StoryMap from './components/StoryMap';
import StoryModal from './components/StoryModal';
import CalendarView from './components/CalendarView';
import FlashbackModal from './components/FlashbackModal';
import FriendsLeaderboard from './components/FriendsLeaderboard';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import RewardsModal from './components/RewardsModal';
import { Story, CATEGORIES, User } from './types';

type ViewMode = 'map' | 'calendar';

export default function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFlashbackOpen, setIsFlashbackOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingStoreOpen, setPendingStoreOpen] = useState(false);
  const [loginReward, setLoginReward] = useState<number | null>(null);
  const [flashbackStory, setFlashbackStory] = useState<Story | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerOnStory, setCenterOnStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  useEffect(() => {
    checkUser();
    fetchStories();
  }, []);

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to check user:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedLocation({ lat, lng });
    setIsModalOpen(true);
  };

  const handleStorySubmit = async (data: { content: string; category: string; image_url?: string }) => {
    if (!selectedLocation && !editingStory) return;

    try {
      const url = editingStory ? `/api/stories/${editingStory.id}` : '/api/stories';
      const method = editingStory ? 'PUT' : 'POST';
      const body = editingStory ? data : { ...data, ...selectedLocation };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const savedStory = await response.json();
        if (editingStory) {
          setStories(stories.map(s => s.id === savedStory.id ? savedStory : s));
        } else {
          setStories([savedStory, ...stories]);
        }
        setIsModalOpen(false);
        setEditingStory(null);
      }
    } catch (error) {
      console.error('Failed to submit story:', error);
    }
  };

  const handleStoryMove = async (story: Story, lat: number, lng: number) => {
    if (!user || story.author !== user.username) return;
    
    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });

      if (response.ok) {
        const updatedStory = await response.json();
        setStories(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
      }
    } catch (error) {
      console.error('Failed to move story:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const triggerFlashback = () => {
    if (stories.length === 0) return;
    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    handleStoryClick(randomStory);
  };

  const handleStoryClick = (story: Story) => {
    setCenterOnStory(story);
    setFlashbackStory(story);
    setIsFlashbackOpen(true);
    if (viewMode !== 'map') {
      setViewMode('map');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-screen w-full bg-[#FFF9F5] flex flex-col overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900"
    >
      {/* Header */}
      <header className="h-16 md:h-20 bg-white/60 backdrop-blur-xl border-b border-orange-50 flex items-center justify-between px-4 md:px-8 z-[100]">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 md:gap-4"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-300 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(255,204,187,0.5)] transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-orange-900 leading-none">趣事地圖</h1>
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-orange-200 mt-1 md:mt-1.5">Soft Peach Moments</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 md:gap-4"
        >
          {/* View Mode Switcher */}
          <div className="bg-orange-50/50 p-1 md:p-1.5 rounded-2xl md:rounded-[1.5rem] flex items-center gap-0.5 md:gap-1 border border-orange-100">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 md:gap-2 ${
                viewMode === 'map' ? 'bg-white text-orange-900 shadow-sm' : 'text-orange-200 hover:text-orange-400'
              }`}
            >
              <MapIcon className="w-2.5 h-2.5 md:w-3 h-3" />
              <span className="hidden sm:inline">地圖</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 md:gap-2 ${
                viewMode === 'calendar' ? 'bg-white text-orange-900 shadow-sm' : 'text-orange-200 hover:text-orange-400'
              }`}
            >
              <CalendarIcon className="w-2.5 h-2.5 md:w-3 h-3" />
              <span className="hidden sm:inline">日曆</span>
            </button>
          </div>

          <div className="h-6 md:h-8 w-[1px] bg-orange-100 mx-1 md:mx-2 hidden sm:block" />

          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setIsFriendsOpen(true)}
              className="p-2 md:p-3 hover:bg-orange-50 rounded-xl md:rounded-2xl transition-all active:scale-90 border border-transparent hover:border-orange-100 group"
              title="好友競賽"
            >
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-orange-200 group-hover:text-orange-500 transition-colors" />
            </button>
            <button 
              onClick={triggerFlashback}
              disabled={stories.length === 0}
              className="p-2 md:p-3 hover:bg-orange-50 rounded-xl md:rounded-2xl transition-all active:scale-90 border border-transparent hover:border-orange-100 group disabled:opacity-30"
              title="回顧隨機回憶"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-orange-200 group-hover:text-orange-500 transition-colors" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 md:p-3 hover:bg-orange-50 rounded-xl md:rounded-2xl transition-all active:scale-90 border border-transparent hover:border-orange-100 group"
              title="歷史紀錄"
            >
              <History className="w-5 h-5 md:w-6 md:h-6 text-orange-200 group-hover:text-orange-500 transition-colors" />
            </button>

            <button 
              onClick={() => {
                if (!user) {
                  setPendingStoreOpen(true);
                  setIsAuthOpen(true);
                } else {
                  setIsRewardsOpen(true);
                }
              }}
              className="p-2 md:p-3 hover:bg-orange-50 rounded-xl md:rounded-2xl transition-all active:scale-90 border border-transparent hover:border-orange-100 group flex items-center gap-2"
              title="商店 / 兌換中心"
            >
              <div className="flex items-center gap-1.5 bg-orange-100/50 px-2 md:px-4 py-1 md:py-2 rounded-xl border border-orange-200 shadow-sm group-hover:shadow-md transition-all">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                <span className="text-[10px] md:text-xs font-black text-orange-900 uppercase tracking-tight">
                  {user ? `${user.coins} 金幣` : '商店'}
                </span>
              </div>
            </button>

            <div className="h-6 md:h-8 w-[1px] bg-orange-100 mx-1 md:mx-2 hidden md:block" />

            {user ? (
              <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
                <div className="flex flex-col items-end hidden lg:flex">
                  <span className="text-xs font-black text-orange-900">@{user.username}</span>
                  <button onClick={handleLogout} className="text-[8px] font-black text-orange-200 uppercase tracking-widest hover:text-red-400 transition-colors">登出</button>
                </div>
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm overflow-hidden hover:scale-105 transition-transform"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-300" />
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="px-3 md:px-6 py-2 md:py-2.5 bg-orange-300 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-orange-400 transition-all active:scale-95"
              >
                登入
              </button>
            )}
          </div>
        </motion.div>
      </header>

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-[#FFF9F5] z-50"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-3xl border-4 border-orange-100 border-t-orange-300 animate-spin"></div>
                <p className="text-[10px] font-black text-orange-200 uppercase tracking-[0.3em]">載入中</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="h-full w-full"
            >
              {viewMode === 'map' ? (
                <StoryMap 
                  stories={stories} 
                  onMapClick={handleMapClick}
                  onStoryClick={handleStoryClick}
                  onStoryMove={handleStoryMove}
                  centerOnStory={centerOnStory}
                  currentUser={user}
                />
              ) : (
                <CalendarView 
                  stories={stories} 
                  onStoryClick={handleStoryClick}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button (Only in Map View) */}
        {viewMode === 'map' && (
          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex flex-col items-end gap-4 md:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl px-4 md:px-5 py-3 md:py-4 rounded-2xl md:rounded-[2rem] shadow-2xl border border-orange-50 max-w-[200px] md:max-w-xs hidden sm:block"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-50 rounded-full flex items-center justify-center">
                  <Info className="w-2.5 h-2.5 md:w-3 h-3 text-orange-200" />
                </div>
                <p className="text-[10px] md:text-xs font-black text-orange-900 tracking-tight">小提示</p>
              </div>
              <p className="text-[9px] md:text-[11px] text-orange-300 leading-relaxed font-medium">
                點擊地圖上的任何角落，寫下屬於那裡的粉橘瞬間。
              </p>
            </motion.div>
            
            <button 
              onClick={() => handleMapClick(25.0330, 121.5654)}
              className="group w-14 h-14 md:w-20 md:h-20 bg-orange-300 hover:bg-orange-400 text-white rounded-2xl md:rounded-[2.5rem] shadow-[0_15px_40px_rgba(255,204,187,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 md:border-[6px] border-white"
            >
              <Plus className="w-6 h-6 md:w-10 md:h-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-orange-900/5 backdrop-blur-sm z-[1400]"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute top-2 right-2 bottom-2 md:top-4 md:right-4 md:bottom-4 w-[calc(100%-1rem)] md:w-[400px] bg-white/90 backdrop-blur-2xl shadow-[0_30px_60px_rgba(255,204,187,0.15)] z-[1500] flex flex-col border border-orange-50 rounded-3xl md:rounded-[3rem] overflow-hidden"
              >
                <div className="p-6 md:p-8 border-b border-orange-50 flex items-center justify-between bg-orange-50/10">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-orange-900 tracking-tight">回憶時光機</h2>
                    <p className="text-[8px] md:text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">Recent Stories</p>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 md:p-3 hover:bg-white rounded-xl md:rounded-2xl transition-colors group"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-orange-100 group-hover:text-orange-900 transition-colors" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
                  {stories.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 md:mb-6">
                        <MapPin className="w-6 h-6 md:w-8 md:h-8 text-orange-100" />
                      </div>
                      <p className="text-xs md:text-sm font-black text-orange-200 uppercase tracking-widest">地圖還是空的</p>
                      <p className="text-[10px] md:text-xs text-orange-100 mt-2">快去寫下第一個故事吧！</p>
                    </div>
                  ) : (
                    stories.map((story, index) => (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          handleStoryClick(story);
                        }}
                        className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] border border-orange-50 hover:border-orange-100 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${CATEGORIES.find(c => c.value === story.category)?.color || 'bg-orange-300'}`} />
                            <span className="text-[8px] md:text-[10px] font-black text-orange-200 uppercase tracking-widest">
                              {CATEGORIES.find(c => c.value === story.category)?.label || '一般'}
                            </span>
                          </div>
                          <span className="text-[8px] md:text-[10px] font-bold text-orange-100">
                            {new Date(story.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base md:text-lg font-black text-orange-800 group-hover:text-orange-900 transition-colors leading-tight">{story.title}</h3>
                        {story.image_url && (
                          <div className="w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden mt-2 md:mt-3 border border-orange-50">
                            <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-[10px] md:text-xs text-orange-300 mt-2 line-clamp-2 leading-relaxed font-medium">{story.content}</p>
                        
                        <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-orange-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-50 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-orange-200">
                              {story.author[0]}
                            </div>
                            <span className="text-[8px] md:text-[10px] font-bold text-orange-200">@{story.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-orange-100">
                            <MapPin className="w-2.5 h-2.5 md:w-3 h-3" />
                            {story.lat.toFixed(1)}, {story.lng.toFixed(1)}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <StoryModal 
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingStory(null);
            }}
            onSubmit={handleStorySubmit}
            lat={editingStory?.lat || selectedLocation?.lat || 0}
            lng={editingStory?.lng || selectedLocation?.lng || 0}
            story={editingStory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFlashbackOpen && flashbackStory && (
          <FlashbackModal 
            isOpen={isFlashbackOpen}
            onClose={() => setIsFlashbackOpen(false)}
            story={flashbackStory}
            currentUser={user}
            onEdit={(story) => {
              setIsFlashbackOpen(false);
              setEditingStory(story);
              setIsModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFriendsOpen && (
          <FriendsLeaderboard 
            isOpen={isFriendsOpen}
            onClose={() => setIsFriendsOpen(false)}
            userStories={stories}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSuccess={(u, reward) => {
              setUser(u);
              if (reward && reward > 0) {
                setLoginReward(reward);
                setTimeout(() => setLoginReward(null), 5000);
              }
              if (pendingStoreOpen) {
                setIsRewardsOpen(true);
                setPendingStoreOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {user && isProfileOpen && (
          <ProfileModal 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onUpdate={(u) => setUser(u)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {user && isRewardsOpen && (
          <RewardsModal 
            isOpen={isRewardsOpen}
            onClose={() => setIsRewardsOpen(false)}
            user={user}
            onUpdateUser={(u) => setUser(u)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loginReward && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(255,204,187,0.4)] border border-orange-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-orange-300 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-orange-900">每日登入獎勵！</p>
              <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">獲得了 {loginReward} 金幣</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
