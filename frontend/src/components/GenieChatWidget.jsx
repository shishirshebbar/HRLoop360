// src/components/GenieChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Minimize2,
  Moon,
  Sun,
  Send,
  Paperclip,
  Mic,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export default function GenieChatWidget({ onSend, onAttach, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "✨ Hello! I'm Genie. You can type or talk — how can I help?",
      sender: "genie",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Where your backend lives (adjust if you proxy or deploy)
  const API_BASE =
    import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") || ""; // e.g. "", "http://localhost:5000"

  // Scroll to bottom
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setIsMinimized(false);
    onToggle?.(newState);
    if (newState) setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleMinimize = () => setIsMinimized((v) => !v);

  // Send message via backend proxy
  async function callGenie(userText) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText }),
  });

  // Helpful logging during debug
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("Genie HTTP error:", res.status, bodyText);
    try {
      const j = JSON.parse(bodyText);
      throw new Error(j.error || `HTTP_${res.status}`);
    } catch {
      throw new Error(`HTTP_${res.status}`);
    }
  }

  const data = await res.json();
  return data.reply || "Sorry, I couldn’t generate a response.";
}


  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    onSend?.(trimmed);
    setMessage("");
    setIsTyping(true);

    try {
      const aiText = await callGenie(trimmed);

      const genieResponse = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: "genie",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, genieResponse]);
    } catch (error) {
      console.error("Genie error:", error);
      const errorResponse = {
        id: (Date.now() + 2).toString(),
        text:
          "⚠️ Oops! Something went wrong talking to the AI. Please try again.",
        sender: "genie",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current)
      return alert("Speech recognition not supported in this browser.");
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00B894]
                     shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00B894] blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-center w-full h-full">
            <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl
            border border-gray-200/50 dark:border-gray-700/50 overflow-hidden
            transition-all duration-300 ease-out
            ${isMinimized ? "h-16 w-80" : "h-[500px] w-[380px]"}
            ${isDark ? "dark" : ""}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#6C5CE7]/10 to-[#00B894]/10 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00B894] flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Genie
                </h2>
                <p className="text-xs text-green-500 font-medium">
                  {isListening ? "🎤 Listening..." : "Online"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark((v) => !v)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-gray-300" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <button
                onClick={handleMinimize}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleToggle}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2 max-w-[80%] ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {msg.sender === "genie" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00B894] flex items-center justify-center shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                            msg.sender === "user"
                              ? "bg-gradient-to-br from-[#6C5CE7] to-[#5B4CD6] text-white rounded-tr-sm"
                              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border"
                          }`}
                        >
                          {msg.sender === "genie" ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-sm leading-relaxed">
                              {msg.text}
                            </p>
                          )}
                        </div>
                        <p
                          className={`text-xs text-gray-500 mt-1 px-1 ${
                            msg.sender === "user" ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00B894] flex items-center justify-center shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-700 border shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 bg-white/90 dark:bg-gray-900/90 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask Genie or say something..."
                      className="w-full px-4 py-3 pr-20 rounded-xl bg-gray-100 dark:bg-gray-800 border text-sm text-gray-900 dark:text-gray-100"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={() => onAttach?.()}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Attach"
                      >
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={handleMicClick}
                        className={`p-2 rounded-lg ${
                          isListening
                            ? "bg-red-200 dark:bg-red-800"
                            : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        title={isListening ? "Stop" : "Speak"}
                      >
                        <Mic className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-3 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#00B894] text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
