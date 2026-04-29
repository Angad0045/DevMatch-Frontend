import { cn } from "../../utils/cn.js";
import { useSocket } from "../../hooks/useSocket.js";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearMessages,
  removeMessage,
  selectMessages,
  selectTypingUsers,
  setLoading,
  setMessages,
} from "../../features/chat/chatSlice.js";
import { ChatInput } from "./ChatInput.jsx";
import { MessageBubble } from "./MessageBubble.jsx";
import { TypingIndicator } from "./TypingIndicator.jsx";
import { chatService as chatApi } from "../../services/chatService.js";
import { avatarColour, initials } from "../../constants/helperFunction.jsx";

export const ChatPanel = ({ match, currentUser }) => {
  const dispatch = useAppDispatch();
  const socket = useSocket();
  const messages = useAppSelector(selectMessages);
  const typers = useAppSelector(selectTypingUsers);
  const messagesEnd = useRef(null);
  const [sending, setSending] = useState(false);

  const matchId = match._id;
  const other = match.otherUser;

  useEffect(() => {
    dispatch(clearMessages());

    const loadHistory = async () => {
      dispatch(setLoading(true));
      try {
        const { data } = await chatApi.getMessages(matchId, { limit: 50 });
        dispatch(setMessages(data.data.messages));
      } catch (err) {
        console.error("Failed to load messages:", err.response?.data?.message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadHistory();

    // Join socket room for this match
    if (socket) {
      socket.emit("join:match", { matchId });
      return () => {
        socket.emit("leave:match", { matchId });
      };
    }
  }, [matchId, socket, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typers]);

  const handleSend = useCallback(
    (text) => {
      if (!socket || sending) return;
      setSending(true);
      socket.emit("message:send", { matchId, text });
      // Optimistic: the server emits message:new back which Redux handles
      setTimeout(() => setSending(false), 300);
    },
    [socket, matchId, sending],
  );

  const handleTypingStart = useCallback(() => {
    socket?.emit("typing:start", { matchId });
  }, [socket, matchId]);

  const handleTypingStop = useCallback(() => {
    socket?.emit("typing:stop", { matchId });
  }, [socket, matchId]);

  const handleDelete = async (messageId) => {
    try {
      await chatApi.deleteMessage(messageId);
      dispatch(removeMessage(messageId));
    } catch (err) {
      console.error("Delete failed:", err.response?.data?.message);
    }
  };

  // Group messages — show avatar only for first in a cluster of same sender
  const renderMessages = () => {
    return messages.map((msg, i) => {
      const isMine =
        msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
      const prevMsg = messages[i - 1];
      const sameSender =
        prevMsg &&
        (prevMsg.sender?._id ?? prevMsg.sender) ===
          (msg.sender?._id ?? msg.sender);

      return (
        <MessageBubble
          key={msg._id}
          message={msg}
          isMine={isMine}
          showAvatar={!sameSender}
          otherUser={other}
          onDelete={handleDelete}
        />
      );
    });
  };

  const otherName = other?.profile?.displayName ?? "Unknown";
  const col = avatarColour(otherName);
  const ini = initials(otherName);

  return (
    <div className="flex max-h-[calc(100vh-115px)] flex-1 flex-col">
      {/* Chat header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-cream-200 bg-white px-6 py-4">
        <div className="relative">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
              col,
            )}
          >
            {other?.profile?.avatarUrl ? (
              <img
                src={other.profile.avatarUrl}
                alt={otherName}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              ini
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{otherName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="no-scrollbar flex-1 overflow-y-auto bg-cream-50/50 px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div
              className={cn(
                "mb-1 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold",
                col,
              )}
            >
              {ini}
            </div>
            <p className="mb-1 text-sm font-semibold text-ink">
              You matched with {otherName}
            </p>
            <p className="text-xs text-ink-muted">
              Say Hello and Start Collaborating!
            </p>
          </div>
        )}

        {renderMessages()}
        <TypingIndicator typers={typers} />
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={sending}
      />
    </div>
  );
};
