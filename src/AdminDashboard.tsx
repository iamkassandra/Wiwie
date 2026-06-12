import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  where
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Settings, 
  LogOut, 
  Plus, 
  Send, 
  Bot, 
  User as UserIcon,
  Clock,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Search
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

// --- AI Agent Service ---

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateAgentResponse = async (history: Message[], prompt: string) => {
  try {
    const model = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { role: "user", parts: [{ text: "You are 'The Architech Agent', an ultra-intelligent AI expert specialized in scaling and managing the 'Architech' platform. You are professional, strategic, and authoritative. Help the admin manage tasks, content, and growth." }]},
        ...history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: "user", parts: [{ text: prompt }]}
      ]
    });
    const response = await model;
    return response.text;
  } catch (error) {
    console.error("AI Agent Error:", error);
    return "I encountered a neural sync error. Please retry the command.";
  }
};

// --- Components ---

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'agent'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen for tasks
    const qTasks = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    // Listen for agent logs
    const qLogs = query(
      collection(db, 'agent_logs'), 
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => {
      unsubTasks();
      unsubLogs();
    };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setIsAgentLoading(true);

    try {
      // Save user message
      await addDoc(collection(db, 'agent_logs'), {
        userId: user.uid,
        role: 'user',
        message: userMsg,
        timestamp: serverTimestamp()
      });

      // Get AI response
      const responseText = await generateAgentResponse(messages, userMsg);

      // Save assistant response
      await addDoc(collection(db, 'agent_logs'), {
        userId: user.uid,
        role: 'assistant',
        message: responseText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAgentLoading(false);
    }
  };

  const addTask = async () => {
    if (!user) return;
    const title = prompt("Task Title:");
    if (!title) return;
    await addDoc(collection(db, 'tasks'), {
      title,
      description: '',
      status: 'todo',
      priority: 'medium',
      createdAt: serverTimestamp()
    });
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await updateDoc(doc(db, 'tasks', id), { status });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 text-center border-white/10"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-black font-serif font-bold text-3xl">a</span>
          </div>
          <h1 className="text-3xl font-serif text-white font-bold mb-4 italic">The Architech Control</h1>
          <p className="text-white/40 mb-10 font-light">Secure access for platform architects only.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-3"
          >
            Authenticate Node <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 flex flex-col bg-white z-20">
        <div className="p-8 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">a</span>
            </div>
            <span className="font-serif font-bold italic text-lg">Control Panel</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'tasks', icon: CheckSquare, label: 'Task Board' },
            { id: 'agent', icon: MessageSquare, label: 'AI Agent' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                activeView === item.id 
                  ? "bg-black text-white shadow-lg" 
                  : "text-black/40 hover:bg-black/5 hover:text-black"
              )}
            >
              <item.icon size={20} strokeWidth={activeView === item.id ? 2 : 1.5} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 mb-4">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-black/10" alt="" />
            <div className="flex-grow overflow-hidden">
              <p className="text-[10px] font-bold truncate">{user.displayName}</p>
              <p className="text-[8px] text-black/40 uppercase tracking-widest">Architect</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <div className="textured-bg absolute inset-0 opacity-[0.02] pointer-events-none" />
        
        {/* Header */}
        <header className="h-16 border-b border-black/5 bg-white/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
          <h2 className="text-lg font-serif font-bold italic capitalize">{activeView}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-black/5 border-none rounded-full pl-10 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-black/10 w-64"
              />
            </div>
            <button className="p-2 hover:bg-black/5 rounded-full"><Settings size={18} /></button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-grow overflow-y-auto p-8 relative z-10">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 rounded-2xl bg-white border-black/5">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Pending Tasks</p>
                    <p className="text-4xl font-serif font-bold">{tasks.filter(t => t.status !== 'done').length}</p>
                  </div>
                  <div className="glass-card p-6 rounded-2xl bg-white border-black/5">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Agent Syncs</p>
                    <p className="text-4xl font-serif font-bold">{messages.length}</p>
                  </div>
                  <div className="glass-card p-6 rounded-2xl bg-white border-black/5">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Platform Health</p>
                    <p className="text-4xl font-serif font-bold text-emerald-500">99.9%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-6 border border-black/5 luxury-shadow">
                    <h3 className="text-lg font-serif font-bold mb-6 italic">Recent Activity</h3>
                    <div className="space-y-4">
                      {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-3 hover:bg-black/5 rounded-xl transition-all">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                          )} />
                          <div className="flex-grow">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-[10px] text-black/40 uppercase tracking-widest">{task.status}</p>
                          </div>
                          <ChevronRight size={14} className="text-black/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-black text-white rounded-2xl p-8 relative overflow-hidden">
                    <Bot className="absolute -right-8 -bottom-8 opacity-10" size={200} />
                    <h3 className="text-2xl font-serif italic mb-4">Agent Status: Active</h3>
                    <p className="text-white/50 font-light mb-8">The Architech Agent is monitoring platform nodes and processing strategic tasks.</p>
                    <button 
                      onClick={() => setActiveView('agent')}
                      className="px-6 py-3 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200"
                    >
                      Open Comms
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'tasks' && (
              <motion.div 
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-bold italic">Task Board</h3>
                  <button 
                    onClick={addTask}
                    className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Plus size={16} /> New Objective
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow">
                  {(['todo', 'in-progress', 'done'] as const).map(status => (
                    <div key={status} className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">{status.replace('-', ' ')}</h4>
                        <span className="text-[10px] font-mono bg-black/5 px-2 py-0.5 rounded-full">
                          {tasks.filter(t => t.status === status).length}
                        </span>
                      </div>
                      <div className="flex-grow space-y-4 bg-black/[0.02] p-4 rounded-2xl border border-dashed border-black/10">
                        {tasks.filter(t => t.status === status).map(task => (
                          <motion.div 
                            layoutId={task.id}
                            key={task.id}
                            className="bg-white p-5 rounded-xl border border-black/5 luxury-shadow group cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className={cn(
                                "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                task.priority === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                              )}>
                                {task.priority}
                              </span>
                              <button className="text-black/10 group-hover:text-black transition-colors"><MoreVertical size={14} /></button>
                            </div>
                            <h5 className="text-sm font-medium mb-4">{task.title}</h5>
                            <div className="flex items-center justify-between pt-4 border-t border-black/5">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-stone-200 border border-white" />
                              </div>
                              <div className="flex gap-1">
                                {status !== 'todo' && (
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, status === 'done' ? 'in-progress' : 'todo')}
                                    className="p-1.5 hover:bg-black/5 rounded-lg text-black/20 hover:text-black"
                                  >
                                    <ChevronRight className="rotate-180" size={14} />
                                  </button>
                                )}
                                {status !== 'done' && (
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, status === 'todo' ? 'in-progress' : 'done')}
                                    className="p-1.5 hover:bg-black/5 rounded-lg text-black/20 hover:text-black"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'agent' && (
              <motion.div 
                key="agent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col max-w-4xl mx-auto w-full"
              >
                <div className="flex-grow overflow-y-auto space-y-6 pb-8 pr-4">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                        <Bot size={40} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-serif italic mb-4">Neural Link Established</h3>
                      <p className="text-black/40 font-light max-w-sm">
                        I am The Architech Agent. Command me to manage tasks, generate content, or analyze platform metrics.
                      </p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex gap-4 max-w-[85%]",
                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        msg.role === 'user' ? "bg-black" : "bg-stone-200"
                      )}>
                        {msg.role === 'user' ? <UserIcon size={14} className="text-white" /> : <Bot size={14} />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user' ? "bg-black text-white" : "bg-white border border-black/5 luxury-shadow"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAgentLoading && (
                    <div className="flex gap-4 mr-auto">
                      <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                        <Bot size={14} />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-black/5 luxury-shadow flex gap-1">
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="mt-4 relative">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Command the agent..."
                    className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 luxury-shadow"
                  />
                  <button 
                    type="submit"
                    disabled={!inputMessage.trim() || isAgentLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-xl disabled:opacity-20 transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
