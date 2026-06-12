/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  User, 
  Bookmark, 
  Compass, 
  Layers, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight,
  Zap,
  Cpu,
  Globe,
  ShieldCheck,
  Menu,
  Bell,
  Lock
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';

// --- Types ---
// ... (keep existing types)
interface CollectionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
}

// ... (keep existing mock data)
const COLLECTIONS: CollectionItem[] = [
  {
    id: '1',
    title: 'The Sovereign Intelligence: Post-LLM Architectures',
    category: 'Strategic Advisory',
    description: 'An analysis of agentic frameworks moving beyond simple transformer models into autonomous reasoning systems.',
    image: 'https://picsum.photos/seed/arch1/800/600',
    date: 'MAR 04',
    readTime: '12 MIN',
    author: 'A. VANCE'
  },
  {
    id: '2',
    title: 'Curated Assets: Neural Interface Design Systems',
    category: 'Resources',
    description: 'A collection of high-fidelity UI kits specifically designed for BCI and spatial computing environments.',
    image: 'https://picsum.photos/seed/arch2/800/600',
    date: 'MAR 02',
    readTime: '8 MIN',
    author: 'E. CHEN'
  },
  {
    id: '3',
    title: 'The Silicon Frontier: Compute Arbitrage Strategies',
    category: 'Market Intel',
    description: 'How elite firms are navigating the GPU shortage through decentralized compute clusters and custom ASIC pipelines.',
    image: 'https://picsum.photos/seed/arch3/800/600',
    date: 'FEB 28',
    readTime: '15 MIN',
    author: 'M. ROSS'
  },
  {
    id: '4',
    title: 'Ethical Moats: Building Defensible AI Brands',
    category: 'Editorial',
    description: 'Why transparency and verifiable alignment are becoming the ultimate competitive advantage in the 2026 landscape.',
    image: 'https://picsum.photos/seed/arch4/800/600',
    date: 'FEB 25',
    readTime: '10 MIN',
    author: 'S. KNIGHT'
  }
];

const CATEGORIES = ['All', 'Strategic', 'Resources', 'Market Intel', 'Editorial', 'Assets'];

// --- Components ---

const Header = ({ onSearchOpen }: { onSearchOpen: () => void }) => (
  <header className="fixed top-0 left-0 right-0 z-50 h-16 glass-card flex items-center justify-between px-6 border-b border-black/5">
    <div className="flex items-center gap-2">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
          <span className="text-white font-serif font-bold text-xl leading-none">a</span>
        </div>
        <h1 className="text-lg font-serif italic font-bold tracking-tight">the architech</h1>
      </Link>
    </div>
    
    <div className="flex items-center gap-4">
      <button 
        onClick={onSearchOpen}
        className="p-2 hover:bg-black/5 rounded-full transition-colors"
      >
        <Search size={20} strokeWidth={1.5} />
      </button>
      <button className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
        <Bell size={20} strokeWidth={1.5} />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></span>
      </button>
      <Link to="/admin" className="p-2 hover:bg-black/5 rounded-full transition-colors">
        <Lock size={20} strokeWidth={1.5} />
      </Link>
    </div>
  </header>
);

// ... (keep other components like BottomNav, Card, FeaturedHero)
const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 glass-card flex items-center justify-around px-4 border-t border-black/5 pb-4">
    {[
      { id: 'home', icon: Compass, label: 'Explore' },
      { id: 'collections', icon: Layers, label: 'Library' },
      { id: 'trending', icon: TrendingUp, label: 'Trends' },
      { id: 'saved', icon: Bookmark, label: 'Saved' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`flex flex-col items-center gap-1 transition-all relative ${
          activeTab === item.id ? 'text-black' : 'text-black/40 hover:text-black/60'
        }`}
      >
        <item.icon size={22} strokeWidth={activeTab === item.id ? 2 : 1.5} />
        <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
        {activeTab === item.id && (
          <motion.div 
            layoutId="nav-indicator"
            className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
          />
        )}
      </button>
    ))}
  </nav>
);

