import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initChat = () => {
    if (!chatSessionRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    systemInstruction: "Eres InvenTory AI, un asistente experto en gestión de activos informáticos. Ayudas a los usuarios a navegar por el sistema, entender conceptos de inventario, mantenimiento y licencias. Sé breve, profesional y amable."
                }
            });
        } catch (error) {
            console.error("Error initializing AI:", error);
        }
    }
  };

  useEffect(() => {
      if (isOpen) initChat();
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        if (!chatSessionRef.current) initChat();
        
        if (!chatSessionRef.current) throw new Error("AI Service unavailable");

        const result = await chatSessionRef.current.sendMessage({ message: userMsg });
        const responseText = result.text;
        
        setMessages(prev => [...prev, { role: 'model', text: responseText || "No pude generar una respuesta." }]);
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "Lo siento, hubo un problema al conectar con el servicio de IA." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 hover:bg-blue-700 animate-bounce-subtle'}`}
        title="Asistente AI"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] max-h-[80vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-900 p-4 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">InvenTory Assistant</h3>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                    En línea (Gemini 3.0)
                </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>¡Hola! Soy tu asistente virtual.</p>
                    <p>¿En qué puedo ayudarte hoy?</p>
                </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-600'
                }`}>
                    {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100 dark:border-slate-600 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Pensando...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 bg-slate-100 dark:bg-slate-900 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 rounded-xl px-4 py-2 text-sm outline-none transition-all dark:text-white"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
                Powered by Google Gemini
            </p>
          </div>
        </div>
      )}
    </>
  );
};
