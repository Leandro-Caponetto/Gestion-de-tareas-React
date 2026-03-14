import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Video, Mic, MicOff, VideoOff, PhoneOff, User, MessageSquare, Check, Plus } from 'lucide-react';
import { UserSettings } from '../types';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderSocketId?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

interface ChatRoomProps {
  userSettings: UserSettings;
  userId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ userSettings, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<{id: string, name: string, socketId: string, avatarUrl?: string}[]>([]);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string}>({});
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roomId = "general-room";

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join-room', roomId, userId, userSettings.displayName, userSettings.avatarUrl);

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Remove typing indicator when message arrives
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[message.senderId];
        return next;
      });
    });

    newSocket.on('typing', (data: { userId: string, userName: string, isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (data.isTyping) {
          next[data.userId] = data.userName;
        } else {
          delete next[data.userId];
        }
        return next;
      });
    });

    newSocket.on('user-connected', (id, name, socketId, avatarUrl) => {
      setRemoteUsers(prev => {
        if (prev.find(u => u.id === id)) return prev;
        return [...prev, { id, name, socketId, avatarUrl }];
      });
      
      // Add system message
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'Sistema',
        text: `${name} se ha unido a la sala de comunicaciones.`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    newSocket.on('user-disconnected', (id) => {
      setRemoteUsers(prev => {
        const user = prev.find(u => u.id === id);
        if (user) {
          setMessages(messagesPrev => [...messagesPrev, {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sistema',
            text: `${user.name} ha abandonado la sala.`,
            timestamp: Date.now(),
            isSystem: true
          }]);
        }
        return prev.filter(u => u.id !== id);
      });
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    // WebRTC Signaling handlers
    newSocket.on('offer', async (data) => {
      if (!peerConnection.current) createPeerConnection(data.sender);
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      newSocket.emit('answer', { target: data.sender, answer });
      setIsInCall(true);
    });

    newSocket.on('answer', async (data) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    newSocket.on('ice-candidate', async (data) => {
      if (data.candidate) {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      newSocket.disconnect();
      localStream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (socket) {
      socket.emit('typing', { roomId, userId, userName: userSettings.displayName, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { roomId, userId, userName: userSettings.displayName, isTyping: false });
      }, 2000);
    }
  };

  const createPeerConnection = (targetSocketId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('ice-candidate', { target: targetSocketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current!);
      });
    }

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async (targetSocketId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      const pc = createPeerConnection(targetSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket?.emit('offer', { target: targetSocketId, offer, senderName: userSettings.displayName });
      setIsInCall(true);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    localStream.current?.getTracks().forEach(track => track.stop());
    localStream.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsInCall(false);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userSettings.displayName,
      senderAvatar: userSettings.avatarUrl,
      senderSocketId: socket.id,
      text: inputText,
      timestamp: Date.now()
    };

    socket.emit('send-message', { ...message, roomId });
    socket.emit('typing', { roomId, userId, userName: userSettings.displayName, isTyping: false });
    setInputText('');
  };

  const toggleMic = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 shadow-inner">
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl z-20 sticky top-0 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="bg-gradient-to-br from-correo-blue to-blue-700 p-3.5 rounded-[1.25rem] shadow-xl shadow-correo-blue/20 ring-4 ring-correo-blue/5">
                  <MessageSquare className="w-6 h-6 text-correo-yellow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-lg font-black text-correo-blue dark:text-white uppercase tracking-tight leading-none mb-1">Sala de Comunicaciones</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Middleware General</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{remoteUsers.length + 1} Colegas en línea</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 hover:-space-x-1 transition-all duration-500 cursor-pointer">
                <div className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-900 bg-correo-blue flex items-center justify-center shadow-lg z-30">
                  <User className="w-5 h-5 text-correo-yellow" />
                </div>
                {remoteUsers.slice(0, 3).map((u, i) => (
                  <div key={u.id} className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-lg overflow-hidden" style={{ zIndex: 20 - i }}>
                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-400" />}
                  </div>
                ))}
                {remoteUsers.length > 3 && (
                  <div className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg text-[10px] font-black text-slate-500 z-0">
                    +{remoteUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide bg-slate-50/50 dark:bg-slate-950/50 relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#002f6c 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-30 animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No hay mensajes aún</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Inicia la conversación profesional</p>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center w-full animate-in fade-in zoom-in duration-700">
                    <div className="px-6 py-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{msg.text}</p>
                    </div>
                  </div>
                );
              }
              
              // Primary check: socket ID to distinguish sessions (useful for same-account testing)
              // Fallback: user ID if socket ID is missing
              const isMe = msg.senderSocketId ? msg.senderSocketId === socket?.id : msg.senderId === userId;
              
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`flex items-end gap-5 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-[1.25rem] bg-white dark:bg-slate-800 flex-shrink-0 overflow-hidden border-2 shadow-2xl transition-all hover:scale-110 hover:rotate-3 z-10 ${isMe ? 'border-correo-blue ring-8 ring-correo-blue/10' : 'border-white dark:border-slate-700 ring-4 ring-slate-100 dark:ring-slate-800/50'}`}>
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-400 bg-slate-50 dark:bg-slate-800">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-3 mb-2.5 px-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{isMe ? 'Tú' : msg.senderName}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] text-slate-400 font-bold bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`px-8 py-5 rounded-[2.5rem] text-sm font-medium shadow-2xl transition-all hover:shadow-correo-blue/20 leading-relaxed relative group ${
                        isMe 
                          ? 'bg-gradient-to-br from-correo-blue via-blue-800 to-indigo-900 text-white rounded-br-none' 
                          : 'bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-slate-800/95 dark:to-slate-900/90 backdrop-blur-2xl text-slate-800 dark:text-slate-100 rounded-bl-none border border-white/60 dark:border-slate-700/50 ring-1 ring-slate-200/50 dark:ring-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none'
                      }`}>
                        {msg.text}
                        {/* Message Status for "Me" */}
                        {isMe && (
                          <div className="absolute -bottom-6 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Check className="w-3 h-3 text-correo-blue" />
                            <Check className="w-3 h-3 text-correo-blue -ml-2" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Leído</span>
                          </div>
                        )}
                        <div className={`absolute bottom-0 ${isMe ? '-right-1.5' : '-left-1.5'} w-6 h-6 ${isMe ? 'bg-indigo-900' : 'bg-slate-50/90 dark:bg-slate-900/90'} rotate-45 -z-10`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {Object.entries(typingUsers).map(([id, name]) => (
              <div key={id} className="flex justify-start w-full animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-end gap-4 max-w-[75%] flex-row">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">{name} está redactando...</span>
                    <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-[2rem] rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-lg flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-correo-blue/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-correo-blue/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-correo-blue/30 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            <form onSubmit={sendMessage} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 focus-within:border-correo-blue focus-within:ring-8 focus-within:ring-correo-blue/5 transition-all group">
              <div className="flex items-center gap-2 pl-4 border-r border-slate-200 dark:border-slate-700 pr-4">
                <button type="button" className="p-2 text-slate-400 hover:text-correo-blue transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje para el equipo..."
                className="flex-1 bg-transparent border-none px-4 py-4 text-sm outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-gradient-to-br from-correo-blue to-blue-800 text-correo-yellow p-5 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-correo-blue/30 disabled:opacity-50 disabled:scale-100 disabled:shadow-none mr-1"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>

        {/* Video/Users Sidebar Area */}
        <div className="w-96 bg-slate-50 dark:bg-slate-950 flex flex-col border-l border-slate-100 dark:border-slate-800">
          <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Conectado</h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
            
            <div className="space-y-4">
              {/* Me */}
              <div className="p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-[2.5rem] border-2 border-correo-blue shadow-2xl shadow-correo-blue/10 flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <User className="w-12 h-12 text-correo-blue" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-correo-blue flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl z-10">
                  {userSettings.avatarUrl ? (
                    <img src={userSettings.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-correo-yellow" />
                  )}
                </div>
                <div className="flex flex-col z-10">
                  <span className="text-sm font-black text-correo-blue dark:text-white uppercase tracking-tight">{userSettings.displayName} (Tú)</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{userSettings.role || 'Analista'}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Activo ahora</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-6"></div>

              {/* Others */}
              {remoteUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg transition-all hover:border-correo-blue/40 hover:shadow-2xl hover:-translate-y-1 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-slate-700 shadow-inner group-hover:border-correo-blue/20 transition-colors">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{user.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">En línea</span>
                      </div>
                    </div>
                  </div>
                  {!isInCall && (
                    <button 
                      onClick={() => startCall(user.socketId)}
                      className="p-4 text-correo-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-correo-blue hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:scale-110 active:scale-95"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              
              {remoteUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] opacity-40">
                  <User className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Esperando a que otros colegas se conecten</p>
                </div>
              )}
            </div>
          </div>

          {/* Call Controls Area */}
          <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            {isInCall ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-2 border-correo-blue shadow-2xl group">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                      Remoto
                    </div>
                  </div>
                  <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/20 shadow-lg">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                      Tú
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={toggleMic}
                    className={`p-4 rounded-2xl transition-all shadow-lg ${isMicOn ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'}`}
                  >
                    {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={toggleVideo}
                    className={`p-4 rounded-2xl transition-all shadow-lg ${isVideoOn ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'}`}
                  >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={endCall}
                    className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 hover:scale-110 active:scale-95"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-60 group hover:opacity-100 transition-all">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Video className="w-8 h-8 text-correo-blue" />
                </div>
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                  Colaboración por Video<br/>
                  <span className="text-[9px] font-bold text-slate-400">Selecciona un colega para iniciar</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
