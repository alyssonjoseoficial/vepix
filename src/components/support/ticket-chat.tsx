"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { addTicketMessage } from "@/lib/actions/support";
import { Send } from "lucide-react";

type Message = {
  id: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: Date;
  sender: { name: string | null };
};

export function TicketChat({ 
  ticketId, 
  initialMessages, 
  isAdminView = false,
  status
}: { 
  ticketId: string; 
  initialMessages: Message[];
  isAdminView?: boolean;
  status: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    const result = await addTicketMessage(ticketId, newMessage, isAdminView);
    
    if (result.success) {
      // Optimistic update
      setMessages([...messages, {
        id: Math.random().toString(),
        message: newMessage,
        isFromAdmin: isAdminView,
        createdAt: new Date(),
        sender: { name: "Você" }
      }]);
      setNewMessage("");
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  }

  const isClosed = status === "CLOSED" || status === "RESOLVED";

  return (
    <div className="flex flex-col h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = isAdminView ? msg.isFromAdmin : !msg.isFromAdmin;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'}`}>
                <div className={`text-[10px] mb-1 font-semibold ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                  {isMine ? "Você" : msg.sender.name || (msg.isFromAdmin ? "Suporte VePix" : "Lojista")} • {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        {isClosed && !isAdminView ? (
          <div className="text-center p-3 text-sm text-slate-500 bg-slate-50 rounded-lg">
            Este chamado foi encerrado.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
            </div>
            <Button type="submit" disabled={loading || !newMessage.trim()} className="h-[60px] w-[60px] rounded-xl">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
