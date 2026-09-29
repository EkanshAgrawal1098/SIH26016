import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  GitFork, 
  ArrowRight, 
  FileText, 
  RefreshCw, 
  Minimize2
} from 'lucide-react';
import { api } from '../../api/client';
import type { CopilotMessage, CopilotAction } from '../../types';

interface BhoomiCopilotProps {
  currentProjectId?: string;
  currentParcelId?: string;
  onOpenDiversionStudio?: (projectId?: string) => void;
}

export function BhoomiCopilot({ currentProjectId, currentParcelId, onOpenDiversionStudio }: BhoomiCopilotProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Namaste! I am **BhoomiAI**, your intelligent Land Acquisition Copilot.\n\nAsk me anything about corridor bottlenecks, explainable parcel risks, statutory playbooks (**RFCTLARR Sec 77(2)** / **Sec 40**), or how to **divert the road alignment** when critical delays arise.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['National Land Acquisition AI Core', 'RFCTLARR Act 2013']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCopilotQuickPrompts()
      .then(setQuickPrompts)
      .catch(() => {
        setQuickPrompts([
          { id: 'qp-bottlenecks', title: 'Corridor Bottlenecks', prompt: 'What are the most critical bottlenecks in NH-143?' },
          { id: 'qp-reroute', title: 'Simulate Diverted Route', prompt: 'How can we divert the road alignment around high-risk delayed parcels?' },
          { id: 'qp-parcel-risk', title: 'Explain Parcel Risk', prompt: 'Why is parcel IN-JH-RAN-0012 flagged as High Risk, and what statutory remedies apply?' },
          { id: 'qp-sec77', title: 'Section 77 Statutory Guide', prompt: 'How can RFCTLARR Section 77(2) help us take possession despite court disputes?' },
        ]);
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithCopilot({
        message: textToSend,
        project_id: currentProjectId || 'PRJ-HW-01',
        parcel_id: currentParcelId
      });

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: res.actions,
        sources: res.sources,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Copilot backend error:', err);
      // Fallback local intelligent response
      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `### 🛣️ AI Corridor Analysis & Rerouting\n\nFor the active project, the AI Route Engine identifies critical right-of-way bottlenecks. You can evaluate alternative bypass alignments (e.g. **Northern Cadastral Bypass**) to avoid contested plots without stopping highway construction.\n\n*Statutory Note:* Under **RFCTLARR Section 77(2)**, compensation for disputed parcels can be deposited in the LARRA authority to enable Section 38 possession.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          {
            type: 'OPEN_DIVERSION_STUDIO',
            label: 'Open AI Alignment Studio',
            payload: { project_id: currentProjectId || 'PRJ-HW-01' }
          }
        ],
        sources: ['Fallback AI Knowledge Base', 'RFCTLARR 2013']
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: CopilotAction) => {
    if (action.type === 'OPEN_DIVERSION_STUDIO') {
      if (onOpenDiversionStudio) {
        onOpenDiversionStudio(action.payload.project_id);
      } else {
        navigate(`/projects/${action.payload.project_id || 'PRJ-HW-01'}`);
      }
    } else if (action.type === 'VIEW_PROJECT') {
      navigate(`/projects/${action.payload.project_id || 'PRJ-HW-01'}`);
    } else if (action.type === 'VIEW_PARCEL') {
      navigate(`/parcels/${action.payload.parcel_id}`);
    } else if (action.type === 'DRAFT_NOTICE') {
      alert(`Statutory notice draft for Section ${action.payload.section || '77(2)'} ready for DLAO digital signature.`);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[900] flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-white shadow-xl hover:bg-slate-800 border border-indigo-500/40 hover:scale-105 transition-all group cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Bot size={20} className="text-indigo-400 group-hover:text-indigo-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight">BhoomiAI Copilot</span>
            <span className="block text-[10px] text-slate-400">Bottlenecks, Law &amp; Rerouting</span>
          </div>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[950] flex h-[620px] w-[420px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-600/30 p-1.5 text-indigo-400 border border-indigo-500/30">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  BhoomiAI Copilot
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Context: {currentProjectId || 'PRJ-HW-01'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Reset conversation"
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel / Chips */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Prompts:</span>
            {quickPrompts.slice(0, 4).map((qp) => (
              <button
                key={qp.id}
                onClick={() => handleSend(qp.prompt)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {qp.title}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {m.text}
                    </div>

                    {/* Assistant Actions */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recommended Actions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.actions.map((act, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(act)}
                              className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                            >
                              {act.type === 'OPEN_DIVERSION_STUDIO' && <GitFork size={12} />}
                              {act.type === 'VIEW_PROJECT' && <ArrowRight size={12} />}
                              {act.type === 'VIEW_PARCEL' && <FileText size={12} />}
                              {act.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1">
                        <span>Grounded in:</span>
                        <span className="font-semibold text-slate-500">{m.sources.join(' · ')}</span>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[9px] text-slate-400">{m.timestamp}</span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-3 max-w-[70%] text-xs text-slate-500 shadow-xs">
                <RefreshCw size={13} className="animate-spin text-indigo-600" />
                <span>BhoomiAI is analyzing statutory records &amp; GIS data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rerouting, bottlenecks, Sec 77..."
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
              <span>BhoomiAI complies with RFCTLARR Act 2013</span>
              <span className="font-mono">v2.4 Pro</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
