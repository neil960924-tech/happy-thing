import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Story, CATEGORIES } from '../types';

interface CalendarViewProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
}

export default function CalendarView({ stories, onStoryClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, -1)); // Wait, subMonths(d, 1) is correct

  const storiesOnSelectedDate = stories.filter(s => 
    selectedDate && isSameDay(new Date(s.created_at), selectedDate)
  );

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-[#FFF9F5] overflow-hidden">
      {/* Calendar Grid */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-orange-900 tracking-tighter">
                {format(currentMonth, 'MMMM')}
              </h2>
              <p className="text-[8px] md:text-[10px] font-black text-orange-200 uppercase tracking-[0.4em] mt-1 md:mt-2">
                {format(currentMonth, 'yyyy')} • 回憶日曆
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 md:p-4 hover:bg-white rounded-xl md:rounded-[2rem] transition-all shadow-sm border border-orange-50 active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 md:p-4 hover:bg-white rounded-xl md:rounded-[2rem] transition-all shadow-sm border border-orange-50 active:scale-90"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[8px] md:text-[10px] font-black text-orange-100 uppercase tracking-widest mb-2 md:mb-4">
                {day}
              </div>
            ))}
            
            {/* Empty days for start of month padding */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map(day => {
              const hasStories = stories.some(s => isSameDay(new Date(s.created_at), day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <motion.button
                  key={day.toString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-xl md:rounded-[1.5rem] flex flex-col items-center justify-center relative transition-all border ${
                    isSelected 
                      ? 'bg-orange-300 text-white border-transparent shadow-2xl z-10' 
                      : 'bg-white text-orange-200 border-orange-50 hover:border-orange-100'
                  }`}
                >
                  <span className={`text-sm md:text-lg font-black ${isSelected ? 'text-white' : today ? 'text-orange-900' : 'text-orange-100'}`}>
                    {format(day, 'd')}
                  </span>
                  {hasStories && !isSelected && (
                    <div className="absolute bottom-1.5 md:bottom-3 w-1 md:w-1.5 h-1 md:h-1.5 bg-orange-300 rounded-full animate-pulse" />
                  )}
                  {today && !isSelected && (
                    <div className="absolute top-1.5 md:top-3 text-[6px] md:text-[8px] font-black uppercase tracking-widest text-orange-100">Today</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Sidebar */}
      <div className="w-full lg:w-[450px] bg-white border-t lg:border-t-0 lg:border-l border-orange-50 flex flex-col shadow-[-20px_0_60px_rgba(255,204,187,0.02)] max-h-[50vh] lg:max-h-full">
        <div className="p-6 md:p-10 border-b border-orange-50">
          <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl md:rounded-[1.5rem] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-200" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-orange-900 tracking-tight">
                {selectedDate ? format(selectedDate, 'MMMM do') : '選擇日期'}
              </h3>
              <p className="text-[8px] md:text-[10px] font-bold text-orange-200 uppercase tracking-widest">
                {storiesOnSelectedDate.length} 個回憶紀錄
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
          {storiesOnSelectedDate.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-orange-50 rounded-2xl md:rounded-[3rem] flex items-center justify-center mb-4 md:mb-6">
                <CalendarIcon className="w-8 h-8 md:w-10 md:h-10 text-orange-100" />
              </div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">這天沒有回憶</p>
            </div>
          ) : (
            storiesOnSelectedDate.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onStoryClick(story)}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${CATEGORIES.find(c => c.value === story.category)?.color || 'bg-orange-300'}`} />
                  <span className="text-[8px] md:text-[10px] font-black text-orange-200 uppercase tracking-widest">
                    {CATEGORIES.find(c => c.value === story.category)?.label || '一般'}
                  </span>
                </div>
                <h4 className="text-lg md:text-xl font-black text-orange-800 group-hover:text-orange-900 transition-colors leading-tight mb-2">
                  {story.title}
                </h4>
                {story.image_url && (
                  <div className="w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden mb-3 border border-orange-50">
                    <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-[10px] md:text-xs text-orange-300 leading-relaxed font-medium line-clamp-3">
                  {story.content}
                </p>
                <div className="mt-3 md:mt-4 flex items-center justify-between">
                  <span className="text-[8px] md:text-[10px] font-bold text-orange-200">@{story.author}</span>
                  <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-bold text-orange-100">
                    <MapPin className="w-2.5 h-2.5 md:w-3 h-3" />
                    {story.lat.toFixed(1)}, {story.lng.toFixed(1)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
