import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./App";

// ─── Types ────────────────────────────────────────────────
interface Message {
  id: string;
  order_id: string | null;
  order_email: string;
  sender_email: string;
  sender_type: "client" | "admin";
  message: string;
  image_url: string | null;
  voice_url: string | null;
  reply_to: string | null;
  read: boolean;
  delivered: boolean;
  edited_at: string | null;
  created_at: string;
}

interface Presence {
  is_online: boolean;
  last_seen: string | null;
}

// ─── Constants ────────────────────────────────────────────
const WA_NUMBER = "6282221994691";
const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const TYPING_DEBOUNCE_MS = 2000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ─── SVG Icons (inline, no emoji) ─────────────────────────
function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconAttach() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
function IconStop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconReply() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
  );
}
function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
  );
}
function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── Read Receipt Checkmarks ──────────────────────────────
function ReadReceipt({ msg }: { msg: Message }) {
  if (msg.sender_type !== "client") return null;
  const read = msg.read;
  const delivered = msg.delivered || read;
  const color = read ? "#53BDEB" : "rgba(255,255,255,0.5)";
  if (!delivered) {
    // Single check — sent
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" className="cw-receipt">
        <path d="M11.07 0.54L4.93 7.09L2.4 4.73L1 6.2L4.93 9.94L12.47 2.01L11.07 0.54Z" fill={color} />
      </svg>
    );
  }
  // Double check — delivered or read
  return (
    <svg width="20" height="11" viewBox="0 0 20 11" fill="none" className="cw-receipt">
      <path d="M14.07 0.54L7.93 7.09L7.23 6.43L5.83 7.9L7.93 9.94L15.47 2.01L14.07 0.54Z" fill={color} />
      <path d="M10.07 0.54L3.93 7.09L1.4 4.73L0 6.2L3.93 9.94L11.47 2.01L10.07 0.54Z" fill={color} />
    </svg>
  );
}

// ─── Voice Player ─────────────────────────────────────────
function VoicePlayer({ url, isClient }: { url: string; isClient: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("ended", () => { setPlaying(false); setProgress(0); });
    return () => { audio.pause(); audio.src = ""; };
  }, [url]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play(); }
    setPlaying(!playing);
  };

  const fmtDur = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`cw-voice ${isClient ? "cw-voice-client" : "cw-voice-admin"}`}>
      <button className="cw-voice-btn" onClick={toggle}>{playing ? <IconPause /> : <IconPlay />}</button>
      <div className="cw-voice-track">
        <div className="cw-voice-bar" style={{ width: `${progress}%` }} />
      </div>
      <span className="cw-voice-dur">{fmtDur(duration)}</span>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────
function TypingBubble() {
  return (
    <div className="cw-typing">
      <span /><span /><span />
    </div>
  );
}

