import { useState, useRef, useEffect } from "react";

const API_URL = "";

function generateSessionId() {
  return "session_" + Math.random().toString(36).slice(2, 10);
}

export default function AiChatSidebar({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm IVAI, your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const endpoint = API_URL ? `${API_URL}/api/chat` : "/api/chat";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn't reach the server. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "min(420px, 100vw)",
          height: "100vh",
          background: "#0f0f13",
          borderLeft: "1px solid #2a2a35",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1e1e28",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #13131a 0%, #0f0f13 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                boxShadow: "0 0 16px rgba(108,99,255,0.4)",
              }}
            >
              ✦
            </div>
            <div>
              <div style={{ color: "#f0f0f8", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>
                IVAI Assistant
              </div>
              <div style={{ color: "#6b6b80", fontSize: 12 }}>
                <span style={{ color: "#4ade80" }}>●</span> Online
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#6b6b80",
              cursor: "pointer",
              fontSize: 20,
              padding: "4px 8px",
              borderRadius: 6,
              transition: "color 0.2s, background 0.2s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#f0f0f8";
              e.target.style.background = "#1e1e28";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#6b6b80";
              e.target.style.background = "none";
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            scrollbarWidth: "thin",
            scrollbarColor: "#2a2a35 transparent",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 8,
                animation: "fadeUp 0.25s ease",
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                  }}
                >
                  ✦
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #6c63ff, #8b85ff)"
                      : "#1a1a24",
                  color: "#f0f0f8",
                  fontSize: 14,
                  lineHeight: 1.55,
                  border: msg.role === "assistant" ? "1px solid #2a2a35" : "none",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "#1a1a24",
                  border: "1px solid #2a2a35",
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#6c63ff",
                      animation: `bounce 1.2s ease ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px 20px 24px",
            borderTop: "1px solid #1e1e28",
            background: "#0f0f13",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "#1a1a24",
              borderRadius: 16,
              border: "1px solid #2a2a35",
              padding: "10px 12px 10px 16px",
              transition: "border-color 0.2s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = "#6c63ff";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = "#2a2a35";
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#f0f0f8",
                fontSize: 14,
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.5,
                maxHeight: 120,
                scrollbarWidth: "none",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background:
                  loading || !input.trim()
                    ? "#2a2a35"
                    : "linear-gradient(135deg, #6c63ff, #a78bfa)",
                color: loading || !input.trim() ? "#4a4a58" : "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow:
                  loading || !input.trim() ? "none" : "0 0 12px rgba(108,99,255,0.4)",
              }}
            >
              ↑
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 10, color: "#3a3a4a", fontSize: 11 }}>
            Powered by IVERAS · Press Enter to send
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}