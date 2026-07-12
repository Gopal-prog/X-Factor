import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import type { CopilotMessage } from '@/types';
import { sendCopilotMessage } from '@/api/services';
import { useAuth } from "@/context/AuthContext";

const suggestions = [
  'Summarize today\u2019s highest-risk drifts',
  'Which controls need attention this week?',
  'Explain the attack path for the Payments Gateway twin',
];

export default function AICopilotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi, I\u2019m your security copilot. Ask me about risk posture, recent drifts, control health, or recommended remediations across any project.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const newMessages: CopilotMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await sendCopilotMessage({
      message: trimmed,
      history: newMessages,
    });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {

  console.log(err);

  console.log(err.response);

  console.log(err.response?.data);

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: JSON.stringify(err.response?.data),
    },
  ]);

} finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="AI Copilot" hideCopilotWidget>
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="!p-0 overflow-hidden flex flex-col h-[65vh]">
          <div className="flex items-center gap-2 px-5 h-14 border-b border-border bg-surface-hover">
            <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text leading-tight">Security Copilot</p>
              <p className="text-xs text-safe leading-tight">Online \u00b7 Connected to /copilot/chat</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center mr-2 shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-sm max-w-[75%] leading-relaxed ${
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
                <div className="rounded-xl px-3.5 py-2.5 text-sm bg-surface-hover border border-border text-muted rounded-bl-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface-hover text-muted hover:text-text hover:border-accent/50 transition-colors focus-ring"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder="Ask about risk, drifts, controls, recommendations..."
                className="flex-1 bg-surface-hover border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-muted focus-ring"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="h-10 w-10 shrink-0 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 focus-ring"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
