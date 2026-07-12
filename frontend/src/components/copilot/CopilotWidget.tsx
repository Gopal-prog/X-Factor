import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import type { CopilotMessage } from '@/types';
import { sendCopilotMessage } from '@/api/services';

export default function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: 'assistant',
      content: 'Hi, I\u2019m your security copilot. Ask me about risk, drifts, or recommendations for any project.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: CopilotMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await sendCopilotMessage({ message: text, history: newMessages });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I could not reach the copilot service. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-white shadow-lg shadow-accent/30 flex items-center justify-center hover:bg-accent/90 transition-colors focus-ring z-40"
          aria-label="Open AI Copilot"
        >
          <Bot size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-[22rem] max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)] rounded-2xl border border-border bg-surface shadow-2xl flex flex-col z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-surface-hover">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text leading-tight">AI Copilot</p>
                <p className="text-xs text-safe leading-tight">Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-text focus-ring rounded p-1" aria-label="Close copilot">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-xl px-3 py-2 text-sm max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-surface-hover text-text border border-border rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 text-sm bg-surface-hover border border-border text-muted rounded-bl-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about risk, drifts, controls..."
              className="flex-1 bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus-ring"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 focus-ring"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
