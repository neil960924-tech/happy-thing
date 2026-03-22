import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Users, Heart, Lock, TrendingUp, Map as MapIcon, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { Story, User } from '../types';

interface Friend {
  id: string;
  name: string;
  count: number;
  avatar: string;
  isUser?: boolean;
}

interface FriendsLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  userStories: Story[];
  currentUser?: User | null;
}

export default function FriendsLeaderboard({ isOpen, onClose, userStories, currentUser }: FriendsLeaderboardProps) {
  const [weeklyStats, setWeeklyStats] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      fetchWeeklyStats();
    }
  }, [isOpen]);

  const fetchWeeklyStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/competition/weekly');
      const data = await response.json();
      setWeeklyStats(data);
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReward = (index: number, totalFriends: number) => {
    if (index === 0) return 100;
    if (index === 1) return 80;
    if (index === 2 && totalFriends >= 5) return 50;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-orange-900/5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(255,204,187,0.3)] w-full max-w-md overflow-hidden flex flex-col border border-orange-50 max-h-[90vh]"
      >
            <div className="p-8 border-b border-orange-50 flex flex-col gap-6 bg-orange-50/20">
              <div className="flex items-center justify-between">
                <button 
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-300 hover:text-orange-500 shadow-sm transition-all active:scale-95 group"
                >
                  <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  回到地圖
                </button>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90"
                >
                  <X className="w-6 h-6 text-orange-200" />
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-black text-orange-900 tracking-tight flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-orange-300" />
                  每週回憶競賽
                </h2>
                <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">Weekly Challenge Rewards</p>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-orange-50/30 p-6 rounded-[2rem] border border-orange-100 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Sparkles className="w-6 h-6 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-orange-900">每週獎勵規則</p>
                    <p className="text-[10px] text-orange-300 leading-relaxed font-bold">
                      第一名 100 金幣 • 第二名 80 金幣 • 第三名 50 金幣
                    </p>
                  </div>
                </div>
                <p className="text-[8px] text-orange-200 font-bold uppercase tracking-widest">
                  * 好友人數少於 5 人時不發放第三名獎勵
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">好友排行</span>
                  <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">本週紀錄 / 預計獎勵</span>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-200 animate-spin" />
                  </div>
                ) : (
                  weeklyStats.map((item, index) => {
                    const isUser = currentUser && item.id === currentUser.id;
                    const reward = getReward(index, weeklyStats.length);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-3xl flex items-center justify-between transition-all ${
                          isUser ? 'bg-orange-100/30 border border-orange-200 shadow-sm' : 'hover:bg-orange-50/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {item.avatar_url ? (
                              <img 
                                src={item.avatar_url} 
                                alt={item.username} 
                                className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-orange-50 border-2 border-white shadow-sm flex items-center justify-center text-xs font-black text-orange-200">
                                {item.username[0]}
                              </div>
                            )}
                            {index < 3 && (
                              <div className="absolute -top-2 -left-2 w-5 h-5 bg-orange-300 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-white">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <span className={`text-sm font-black ${isUser ? 'text-orange-900' : 'text-stone-600'}`}>
                            {item.username} {isUser && '(你)'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-orange-900">{item.count}</span>
                            <TrendingUp className="w-4 h-4 text-orange-200" />
                          </div>
                          {reward > 0 && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-orange-400 uppercase">
                              <Sparkles className="w-2 h-2" />
                              +{reward} 金幣
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <button className="w-full py-5 bg-orange-100/50 text-orange-900 rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-200/50 transition-all active:scale-[0.98]">
                <Users className="w-5 h-5" />
                邀請更多好友
              </button>
            </div>
          </motion.div>
        </div>
  );
}
