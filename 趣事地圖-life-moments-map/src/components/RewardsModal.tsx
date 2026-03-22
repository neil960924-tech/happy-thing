import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, ShoppingBag, Store, CreditCard, Check, Loader2, Sparkles } from 'lucide-react';
import { User } from '../types';

interface RewardItem {
  id: string;
  name: string;
  points: number;
  store: string;
  image: string;
}

const REWARDS: RewardItem[] = [
  { id: '1', name: '7-11 咖啡大杯', points: 500, store: '7-11', image: '' },
  { id: '2', name: '全家 霜淇淋', points: 350, store: '全家', image: '' },
  { id: '3', name: '萊爾富 茶葉蛋', points: 100, store: '萊爾富', image: '' },
  { id: '4', name: 'OK 點心組', points: 250, store: 'OK', image: '' },
  { id: '5', name: '7-11 100元抵用券', points: 1000, store: '7-11', image: '' },
  { id: '6', name: '7-11 御飯糰', points: 150, store: '7-11', image: '' },
];

const StoreIcon = ({ store, size = 'sm' }: { store: string; size?: 'sm' | 'lg' }) => {
  const dimensions = size === 'lg' ? 'w-8 h-8' : 'w-3 h-3';
  const okText = size === 'lg' ? 'text-[10px]' : 'text-[5px]';
  const dotSize = size === 'lg' ? 'w-2 h-2' : 'w-1 h-1';

  switch (store) {
    case '7-11':
      return (
        <div className={`flex flex-col ${dimensions} overflow-hidden rounded-[4px] shadow-sm`}>
          <div className="h-1/2 bg-[#008133]" />
          <div className="h-1/2 bg-[#F58220]" />
        </div>
      );
    case '全家':
      return (
        <div className={`flex flex-col ${dimensions} overflow-hidden rounded-[4px] shadow-sm`}>
          <div className="h-1/2 bg-[#0080FF]" />
          <div className="h-1/2 bg-[#00A040]" />
        </div>
      );
    case '萊爾富':
      return (
        <div className={`${dimensions} bg-[#E60012] rounded-full flex items-center justify-center shadow-sm`}>
          <div className={`${dotSize} bg-white rounded-full`} />
        </div>
      );
    case 'OK':
      return (
        <div className={`${dimensions} bg-[#E60012] rounded-md flex items-center justify-center shadow-sm`}>
          <span className={`${okText} font-black text-white leading-none`}>OK</span>
        </div>
      );
    default:
      return <Store className={`${dimensions} text-orange-300`} />;
  }
};

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function RewardsModal({ isOpen, onClose, user, onUpdateUser }: RewardsModalProps) {
  const [isExchanging, setIsExchanging] = useState<string | null>(null);
  const [successItem, setSuccessItem] = useState<string | null>(null);

  const handleExchange = async (item: RewardItem) => {
    if (user.coins < item.points) return;
    
    setIsExchanging(item.id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update local user state (in a real app, this would be a backend call)
    onUpdateUser({ ...user, coins: user.coins - item.points });
    
    setSuccessItem(item.id);
    setIsExchanging(null);
    
    setTimeout(() => {
      setSuccessItem(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-orange-900/5 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(255,204,187,0.3)] w-full max-w-2xl overflow-hidden flex flex-col border border-orange-50 max-h-[90vh]"
      >
            <div className="p-8 border-b border-orange-50 flex items-center justify-between bg-orange-50/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-orange-900 tracking-tight">點數兌換中心</h2>
                  <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest mt-1">
                    集點換好禮 • 現實超商可用
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-white px-4 py-2 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-300" />
                  <span className="text-lg font-black text-orange-900">{user.coins}</span>
                  <span className="text-[10px] font-bold text-orange-200 uppercase">金幣</span>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto grid grid-cols-1 gap-4">
              {REWARDS.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 5 }}
                  className="bg-white border border-orange-50 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all group flex items-center gap-5"
                >
                  <div className="w-16 h-16 bg-orange-50/50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100/50 transition-colors">
                    <StoreIcon store={item.store} size="lg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] font-black text-orange-200 uppercase tracking-widest">{item.store}</span>
                    </div>
                    <h3 className="text-base font-black text-orange-900 mb-2">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                        <span className="text-lg font-black text-orange-900">{item.points}</span>
                      </div>
                      <button
                        onClick={() => handleExchange(item)}
                        disabled={user.coins < item.points || isExchanging !== null}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                          successItem === item.id 
                            ? 'bg-green-500 text-white' 
                            : user.coins >= item.points 
                              ? 'bg-orange-300 text-white hover:bg-orange-400 shadow-sm' 
                              : 'bg-orange-50 text-orange-200 cursor-not-allowed'
                        }`}
                      >
                        {isExchanging === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : successItem === item.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            已兌換
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            兌換
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 bg-orange-50/20 border-t border-orange-50 flex items-center justify-between">
              <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">
                兌換後請至「我的票券」查看條碼
              </p>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white text-orange-900 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-orange-100 shadow-sm hover:bg-orange-50 transition-all"
              >
                關閉
              </button>
            </div>
          </motion.div>
        </div>
  );
}
