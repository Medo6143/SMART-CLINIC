"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  MoreVertical,
  Trash2,
  Video,
  Paperclip,
  Smile,
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  Check,
  CheckCheck,
  MoreHorizontal,
  Phone,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ChatRoom } from "@/domain/entities/ChatRoom";
import { Message } from "@/domain/entities/Message";
import { FirebaseChatRepository } from "@/data/repositories/FirebaseChatRepository";
import { FirebaseUserRepository } from "@/data/repositories/FirebaseUserRepository";
import { useOnlineStatus, formatLastOnline } from "@/hooks/useOnlineStatus";
import { User } from "@/domain/entities/User";
import { MeetingCard } from "@/components/ui/MeetingCard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const chatRepo = new FirebaseChatRepository();
const userRepo = new FirebaseUserRepository();
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function ChatContainer() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msgId: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeRoom = rooms.find((r) => r.id === selectedRoomId);

  const getOtherName = useCallback(
    (room: ChatRoom) => {
      if (room.participantNames && user?.uid) {
        const otherId = room.participants.find((p) => p !== user.uid);
        if (otherId && room.participantNames[otherId]) return room.participantNames[otherId];
      }
      const otherId = room.participants.find((p) => p !== user?.uid) || room.participants[0];
      return otherId?.split("@")[0] || "User";
    },
    [user?.uid]
  );

  // Online status tracking
  useOnlineStatus(user?.uid || null);

  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);

  // Subscribe to other participant status
  useEffect(() => {
    if (!activeRoom || !user?.uid) {
      setOtherParticipant(null);
      return;
    }
    const otherId = activeRoom.participants.find((p) => p !== user.uid);
    if (!otherId) return;

    userRepo.getById(otherId).then(setOtherParticipant);
    const unsubscribe = userRepo.subscribeToUser(otherId, (u) => {
      if (u) setOtherParticipant(u);
    });
    return unsubscribe;
  }, [activeRoom, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = chatRepo.subscribeToRooms(user.uid, setRooms);
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoomId) {
      const unsubscribe = chatRepo.subscribeToMessages(selectedRoomId, setMessages);
      return unsubscribe;
    } else {
      setMessages([]);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (selectedRoomId && user?.uid) {
      chatRepo.markRoomRead(selectedRoomId, user.uid).catch(() => {});
    }
  }, [selectedRoomId, user?.uid, messages.length]);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputText]);

  const isMessageRead = (msgCreatedAt: Date) => {
    if (!activeRoom?.readBy || !user?.uid) return false;
    const otherUid = activeRoom.participants.find((p) => p !== user.uid);
    if (!otherUid) return false;
    const otherReadAt = activeRoom.readBy[otherUid];
    if (!otherReadAt) return false;
    return new Date(otherReadAt) >= msgCreatedAt;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRoomId || !user || !inputText.trim()) return;
    const text = inputText;
    setInputText("");
    try {
      await chatRepo.sendMessage(selectedRoomId, user.uid, text);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedRoomId) return;
    try {
      await chatRepo.deleteMessage(selectedRoomId, msgId);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
    setContextMenu(null);
  };

  const handleToggleReaction = async (msgId: string, emoji: string) => {
    if (!selectedRoomId || !user?.uid) return;
    await chatRepo.toggleReaction(selectedRoomId, msgId, emoji, user.uid);
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoomId) return;
    setDeletingRoom(true);
    try {
      await chatRepo.deleteRoom(selectedRoomId);
      setSelectedRoomId(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    } finally {
      setDeletingRoom(false);
    }
  };

  const filteredRooms = searchQuery
    ? rooms.filter((r) => getOtherName(r).toLowerCase().includes(searchQuery.toLowerCase()))
    : rooms;

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white/40 backdrop-blur-2xl rounded-[40px] shadow-2xl shadow-primary/5 border border-white/20 overflow-hidden animate-fade-in">
      {/* ── Conversas Sidebar ── */}
      <aside className={cn(
        "border-r border-black/5 flex flex-col bg-gray-50/50 backdrop-blur-xl transition-all duration-300",
        showSidebar ? "w-[400px] md:w-[400px] w-full absolute md:relative z-20 h-full" : "hidden md:flex md:w-[400px]"
      )}>
        <div className="p-6 md:p-8 pb-4 md:pb-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface uppercase leading-none">{t("chat.inbox")}</h1>
            <span className="bg-primary/10 text-primary px-2 md:px-3 py-1 rounded-full text-[10px] font-black">{rooms.length} {t("chat.threads")}</span>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-on-surface/20 text-lg md:text-xl transition-colors group-focus-within:text-primary" size={18} />
            <input
              type="text"
              placeholder={t("chat.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3 md:py-5 bg-white/80 border border-black/5 rounded-[20px] md:rounded-[24px] text-xs font-bold tracking-tight focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1 px-2 md:px-4">
          {filteredRooms.length === 0 ? (
            <div className="p-10 md:p-20 text-center opacity-20 flex flex-col items-center select-none grayscale">
               <MessageSquare size={48} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">{t("chat.noConnection")}</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const name = getOtherName(room);
              const isActive = selectedRoomId === room.id;
              const unread = room.unreadCount && room.unreadCount > 0;
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setShowSidebar(false);
                  }}
                  className={cn(
                    "w-full group relative p-3 md:p-5 rounded-[20px] md:rounded-[28px] flex items-center gap-3 md:gap-5 transition-all",
                    isActive
                      ? "bg-white shadow-xl shadow-black/5 scale-[1.02] z-10"
                      : "hover:bg-white/50"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl border transition-all",
                      isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-primary border-black/5"
                    )}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    {unread && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-primary text-white text-[9px] md:text-[10px] font-bold rounded-lg flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm md:text-base text-on-surface truncate tracking-tight">{name}</span>
                      <span className="text-[9px] md:text-[10px] text-on-surface/30 font-bold whitespace-nowrap pt-1">
                        {room.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[11px] md:text-xs truncate leading-relaxed",
                      unread ? "font-bold text-on-surface" : "font-medium text-on-surface/40"
                    )}>
                      {room.lastMessage || "Initialize connection..."}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Primary Connection View ── */}
      <main className="flex-1 flex flex-col bg-transparent relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedRoomId && activeRoom ? (
            <motion.div 
              key="chat-active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              <header className="h-20 md:h-28 px-4 md:px-10 flex items-center justify-between border-b border-black/5 bg-white/40 backdrop-blur-md z-20">
                <div className="flex items-center gap-3 md:gap-6">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden p-2 text-on-surface hover:bg-white/50 rounded-lg"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="relative group transition-transform active:scale-95">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-primary/10 flex items-center justify-center font-bold text-xl md:text-2xl text-primary border border-primary/5 shadow-sm">
                      {getOtherName(activeRoom).charAt(0).toUpperCase()}
                    </div>
                    {otherParticipant?.lastOnlineAt && new Date().getTime() - new Date(otherParticipant.lastOnlineAt).getTime() < 3 * 60000 && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full border-4 border-white shadow-sm animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg md:text-2xl tracking-tight leading-none mb-1 md:mb-1.5">{getOtherName(activeRoom)}</h3>
                    <div className="flex items-center gap-2">
                      {otherParticipant?.lastOnlineAt && new Date().getTime() - new Date(otherParticipant.lastOnlineAt).getTime() < 3 * 60000 ? (
                        <span className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase tracking-widest">{t("chat.activeNow")}</span>
                      ) : (
                        <span className="text-[9px] md:text-[10px] text-on-surface/40 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock size={10} />
                          {otherParticipant?.lastOnlineAt ? `${t("chat.lastSeen")} ${formatLastOnline(otherParticipant.lastOnlineAt)}` : t("chat.offline")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white/80 text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90">
                    <Video size={20} />
                  </button>
                  <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white/80 text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90">
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white/80 text-on-surface hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white/80 text-on-surface hover:bg-surface-container-high transition-all shadow-sm active:scale-90">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-10 space-y-4 md:space-y-8 no-scrollbar scroll-smooth bg-gray-50/20">
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.uid;
                  const read = isMine && isMessageRead(msg.createdAt);
                  const reactions = msg.reactions || {};
                  const reactionEntries = Object.entries(reactions).filter(([, uids]) => uids.length > 0);
                  const isMeetingLink = msg.text.includes("meet.google.com") || msg.text.includes("zoom.us");

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
                      className={cn(
                        "group/msg flex flex-col gap-2",
                        isMine ? "items-end ml-auto max-w-[85%] md:max-w-[70%]" : "items-start mr-auto max-w-[85%] md:max-w-[70%]"
                      )}
                      onMouseEnter={() => !msg.deleted && setHoveredMsgId(msg.id)}
                      onMouseLeave={() => setHoveredMsgId(null)}
                      onContextMenu={(e) => {
                        if (msg.deleted) return;
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id });
                      }}
                    >
                      <div className="relative">
                        {msg.deleted ? (
                          <div className="p-5 bg-surface-container-low/40 rounded-3xl border border-outline-variant/10 backdrop-blur-sm">
                            <p className="text-xs italic text-on-surface/40 flex items-center gap-2">
                               <AlertCircle size={14} />
                               Deleted message
                            </p>
                          </div>
                        ) : (
                          <>
                            <AnimatePresence>
                              {hoveredMsgId === msg.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                  className={cn(
                                    "absolute -top-12 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-xl rounded-full p-2 shadow-2xl border border-black/5",
                                    isMine ? "right-0" : "left-0"
                                  )}
                                >
                                   {QUICK_EMOJIS.map((emoji) => {
                                     const myReacted = reactions[emoji]?.includes(user.uid);
                                     return (
                                       <button
                                         key={emoji}
                                         onClick={() => handleToggleReaction(msg.id, emoji)}
                                         className={cn(
                                           "w-8 h-8 flex items-center justify-center rounded-full text-lg hover:scale-125 transition-all",
                                           myReacted ? "bg-primary/10" : "hover:bg-primary/5"
                                         )}
                                       >
                                         {emoji}
                                       </button>
                                     );
                                   })}
                                   <div className="w-px h-5 bg-black/10 mx-1" />
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id });
                                     }}
                                     className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/5 text-on-surface/40 transition-all"
                                   >
                                     <MoreHorizontal size={14} />
                                   </button>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {isMeetingLink ? (
                              <MeetingCard url={msg.text} isSentByMe={isMine} isRtl={false} />
                            ) : (
                              <div className={cn(
                                "p-4 md:p-5 rounded-[20px] md:rounded-[24px] text-sm leading-6 shadow-sm transition-all",
                                "break-words overflow-wrap-anywhere",
                                "max-w-full",
                                isMine
                                  ? "bg-primary text-white/95 shadow-primary/20 rounded-br-lg"
                                  : "bg-white text-on-surface border border-black/5 rounded-bl-lg"
                              )}>
                                {msg.text}
                              </div>
                            )}

                            {reactionEntries.length > 0 && (
                              <div className={cn(
                                "flex flex-wrap gap-1 mt-2.5",
                                isMine ? "justify-end" : "justify-start"
                              )}>
                                 {reactionEntries.map(([emoji, uids]) => (
                                   <motion.div
                                     key={emoji}
                                     initial={{ scale: 0 }}
                                     animate={{ scale: 1 }}
                                     className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-black/5 text-xs font-bold shadow-sm flex items-center gap-1.5"
                                   >
                                     {emoji} <span className="text-[10px] opacity-40">{uids.length}</span>
                                   </motion.div>
                                 ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className={cn(
                        "flex items-center gap-2 px-1 opacity-40",
                        isMine ? "flex-row-reverse" : ""
                      )}>
                         <span className="text-[10px] font-bold uppercase tracking-widest">
                           {msg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                         </span>
                         {isMine && !msg.deleted && (
                            <div className={cn(
                              "transition-colors",
                              read ? "text-primary" : ""
                            )}>
                              {read ? <CheckCheck size={12} /> : <Check size={12} />}
                            </div>
                         )}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <footer className="p-4 md:p-10 bg-white/40 backdrop-blur-md border-t border-black/5">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 md:gap-6 max-w-5xl mx-auto">
                   <div className="flex-1 relative group min-w-0">
                      <div className="absolute inset-0 bg-primary/5 rounded-[24px] md:rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <textarea
                        ref={textareaRef}
                        className="w-full bg-white/80 backdrop-blur-sm rounded-[20px] md:rounded-[32px] border border-black/5 px-4 md:px-8 py-3 md:py-5 text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none no-scrollbar min-h-[48px] md:min-h-[64px] max-h-[150px] relative z-10"
                        placeholder={t("chat.shareThoughts")}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        rows={1}
                      />
                      <div className="absolute bottom-2 md:bottom-3 right-3 md:right-5 z-20 flex gap-1">
                         <button type="button" className="p-1.5 md:p-2 text-on-surface/20 hover:text-primary transition-colors active:scale-90">
                           <Paperclip size={18} />
                         </button>
                         <button type="button" className="p-1.5 md:p-2 text-on-surface/20 hover:text-primary transition-colors active:scale-90">
                           <Smile size={18} />
                         </button>
                      </div>
                   </div>
                   <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-primary text-white rounded-[20px] md:rounded-[24px] shadow-xl shadow-primary/20 hover:bg-primary-container disabled:opacity-30 transition-all shrink-0"
                   >
                     <Send size={20} />
                   </motion.button>
                </form>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="chat-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-20 select-none grayscale opacity-40"
            >
               <div className="w-56 h-56 bg-primary/5 rounded-[56px] flex items-center justify-center mb-10 relative">
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-[56px]"
                   />
                   <IoChatbubblesOutline size={80} className="text-primary/20" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tight text-on-surface mb-4">{t("chat.secureChannel")}</h3>
               <p className="text-sm font-medium max-w-[320px] leading-relaxed">
                 {t("chat.selectProfessional")}
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Context Menu ── */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed z-[999] bg-on-surface text-surface py-3 px-2 rounded-[24px] min-w-[200px] shadow-2xl backdrop-blur-xl"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={() => handleDeleteMessage(contextMenu.msgId)} 
              className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-100 hover:bg-red-500 rounded-xl flex items-center gap-3 transition-colors"
            >
               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Trash2 size={14} /></div>
               Purge Message
            </button>
            <div className="h-px bg-white/5 mx-2 my-1" />
            <button 
              onClick={() => setContextMenu(null)}
              className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors"
            >
               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><X size={14} /></div>
               Dismiss
            </button>
          </motion.div>
        )}

        {showDeleteConfirm && (
           <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/20 backdrop-blur-2xl animate-fade-in p-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] w-full max-w-sm p-12 shadow-2xl border border-black/5"
              >
                 <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Trash2 size={40} className="text-red-500" />
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight text-on-surface mb-4">{t("chat.purgeThread")}</h3>
                 <p className="text-sm font-medium text-on-surface-variant mb-10 leading-relaxed">
                   {t("chat.purgeMessage")}
                 </p>
                 <div className="flex flex-col gap-3">
                    <button onClick={handleDeleteRoom} className="py-5 bg-red-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-red-600 shadow-xl shadow-red-500/20 active:scale-95 transition-all">
                      {deletingRoom ? t("chat.purging") : t("chat.confirmPurge")}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="py-5 bg-gray-100 text-on-surface rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">
                      {t("common.cancel")}
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// Icon fallbacks if the main one fails
function IoChatbubblesOutline(props: any) {
    return <MessageSquare {...props} />;
}