const Card = ({ item }: { item: CollectionItem }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group relative bg-white rounded-xl overflow-hidden luxury-shadow border border-black/[0.03] flex flex-col hover:border-black/10 transition-all duration-500"
  >
    <div className="aspect-[16/10] overflow-hidden relative">
      <img 
        src={item.image} 
        alt={item.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest rounded-full border border-black/5 shadow-sm">
          {item.category}
        </span>
      </div>
    </div>
    
    <div className="p-6 flex flex-col flex-grow relative">
      <div className="textured-bg absolute inset-0 opacity-[0.01] pointer-events-none" />
      <div className="flex justify-between items-start mb-3 relative z-10">
        <span className="text-[10px] font-mono text-black/30 uppercase tracking-tighter">
          {item.date} // {item.readTime}
        </span>
        <button className="text-black/10 hover:text-black transition-colors">
          <Bookmark size={14} />
        </button>
      </div>
      <h3 className="text-xl font-serif font-bold leading-tight mb-3 group-hover:text-black/80 transition-colors relative z-10">
        {item.title}
      </h3>
      <p className="text-sm text-black/50 line-clamp-2 mb-6 font-light leading-relaxed relative z-10">
        {item.description}
      </p>
      <div className="mt-auto pt-5 border-t border-black/[0.03] flex items-center justify-between relative z-10">
        <span className="text-[10px] font-medium uppercase tracking-widest text-black/30 italic">
          By {item.author}
        </span>
        <div className="flex items-center gap-1 text-black font-medium text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
          View <ArrowUpRight size={12} />
        </div>
      </div>
    </div>
  </motion.div>
);

const FeaturedHero = () => (
  <section className="relative w-full h-[70vh] min-h-[500px] rounded-2xl overflow-hidden mb-16 group luxury-shadow border border-black/5">
    <img 
      src="https://picsum.photos/seed/hero/1600/1000" 
      alt="Featured"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-[2000ms]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
    <div className="textured-bg absolute inset-0 opacity-[0.03] pointer-events-none" />
    <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-6"
      >
        <span className="w-12 h-[1px] bg-white/30" />
        <span className="text-white/50 text-[10px] font-mono uppercase tracking-[0.3em]">Strategic Intelligence // 001</span>
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl md:text-8xl font-serif text-white font-bold leading-[0.9] mb-8 italic tracking-tighter"
      >
        The Architecture <br /> of Agency.
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/50 text-lg md:text-xl mb-10 font-light max-w-xl leading-relaxed"
      >
        A definitive briefing on the transition from predictive models to autonomous strategic entities.
      </motion.p>
      <motion.button 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-10 py-5 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-stone-200 transition-all flex items-center gap-3 shadow-2xl"
      >
        Access Intelligence <ChevronRight size={14} />
      </motion.button>
    </div>
  </section>
);

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 md:px-8 max-w-7xl mx-auto relative">
      <div className="textured-bg fixed inset-0 z-0" />
      <Header onSearchOpen={() => setIsSearchOpen(true)} />
      
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl p-8"
          >
            <div className="max-w-3xl mx-auto pt-20">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-serif italic">Search Intelligence</h2>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <Zap size={24} className="rotate-45" />
                </button>
              </div>
              <input autoFocus type="text" placeholder="QUERY_DATABASE..." className="w-full bg-transparent border-b-2 border-black py-4 text-4xl font-serif focus:outline-none placeholder:text-black/10" />
              <div className="mt-12">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4">Recent Nodes</p>
                <div className="flex flex-wrap gap-3">
                  {['Neural Architectures', 'Compute Clusters', 'Agentic Workflows', 'Silicon Arbitrage'].map(tag => (
                    <button key={tag} className="px-4 py-2 rounded-full border border-black/10 text-xs hover:bg-black hover:text-white transition-all">{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-white overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-6 py-20">
              <button onClick={() => setSelectedItem(null)} className="fixed top-8 left-8 p-3 bg-black text-white rounded-full z-10 hover:scale-110 transition-transform">
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <div className="mb-12">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4 block">{selectedItem.category} // {selectedItem.date}</span>
                <h2 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">{selectedItem.title}</h2>
                <div className="flex items-center gap-4 py-6 border-y border-black/5">
                  <div className="w-12 h-12 rounded-full bg-stone-100 border border-black/5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">{selectedItem.author}</p>
                    <p className="text-[10px] text-black/40">SENIOR STRATEGIC ADVISOR</p>
                  </div>
                </div>
              </div>
              <img src={selectedItem.image} alt={selectedItem.title} className="w-full aspect-video object-cover rounded-2xl mb-12 grayscale" />
              <div className="prose prose-stone max-w-none">
                <p className="text-xl font-light leading-relaxed mb-8 text-black/70">{selectedItem.description}</p>
                <div className="space-y-6 text-lg font-light leading-relaxed text-black/80">
                  <p>The landscape of artificial intelligence is undergoing a seismic shift...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter mb-4">Intelligence <br /> <span className="italic font-normal text-black/30">Redefined.</span></h2>
            <p className="text-black/50 text-lg font-light leading-relaxed">The Architech is your primary node for curated AI strategy, neural assets, and high-fidelity market intelligence.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <FeaturedHero />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COLLECTIONS.filter(item => selectedCategory === 'All' || item.category.includes(selectedCategory) || (selectedCategory === 'Strategic' && item.category === 'Strategic Advisory')).map((item) => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer"><Card item={item} /></div>
          ))}
        </div>
        <section className="mt-24 mb-12 p-12 rounded-2xl bg-black text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10"><Zap size={200} strokeWidth={0.5} /></div>
          <div className="relative z-10 max-w-xl">
            <h3 className="text-3xl font-serif italic mb-4">Join the Inner Circle</h3>
            <p className="text-white/60 mb-8 font-light">Receive weekly strategic briefings that the public won't see for months. Zero noise, absolute signal.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="email" placeholder="SECURE_EMAIL@NODE.COM" className="flex-grow bg-white/10 border border-white/20 rounded-full px-6 py-3 text-sm font-mono focus:outline-none focus:border-white/50 transition-colors" />
              <button className="px-6 py-3 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12 border-t border-black/5">
          {[
            { label: 'Active Nodes', value: '12.4K', icon: Globe },
            { label: 'Compute Index', value: '0.92', icon: Cpu },
            { label: 'Signal Strength', value: '99.8%', icon: Zap },
            { label: 'Protocol Status', value: 'SECURE', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-black/30"><stat.icon size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span></div>
              <span className="text-xl font-mono font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
