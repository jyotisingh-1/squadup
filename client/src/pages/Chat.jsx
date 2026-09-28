import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { auth } from "../firebase/firebase";
import "../styles/chat.css";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function chatRequest(user, path, options = {}) {
  const token = await user.getIdToken();
  const response = await fetch(`${API_ROOT}/api/chat${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Chat request failed.");
  return data;
}

const idOf = (value) => (typeof value === "string" ? value : value?._id?.toString());
const displayName = (user) => user?.fullName || (user?.username ? `@${user.username}` : "Squadmate");

function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFriendId = searchParams.get("friendId");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const selectedFriendRef = useRef(selectedFriendId);
  const currentUserIdRef = useRef(currentUserId);

  const selectedFriend = useMemo(
    () => conversations.find((conversation) => idOf(conversation.friend) === selectedFriendId)?.friend || null,
    [conversations, selectedFriendId]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter(({ friend }) =>
      [friend.fullName, friend.username, friend.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  useEffect(() => {
    selectedFriendRef.current = selectedFriendId;
  }, [selectedFriendId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) setLoadingConversations(false);
    });
    return unsubscribe;
  }, []);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConversations(true);
    try {
      const data = await chatRequest(currentUser, "/conversations");
      setConversations(data.conversations || []);
      setCurrentUserId(idOf(data.currentUserId));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load your conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return undefined;
    const timer = window.setTimeout(loadConversations, 0);
    return () => window.clearTimeout(timer);
  }, [currentUser, loadConversations]);

  useEffect(() => {
    if (!currentUser || !selectedFriendId) return undefined;

    let active = true;
    const friendId = selectedFriendId;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setLoadingMessages(true);
      setError("");
      chatRequest(currentUser, `/${friendId}/messages`)
        .then((data) => {
          if (!active) return;
          setMessages(data.messages || []);
          setConversations((items) => items.map((item) =>
            idOf(item.friend) === friendId ? { ...item, unreadCount: 0 } : item
          ));
        })
        .catch((requestError) => {
          if (active) setError(requestError.message || "Could not load this conversation.");
        })
        .finally(() => {
          if (active) setLoadingMessages(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [currentUser, selectedFriendId]);

  useEffect(() => {
    if (!currentUser) return undefined;
    let active = true;
    let socket;

    currentUser.getIdToken()
      .then((token) => {
        if (!active) return;
        socket = io(API_ROOT, { auth: { token } });
        socket.on("connect_error", (socketError) => {
          setError(socketError.message || "Chat connection could not be established.");
        });
        socket.on("message:new", (message) => {
          const senderId = idOf(message.sender);
          const receiverId = idOf(message.receiver);
          const selfId = currentUserIdRef.current;
          const friendId = senderId === selfId ? receiverId : senderId;
          const isOpen = selectedFriendRef.current === friendId;

          if (isOpen) {
            setMessages((items) => items.some((item) => idOf(item) === idOf(message))
              ? items
              : [...items, message]
            );
            if (receiverId === selfId) {
              chatRequest(currentUser, `/${friendId}/read`, { method: "PATCH" }).catch(() => {});
            }
          }

          setConversations((items) => items.map((item) => {
            if (idOf(item.friend) !== friendId) return item;
            return {
              ...item,
              lastMessage: message,
              unreadCount: receiverId === selfId && !isOpen
                ? (item.unreadCount || 0) + 1
                : item.unreadCount || 0,
            };
          }).sort((first, second) =>
            new Date(second.lastMessage?.createdAt || 0) - new Date(first.lastMessage?.createdAt || 0)
          ));
        });
      })
      .catch((tokenError) => {
        if (active) setError(tokenError.message || "Could not authenticate chat connection.");
      });

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const selectFriend = (friendId) => {
    setSearchParams({ friendId });
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || !currentUser || !selectedFriend || sending) return;
    if (text.length > 2000) {
      setError("Messages must be 2000 characters or fewer.");
      return;
    }

    const friendId = idOf(selectedFriend);
    const tempId = `local-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: currentUserId },
      receiver: selectedFriend,
      text,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((items) => [...items, optimisticMessage]);
    setDraft("");
    setSending(true);
    setError("");
    try {
      const data = await chatRequest(currentUser, `/${friendId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setMessages((items) => items.map((item) => item._id === tempId ? data.message : item));
      setConversations((items) => items.map((item) =>
        idOf(item.friend) === friendId ? { ...item, lastMessage: data.message } : item
      ).sort((first, second) =>
        new Date(second.lastMessage?.createdAt || 0) - new Date(first.lastMessage?.createdAt || 0)
      ));
    } catch (requestError) {
      setMessages((items) => items.filter((item) => item._id !== tempId));
      setDraft(text);
      setError(requestError.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page-shell" data-has-chat={selectedFriend ? "true" : "false"}>
      <Sidebar />
      <main className="chat-main">
        <div className="chat-page-content">
          <header className="chat-page-heading">
            <div>
              <span className="chat-eyebrow">SQUADUP COMMUNITY</span>
              <h1>Messages</h1>
              <p>Keep your squad connected between matches.</p>
            </div>
            <Link to="/friends" className="chat-friends-link">
              <ArrowLeft size={16} /> Friends
            </Link>
          </header>

          {error && <div className="chat-alert" role="alert">{error}</div>}

          <section className="chat-workspace" aria-label="Chat">
            <aside className="chat-contacts-panel">
              <div className="chat-contacts-heading">
                <div>
                  <h2>Conversations</h2>
                  <span>{conversations.length} friends</span>
                </div>
                <MessageCircle size={19} aria-hidden="true" />
              </div>
              <label className="chat-search">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search friends"
                  aria-label="Search friends"
                />
              </label>
              <div className="chat-contact-list">
                {loadingConversations ? (
                  <p className="chat-list-state">Loading your friends…</p>
                ) : filteredConversations.length === 0 ? (
                  <div className="chat-list-state chat-list-empty">
                    <MessageCircle size={23} />
                    <p>{conversations.length ? "No friends match your search." : "Add friends to start a conversation."}</p>
                    {!conversations.length && <Link to="/friends">Find gamers</Link>}
                  </div>
                ) : filteredConversations.map(({ friend, lastMessage, unreadCount }) => {
                  const friendId = idOf(friend);
                  const active = friendId === selectedFriendId;
                  return (
                    <button
                      type="button"
                      className={`chat-contact ${active ? "active" : ""}`}
                      key={friendId}
                      onClick={() => selectFriend(friendId)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="chat-avatar">{displayName(friend).slice(0, 1).toUpperCase()}</span>
                      <span className="chat-contact-copy">
                        <span className="chat-contact-name">{displayName(friend)}</span>
                        <span className="chat-contact-preview">
                          {lastMessage?.text || friend.username ? (lastMessage?.text || `@${friend.username}`) : "Start a conversation"}
                        </span>
                      </span>
                      {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="chat-conversation-panel" aria-label="Selected conversation">
              {selectedFriend ? (
                <>
                  <header className="chat-conversation-heading">
                    <span className="chat-avatar">{displayName(selectedFriend).slice(0, 1).toUpperCase()}</span>
                    <div>
                      <h2>{displayName(selectedFriend)}</h2>
                      <span>{selectedFriend.username ? `@${selectedFriend.username}` : "SquadUp friend"}</span>
                    </div>
                  </header>

                  <div className="chat-message-list" aria-live="polite">
                    {loadingMessages ? (
                      <p className="chat-message-state">Loading messages…</p>
                    ) : messages.length === 0 ? (
                      <div className="chat-message-state chat-first-message">
                        <MessageCircle size={28} />
                        <p>No messages yet. Say hello to your squadmate.</p>
                      </div>
                    ) : messages.map((message) => {
                      const ownMessage = idOf(message.sender) === currentUserId;
                      return (
                        <div className={`chat-message-row ${ownMessage ? "sent" : "received"}`} key={idOf(message)}>
                          <div className="chat-message-bubble">
                            <p>{message.text}</p>
                            <time dateTime={message.createdAt}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </time>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form className="chat-composer" onSubmit={handleSend}>
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      maxLength={2000}
                      rows={1}
                      placeholder="Write a message…"
                      aria-label="Write a message"
                    />
                    <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message">
                      <Send size={17} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="chat-empty-state">
                  <span><MessageCircle size={28} /></span>
                  <h2>{loadingConversations ? "Loading your chats" : "Your squad, in sync"}</h2>
                  <p>
                    {loadingConversations
                      ? "Your conversations will be ready in a moment."
                      : conversations.length
                        ? "Choose a friend to open your conversation."
                        : "Add friends to start a conversation and plan your next match."}
                  </p>
                  {!loadingConversations && conversations.length === 0 && <Link to="/friends">Find friends</Link>}
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Chat;
