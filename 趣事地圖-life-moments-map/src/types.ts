export interface Story {
  id: number;
  lat: number;
  lng: number;
  title?: string;
  content: string;
  category: string;
  author: string;
  author_avatar?: string;
  image_url?: string;
  color?: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  coins: number;
}

export type Category = 'funny' | 'touching' | 'weird' | 'adventure' | 'general';

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'funny', label: '有趣', color: 'bg-yellow-400' },
  { value: 'touching', label: '感人', color: 'bg-red-400' },
  { value: 'weird', label: '奇葩', color: 'bg-purple-400' },
  { value: 'adventure', label: '冒險', color: 'bg-blue-400' },
  { value: 'general', label: '一般', color: 'bg-gray-400' },
];

export const PRESET_COLORS = [
  { name: '橘色', value: 'bg-orange-400', hex: '#fb923c' },
  { name: '黃色', value: 'bg-yellow-400', hex: '#facc15' },
  { name: '紅色', value: 'bg-red-400', hex: '#f87171' },
  { name: '紫色', value: 'bg-purple-400', hex: '#c084fc' },
  { name: '藍色', value: 'bg-blue-400', hex: '#60a5fa' },
  { name: '綠色', value: 'bg-emerald-400', hex: '#34d399' },
  { name: '粉色', value: 'bg-pink-400', hex: '#f472b6' },
  { name: '灰色', value: 'bg-slate-400', hex: '#94a3b8' },
];
