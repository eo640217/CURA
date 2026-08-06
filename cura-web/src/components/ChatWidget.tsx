import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../api/chat";
import "./ChatWidget.scss";

type Role = "user" | "assistant";

type Message = {
  id: number;
  role: Role;
  text: string;
};

let nextId = 0;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId++,
      role: "assistant",
      text: "Hi! I can answer questions about our care home policies. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { id: nextId++, role: "user", text }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(text);
      setMessages(prev => [...prev, { id: nextId++, role: "assistant", text: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="chatWidget">
      {open && (
        <div className="chatWidget__panel">
          <div className="chatWidget__header">
            <span className="chatWidget__headerTitle">Policy Assistant</span>
            <button
              className="chatWidget__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chatWidget__messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`chatWidget__bubble chatWidget__bubble--${msg.role}`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="chatWidget__bubble chatWidget__bubble--assistant chatWidget__bubble--loading">
                <span className="chatWidget__dot" />
                <span className="chatWidget__dot" />
                <span className="chatWidget__dot" />
              </div>
            )}

            {error && <p className="chatWidget__error">{error}</p>}

            <div ref={bottomRef} />
          </div>

          <div className="chatWidget__inputRow">
            <input
              ref={inputRef}
              className="chatWidget__input"
              type="text"
              placeholder="Ask about our policies..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={1000}
            />
            <button
              className="chatWidget__send"
              onClick={() => void handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="chatWidget__fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close policy assistant" : "Open policy assistant"}
      >
        {open ? (
          <span className="chatWidget__fabIcon">✕</span>
        ) : (
          <span className="chatWidget__fabIcon">💬</span>
        )}
      </button>
    </div>
  );
}