// ─── Time Formatter ───────────────────────────────────────
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function ChatWidget({ orderEmail, orderId }: { orderEmail: string; orderId?: string }) {
  // ── State ─────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [adminPresence, setAdminPresence] = useState<Presence>({ is_online: false, last_seen: null });
  const [contextMsg, setContextMsg] = useState<Message | null>(null);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [imgOverlay, setImgOverlay] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Scroll to bottom ──────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // ── Request notification permission ───────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Update own presence ───────────────────────────────
  useEffect(() => {
    if (!supabase || !orderEmail) return;
    const upsertPresence = (online: boolean) => {
      supabase.from("user_presence").upsert({
        email: orderEmail,
        is_online: online,
        last_seen: new Date().toISOString(),
        user_type: "client",
      }, { onConflict: "email" }).then(() => {});
    };
    if (isOpen) upsertPresence(true);
    const handleVisibility = () => upsertPresence(!document.hidden && isOpen);
    const handleBeforeUnload = () => upsertPresence(false);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      upsertPresence(false);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [orderEmail, isOpen]);

  // ── Subscribe to admin presence ───────────────────────
  useEffect(() => {
    if (!supabase || !isOpen) return;
    // Fetch admin presence
    supabase.from("user_presence").select("*").eq("user_type", "admin").limit(1)
      .then(({ data }) => {
        if (data?.[0]) setAdminPresence({ is_online: data[0].is_online, last_seen: data[0].last_seen });
      });
    const sub = supabase
      .channel("admin-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_presence", filter: "user_type=eq.admin" },
        (payload: any) => {
          const row = payload.new;
          if (row) setAdminPresence({ is_online: row.is_online, last_seen: row.last_seen });
        })
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [isOpen]);

  // ── Fetch messages ────────────────────────────────────
  useEffect(() => {
    if (!orderEmail || !supabase) return;
    supabase
      .from("messages")
      .select("*")
      .eq("order_email", orderEmail)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setMessages(data as Message[]);
          setUnreadCount(data.filter((m: any) => !m.read && m.sender_type === "admin").length);
        }
      });
  }, [orderEmail]);

  // ── Realtime messages subscription ────────────────────
  useEffect(() => {
    if (!orderEmail || !supabase) return;
    const channel = supabase
      .channel(`chat:${orderEmail}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_email=eq.${orderEmail}` },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_type === "admin") {
            if (isOpen) {
              // Mark as read immediately
              supabase.from("messages").update({ read: true, delivered: true }).eq("id", newMsg.id).then(() => {});
            } else {
              setUnreadCount((c) => c + 1);
              // Browser notification
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Dean Designers", { body: newMsg.voice_url ? "Sent a voice message" : newMsg.image_url ? "Sent an image" : newMsg.message, icon: "/favicon.png" });
              }
            }
            // Play ding sound
            try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgICAgICAgIB/f3+AgICBgYKDhIWGh4iJiImJiYiHhoWEgoGAf359fHt6enp6ent8fX5/gYKDhIWGh4eIiIiIh4aFhIOCgH9+fXx7enp6enp7fH1+f4GCg4SFhoeHiIiIiIeGhYSDgoB/fn18e3p6enp6e3x9fn+BgoOEhYaHh4iIiIiHhoWEg4KAf359fHt6enp6ent8fX5/gYKDhIOEhYWFhYSDgoGA").play().catch(() => {}); } catch {}
          }
          scrollToBottom();
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `order_email=eq.${orderEmail}` },
        (payload: any) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `order_email=eq.${orderEmail}` },
        (payload: any) => {
          const deleted = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [orderEmail, isOpen, scrollToBottom]);

  // ── Typing indicator (broadcast) ──────────────────────
  useEffect(() => {
    if (!supabase || !isOpen) return;
    const ch = supabase.channel(`typing:${orderEmail}`);
    ch.on("broadcast", { event: "typing" }, (payload: any) => {
      if (payload?.payload?.sender === "admin") {
        setRemoteTyping(true);
        setTimeout(() => setRemoteTyping(false), 3000);
      }
    }).subscribe();
    return () => { ch.unsubscribe(); };
  }, [orderEmail, isOpen]);

  const broadcastTyping = useCallback(() => {
    if (!supabase) return;
    supabase.channel(`typing:${orderEmail}`).send({ type: "broadcast", event: "typing", payload: { sender: "client" } });
  }, [orderEmail]);

  // ── Mark admin messages as read when chat opens ───────
  useEffect(() => {
    if (!isOpen || !supabase || !orderEmail) return;
    setUnreadCount(0);
    supabase.from("messages")
      .update({ read: true, delivered: true })
      .eq("order_email", orderEmail)
      .eq("sender_type", "admin")
      .eq("read", false)
      .then(() => {});
    scrollToBottom();
  }, [isOpen, orderEmail, scrollToBottom]);

  // ── Close context menu on click outside ───────────────
  useEffect(() => {
    if (!contextMsg) return;
    const close = () => setContextMsg(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMsg]);

  // ── Auto-resize textarea ──────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [inputVal]);

  // ── Send Message ──────────────────────────────────────
  const handleSend = async () => {
    if (!inputVal.trim() || !supabase || isSending) return;

    // Edit mode
    if (editingMsg) {
      await supabase.from("messages").update({ message: inputVal.trim(), edited_at: new Date().toISOString() }).eq("id", editingMsg.id);
      setEditingMsg(null);
      setInputVal("");
      return;
    }

    setIsSending(true);
    const payload: any = {
      order_email: orderEmail,
      order_id: orderId || null,
      sender_email: orderEmail,
      sender_type: "client",
      message: inputVal.trim(),
      read: false,
      delivered: false,
    };
    if (replyTo) payload.reply_to = replyTo.id;

    const { error } = await supabase.from("messages").insert([payload]);
    if (!error) {
      setInputVal("");
      setReplyTo(null);
      // Play send sound
      try { new Audio("data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YToFAACAgICAgICAgICBgoOEhYaHiImJiYiHhoWEgoGAf359fHt6enp6ent8fX5/gYKDhIOEhQ==").play().catch(() => {}); } catch {}
      scrollToBottom();
    }
    setIsSending(false);
  };

  // ── Send File/Image ───────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    if (file.size > MAX_FILE_SIZE) { alert("File too large. Max 50MB."); return; }

    setIsSending(true);
    const ext = file.name.split(".").pop() || "file";
    const path = `chat/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("uploads").upload(path, file);
    if (uploadErr) { setIsSending(false); return; }
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    const url = data?.publicUrl;
    if (!url) { setIsSending(false); return; }

    await supabase.from("messages").insert([{
      order_email: orderEmail,
      order_id: orderId || null,
      sender_email: orderEmail,
      sender_type: "client",
      message: file.type.startsWith("image/") ? "" : file.name,
      image_url: url,
      read: false,
      delivered: false,
      reply_to: replyTo?.id || null,
    }]);
    setReplyTo(null);
    setIsSending(false);
    scrollToBottom();
    e.target.value = "";
  };

  // ── Voice Recording ───────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        if (blob.size < 1000) return; // too short, ignore
        await uploadVoice(blob, rec.mimeType.includes("webm") ? "webm" : "mp4");
      };
      mediaRecRef.current = rec;
      rec.start();
      setIsRecording(true);
      setRecordSec(0);
      recordTimerRef.current = setInterval(() => setRecordSec((s) => s + 1), 1000);
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  const uploadVoice = async (blob: Blob, ext: string) => {
    if (!supabase) return;
    setIsSending(true);
    const path = `voice/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("uploads").upload(path, blob);
    if (uploadErr) { setIsSending(false); return; }
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    if (!data?.publicUrl) { setIsSending(false); return; }

    await supabase.from("messages").insert([{
      order_email: orderEmail,
      order_id: orderId || null,
      sender_email: orderEmail,
      sender_type: "client",
      message: "",
      voice_url: data.publicUrl,
      read: false,
      delivered: false,
    }]);
    setIsSending(false);
    scrollToBottom();
  };

  // ── Delete Message ────────────────────────────────────
  const handleDelete = async (msg: Message) => {
    if (!supabase || msg.sender_type !== "client") return;
    await supabase.from("messages").delete().eq("id", msg.id);
    setContextMsg(null);
  };

  // ── Edit Message ──────────────────────────────────────
  const handleEdit = (msg: Message) => {
    if (msg.sender_type !== "client") return;
    const elapsed = Date.now() - new Date(msg.created_at).getTime();
    if (elapsed > EDIT_WINDOW_MS) return;
    setEditingMsg(msg);
    setInputVal(msg.message);
    setContextMsg(null);
    textareaRef.current?.focus();
  };

  // ── Context Menu ──────────────────────────────────────
  const openContext = (e: React.MouseEvent | React.TouchEvent, msg: Message) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = panelRef.current?.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setContextPos({ x: clientX - (rect?.left || 0), y: clientY - (rect?.top || 0) });
    setContextMsg(msg);
  };

  // ── Find reply-to message ─────────────────────────────
  const findMsg = (id: string | null) => messages.find((m) => m.id === id);

  // ── Textarea key handler (Enter = newline, no send) ───
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Broadcast typing
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    broadcastTyping();
    typingTimerRef.current = setTimeout(() => {}, TYPING_DEBOUNCE_MS);
  };

  // ── Render ────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Chat Button ── */}
      <button className="cw-fab" onClick={() => { setIsOpen(!isOpen); if (!isOpen) setUnreadCount(0); }} aria-label="Chat">
        {isOpen ? <IconClose /> : <IconChat />}
        {!isOpen && unreadCount > 0 && <span className="cw-fab-badge">{unreadCount}</span>}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="cw-panel" ref={panelRef}>
          {/* Header */}
          <div className="cw-header">
            <div className="cw-header-info">
              <div className="cw-header-avatar">
                <span className={`cw-online-dot ${adminPresence.is_online ? "online" : ""}`} />
                DD
              </div>
              <div>
                <div className="cw-header-name">Dean Designers</div>
                <div className="cw-header-status">
                  {adminPresence.is_online ? "Online" : adminPresence.last_seen ? `Last seen ${relativeTime(adminPresence.last_seen)}` : "Offline"}
                </div>
              </div>
            </div>
            <div className="cw-header-actions">
              <button className="cw-header-btn" onClick={() => window.open(`https://wa.me/${WA_NUMBER}`, "_blank")} title="Voice Call via WhatsApp"><IconPhone /></button>
              <button className="cw-header-btn" onClick={() => setIsOpen(false)} title="Close"><IconClose /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="cw-messages">
            {messages.length === 0 && (
              <div className="cw-empty">
                <div className="cw-empty-icon"><IconChat /></div>
                <p>Send a message to start chatting with your designer.</p>
              </div>
            )}
            {messages.map((msg) => {
              const isClient = msg.sender_type === "client";
              const replyMsg = msg.reply_to ? findMsg(msg.reply_to) : null;
              const canEdit = isClient && (Date.now() - new Date(msg.created_at).getTime()) < EDIT_WINDOW_MS;
              return (
                <div key={msg.id} className={`cw-msg ${isClient ? "cw-msg-client" : "cw-msg-admin"}`}
                  onContextMenu={(e) => openContext(e, msg)}>
                  {/* Reply preview */}
                  {replyMsg && (
                    <div className={`cw-reply-preview ${isClient ? "cw-reply-client" : "cw-reply-admin"}`}>
                      <div className="cw-reply-bar" />
                      <div className="cw-reply-content">
                        <span className="cw-reply-name">{replyMsg.sender_type === "admin" ? "Dean Designers" : "You"}</span>
                        <span className="cw-reply-text">{replyMsg.voice_url ? "Voice message" : replyMsg.message.slice(0, 80)}</span>
                      </div>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`cw-bubble ${isClient ? "cw-bubble-client" : "cw-bubble-admin"}`}>
                    {/* Image */}
                    {msg.image_url && (
                      <img className="cw-img" src={msg.image_url} alt="Attachment" loading="lazy"
                        onClick={() => setImgOverlay(msg.image_url)} />
                    )}
                    {/* Voice */}
                    {msg.voice_url && <VoicePlayer url={msg.voice_url} isClient={isClient} />}
                    {/* Text */}
                    {msg.message && <div className="cw-text">{msg.message}</div>}
                    {/* Footer: time + edited + receipt */}
                    <div className="cw-meta">
                      {msg.edited_at && <span className="cw-edited">edited</span>}
                      <span className="cw-time">{fmtTime(msg.created_at)}</span>
                      <ReadReceipt msg={msg} />
                    </div>
                  </div>

                  {/* Quick reply button on hover */}
                  <button className="cw-quick-reply" onClick={() => { setReplyTo(msg); textareaRef.current?.focus(); }} title="Reply">
                    <IconReply />
                  </button>
                </div>
              );
            })}

            {/* Typing indicator */}
            {remoteTyping && (
              <div className="cw-msg cw-msg-admin">
                <div className="cw-bubble cw-bubble-admin">
                  <TypingBubble />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply / Edit bar */}
          {(replyTo || editingMsg) && (
            <div className="cw-action-bar">
              <div className="cw-action-bar-icon">{editingMsg ? <IconEdit /> : <IconReply />}</div>
              <div className="cw-action-bar-content">
                <span className="cw-action-bar-label">{editingMsg ? "Editing message" : `Reply to ${replyTo!.sender_type === "admin" ? "Dean Designers" : "yourself"}`}</span>
                <span className="cw-action-bar-text">{(editingMsg || replyTo)!.message.slice(0, 60)}</span>
              </div>
              <button className="cw-action-bar-close" onClick={() => { setReplyTo(null); setEditingMsg(null); setInputVal(""); }}><IconClose /></button>
            </div>
          )}

          {/* Input Area */}
          <div className="cw-input-area">
            {isRecording ? (
              <div className="cw-recording">
                <div className="cw-rec-dot" />
                <span className="cw-rec-time">{Math.floor(recordSec / 60)}:{(recordSec % 60).toString().padStart(2, "0")}</span>
                <span className="cw-rec-label">Recording...</span>
                <button className="cw-rec-stop" onClick={stopRecording}><IconStop /></button>
              </div>
            ) : (
              <>
                <button className="cw-input-btn" onClick={() => fileInputRef.current?.click()} title="Attach file"><IconAttach /></button>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.zip,.rar,.ai,.psd,.svg,.eps" style={{ display: "none" }} onChange={handleFileUpload} />
                <textarea
                  ref={textareaRef}
                  className="cw-textarea"
                  placeholder="Type a message..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isSending}
                />
                {inputVal.trim() ? (
                  <button className="cw-send-btn" onClick={handleSend} disabled={isSending}><IconSend /></button>
                ) : (
                  <button className="cw-input-btn" onClick={startRecording} title="Voice note"><IconMic /></button>
                )}
              </>
            )}
          </div>

          {/* Context Menu */}
          {contextMsg && (
            <div className="cw-ctx" style={{ top: contextPos.y, left: Math.min(contextPos.x, 220) }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setReplyTo(contextMsg); setContextMsg(null); textareaRef.current?.focus(); }}><IconReply /> Reply</button>
              {contextMsg.sender_type === "client" && (Date.now() - new Date(contextMsg.created_at).getTime()) < EDIT_WINDOW_MS && (
                <button onClick={() => handleEdit(contextMsg)}><IconEdit /> Edit</button>
              )}
              {contextMsg.sender_type === "client" && (
                <button className="cw-ctx-danger" onClick={() => handleDelete(contextMsg)}><IconTrash /> Delete</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Overlay */}
      {imgOverlay && (
        <div className="cw-img-overlay" onClick={() => setImgOverlay(null)}>
          <img src={imgOverlay} alt="Preview" />
        </div>
      )}
    </>
  );
}
