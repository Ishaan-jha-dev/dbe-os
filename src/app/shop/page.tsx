"use client";

import { useFarmStore } from "@/hooks/useFarmStore";
import { ShoppingBag, Shield, Beaker, TreePine, PaintBucket, Tag } from "lucide-react";

export default function Shop() {
  const { tomatoesBalance, spendTomatoes } = useFarmStore();

  const handlePurchase = (item: string, cost: number) => {
    if (spendTomatoes(cost)) {
      alert(`Successfully purchased ${item}!`);
    } else {
      alert("Not enough Tomatoes!");
    }
  };

  const shopItems = [
    { name: "Streak Freeze", cost: 10, effect: "Protects streak for 1 missed day", icon: <Shield className="w-8 h-8 text-blue-400" /> },
    { name: "Health Potion", cost: 8, effect: "Instantly restores one plot's health to 50%", icon: <Beaker className="w-8 h-8 text-red-400" /> },
    { name: "Rare Seed", cost: 25, effect: "Plant a special cherry blossom tree", icon: <TreePine className="w-8 h-8 text-pink-400" /> },
    { name: "Farm Fence", cost: 15, effect: "Decorative border around your farm plot", icon: <PaintBucket className="w-8 h-8 text-amber-500" /> },
    { name: "Night Mode Tree Skin", cost: 35, effect: "Your trees glow purple at night", icon: <TreePine className="w-8 h-8 text-purple-500" /> },
    { name: "Farm Name Tag", cost: 5, effect: "Custom name for your farm", icon: <Tag className="w-8 h-8 text-orange-200" /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-indigo-400" /> Farm Shop
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mt-2">
            Spend your hard-earned Tomatoes on cosmetics and utility items to protect your farm.
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-orange-400 p-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <p className="text-white font-bold text-sm tracking-widest uppercase">Your Balance</p>
          <p className="text-3xl font-black text-white">{tomatoesBalance} 🍅</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map((item) => (
          <div key={item.name} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all" />
            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
            <p className="text-sm text-gray-400 mb-6">{item.effect}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xl font-bold text-red-400">{item.cost} 🍅</span>
              <button 
                onClick={() => handlePurchase(item.name, item.cost)}
                disabled={tomatoesBalance < item.cost}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white font-bold rounded-lg transition-all"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
