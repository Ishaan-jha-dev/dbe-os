"use client";

import { useFarmStore } from "@/hooks/useFarmStore";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Droplet, Sprout, Sun, Leaf, Flame } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock tree stage SVGs/renders using standard unicode or CSS
const TreeStageRenderer = ({ stage, health, skin }: { stage: number, health: number, skin: string }) => {
  const isWilting = health < 30;
  const healthColor = isWilting ? "opacity-50 grayscale" : "opacity-100";
  
  const getTreeIcon = () => {
    switch (stage) {
      case 1: return <div className="text-4xl text-primary-dim">🌱</div>;
      case 2: return <div className="text-5xl text-primary">🌿</div>;
      case 3: return <div className="text-6xl text-primary drop-shadow-sm">🪴</div>;
      case 4: return <div className="text-7xl text-primary drop-shadow-md">🌳</div>;
      case 5: return <div className="text-8xl text-primary drop-shadow-[0_0_15px_rgba(45,106,79,0.8)]">🌲</div>;
      default: return <div className="text-4xl">🌱</div>;
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-end h-32 ${healthColor} ${isWilting ? 'animate-pulse' : ''}`}
    >
      {getTreeIcon()}
      {isWilting && <span className="absolute top-0 text-[10px] text-on-error font-bold bg-error px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Needs Water!</span>}
    </motion.div>
  );
};

import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

const IPadSidebar = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete Physics Chapter 4", done: false },
    { id: 2, text: "Water the virtual crops", done: true },
    { id: 3, text: "Revise Math formulas for test", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="sticky top-24 bg-[#FFFCF8] rounded-[2rem] border-[8px] border-[#E5E5EA] shadow-xl p-6 md:p-8 flex flex-col h-[75vh] min-h-[600px] overflow-y-auto" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, rgba(0,0,0,0.06) 39px, rgba(0,0,0,0.06) 40px)', backgroundAttachment: 'local', backgroundPosition: '0 1rem' }}>
        {/* iPad Camera details */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-black/80 ring-2 ring-black/10"></div>
        <div className="absolute top-3.5 left-[calc(50%+1rem)] w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]"></div>
        
        <div className={`mt-8 ${caveat.className}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-4xl text-[#2c3e50] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">My Month</h2>
                <span className="text-xl text-[#e74c3c] font-bold rotate-[-5deg] border-b-2 border-[#e74c3c] border-dashed">{today.toLocaleString('default', { month: 'long' })}</span>
            </div>
            
            {/* Calendar */}
            <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center mb-8 text-[#34495e]">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-2xl font-bold opacity-70">{d}</div>)}
                {calendarDays.map((d, i) => (
                    <div key={i} className="relative aspect-square flex items-center justify-center text-2xl font-bold">
                        {d}
                        {d && d < today.getDate() && (
                            <svg className="absolute inset-0 w-full h-full text-[#e74c3c]/80 pointer-events-none drop-shadow-sm" viewBox="0 0 100 100">
                                <path d="M20,20 Q50,40 80,80 M80,20 Q50,60 20,80" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
                            </svg>
                        )}
                        {d === today.getDate() && (
                            <div className="absolute inset-1 border-4 border-[#3498db] rounded-full opacity-60 mix-blend-multiply"></div>
                        )}
                    </div>
                ))}
            </div>

            <h2 className="text-4xl text-[#2c3e50] font-bold mb-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">To-Do Today</h2>
            <ul className="space-y-[0.6rem]">
                {tasks.map((task) => (
                    <li 
                        key={task.id} 
                        className="flex items-start gap-4 cursor-pointer group"
                        onClick={() => toggleTask(task.id)}
                    >
                        <span className={`text-4xl leading-none -mt-1 transition-colors ${task.done ? 'text-[#2ecc71]' : 'text-[#3498db] group-hover:text-[#2980b9]'}`}>
                            <span className="material-symbols-outlined">
                                {task.done ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                        </span>
                        <span className={`text-3xl leading-none mt-1 transition-all duration-300 ${
                            task.done 
                                ? 'text-[#2c3e50] opacity-60 line-through decoration-wavy decoration-[#2ecc71]' 
                                : 'text-[#2c3e50] opacity-100'
                        }`}>
                            {task.text}
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mt-8 text-center text-[#95a5a6] text-xl opacity-80 italic">-- scribble down ideas! --</div>
        </div>
    </div>
  )
}

export default function FarmDashboard() {
  const { totalTomatoesEarned, tomatoesBalance, streak, plots, earnTomatoes, waterPlot } = useFarmStore();
  const [showTomatoAnim, setShowTomatoAnim] = useState(false);

  const handleManualWater = (id: string) => {
    waterPlot(id);
    earnTomatoes(1, id);
    setShowTomatoAnim(true);
    setTimeout(() => setShowTomatoAnim(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      
      {/* Left Main Content */}
      <div className="lg:col-span-8 space-y-8">
        {/* Header Status Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container rounded-3xl p-8 flex flex-col justify-between items-start relative overflow-hidden shadow-sm border border-outline-variant/10 hover-lift">
                <div className="relative z-10 w-full flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-2 tracking-tight">Welcome Back, Scholar.</h1>
                        <p className="text-on-surface-variant max-w-sm font-medium">Your greenhouse is thriving. You have {plots.filter(p=>p.healthPct < 50).length} plots seeking attention.</p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 z-10">
                    <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-outline-variant/10">
                        <span className="text-secondary text-lg">🍅</span>
                        <span className="text-on-surface">Balance: {tomatoesBalance}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full font-bold text-sm">
                        <Sun className="w-4 h-4" />
                        <span>Rank: {totalTomatoesEarned} XP</span>
                    </div>
                </div>
                {/* Decorative blurred blob */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-sm hover-lift relative overflow-hidden">
                <p className="text-xs font-bold font-headline text-secondary uppercase tracking-widest mb-2 flex items-center gap-1 z-10"><Flame className="w-4 h-4"/> Streak</p>
                <p className="text-5xl font-black text-secondary mb-2 leading-none z-10">{streak}</p>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2 z-10">Days Growing Strong</p>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
        </section>

        {/* Floating Animation */}
        <AnimatePresence>
          {showTomatoAnim && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: -50, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 m-auto w-32 h-32 flex items-center justify-center pointer-events-none z-50 text-6xl drop-shadow-md"
            >
              🍅 +1
            </motion.div>
          )}
        </AnimatePresence>

        <section className="space-y-4">
          <h2 className="text-2xl font-black font-headline text-on-surface">The Digital Farm</h2>
          {/* Farm Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <motion.div 
                key={plot.id}
                whileHover={{ y: -5 }}
                className="bg-surface-container-lowest border border-outline-variant/15 p-6 rounded-3xl relative overflow-hidden shadow-[0_4px_12px_rgba(66,40,32,0.02)] hover:shadow-[0_16px_32px_rgba(66,40,32,0.06)] flex flex-col items-center justify-end h-72 transition-all group"
              >
                {/* Top Details */}
                <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
                  <div>
                    <h3 className="text-on-surface font-black font-headline text-lg tracking-tight leading-tight">{plot.subject}</h3>
                    <p className="text-primary font-black text-[10px] uppercase tracking-widest mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-full border border-primary/20">Lv {plot.treeStage}</p>
                  </div>
                  <div className="bg-surface-container px-2 py-1 rounded-full border border-outline-variant/10 flex items-center gap-1 shadow-sm">
                    <span className="text-sm">🍅</span>
                    <span className="text-on-surface font-black text-xs">{plot.tomatoesFromPlot}</span>
                  </div>
                </div>

                {/* Tree Render */}
                <TreeStageRenderer stage={plot.treeStage} health={plot.healthPct} skin={plot.treeSkin} />

                {/* Ground/Dirt */}
                <div className="w-full h-8 mt-4 bg-outline/20 rounded-[100%] border-t border-outline/30 relative">
                  <div className="absolute left-1/2 -ml-6 -top-3 w-12 h-4 bg-outline/40 rounded-[100%]" />
                </div>

                {/* Health Indicator */}
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    <span>Hydration</span>
                    <span className={plot.healthPct < 30 ? "text-error" : "text-primary"}>{plot.healthPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${plot.healthPct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${plot.healthPct < 30 ? 'bg-error' : 'bg-primary'}`}
                    />
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 z-30 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleManualWater(plot.id)}
                      className="bg-secondary hover:scale-105 active:scale-95 text-on-secondary w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg shadow-secondary/20"
                      title="Water plot for 1 Tomato"
                    >
                      <Droplet className="w-6 h-6" />
                    </button>
                    <Link href={`/study?plot=${plot.id}`}>
                      <button 
                        className="bg-primary hover:scale-105 active:scale-95 text-on-primary w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                        title="Start Pomodoro Session here"
                      >
                        <Timer className="w-6 h-6" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Secondary Features Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full pt-4">
            <div className="bg-primary text-on-primary rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-primary/10 hover-lift">
                <div className="relative z-10 w-full space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim bg-on-primary-fixed/20 inline-block px-3 py-1 rounded-full border border-primary-fixed/30">Deep Work</p>
                    <h3 className="text-3xl font-black font-headline tracking-tighter text-white">Focus Session</h3>
                    <p className="text-primary-fixed opacity-90 font-medium">Start a 25-minute Pomodoro to nurture your crops.</p>
                </div>
                <Link href="/study" className="relative z-10 mt-6">
                    <button className="bg-on-primary text-on-primary-container px-6 py-3 rounded-full font-bold shadow-lg hover:bg-surface transition-colors flex items-center justify-center gap-2 w-full">
                        <Timer className="w-5 h-5" /> Start Growing
                    </button>
                </Link>
                <Leaf className="absolute -bottom-10 -right-10 w-56 h-56 text-on-primary-fixed opacity-10 rotate-12 pointer-events-none" />
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm space-y-6 hover-lift">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-black font-headline text-on-surface tracking-tight">Farm Activity</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center shadow-sm shrink-0">
                            <Droplet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold font-headline text-on-surface">Math plot watered manually</p>
                            <p className="text-xs text-on-surface-variant font-medium mt-0.5">+1 Tomato</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>

      {/* Right iPad Sidebar */}
      <div className="lg:col-span-4">
         <IPadSidebar />
      </div>
    </div>
  );
}
