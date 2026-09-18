import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, Users, GraduationCap, WifiOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector(s => s.auth);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const socketRef = useRef(null);

  const room = useMemo(() => decodeURIComponent(roomId || ""), [roomId]);

  useEffect(() => {
    if (!room.trim()) { navigate("/dashboard", { replace: true }); return; }

    setConnectionStatus("connecting");
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => { setConnectionStatus("connected"); socket.emit("join-room", { roomId: room }); });
    socket.on("room-count", ({ count }) => setOnline(count));
    socket.on("room-message", payload => setMessages(v => [...v, payload]));
    socket.on("connect_error", () => setConnectionStatus("error"));
    socket.on("disconnect", () => setConnectionStatus("connecting"));

    return () => {
      socket.emit("leave-room", { roomId: room });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, room, navigate]);

  const send = e => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || connectionStatus !== "connected") return;
    socketRef.current.emit("room-message", { roomId: room, message });
    setMessage("");
  };

  return <div className="min-h-screen bg-canvas">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
      <button onClick={()=>navigate("/dashboard")} className="secondary-button px-3 py-2"><ArrowLeft size={17}/> Dashboard</button>
      <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-600 p-2 text-white"><GraduationCap size={19}/></div><b className="text-navy">CGPA Booster</b></div>
    </div></header>
    <main className="mx-auto max-w-5xl px-5 py-8">
      {connectionStatus==="error"&&<div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><WifiOff size={17}/> Unable to connect to the study room server. Check your connection or try again shortly.</div>}
      {connectionStatus==="connecting"&&<div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Connecting to the room...</div>}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Study room</p><h1 className="mt-1 text-2xl font-bold text-navy">{room}</h1></div><div className="flex items-center gap-2 text-sm text-slate-500"><Users size={17}/>{online} active</div></div></div>
        <div className="min-h-[420px] space-y-3 bg-slate-50 p-6">{messages.length ? messages.map(m=><div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-3 ${String(m.userId)===String(user?.id)?"ml-auto bg-indigo-600 text-white":"bg-white border border-slate-200 text-slate-700"}`}><p className="text-sm">{m.message}</p></div>):<div className="grid h-[350px] place-items-center text-center text-slate-400"><div><Users className="mx-auto" size={32}/><p className="mt-3 font-semibold">Room is ready</p><p className="text-sm">Start the discussion with your classmates.</p></div></div>}</div>
        <form onSubmit={send} className="flex gap-3 border-t border-slate-100 p-5"><input id="room-message" name="message" aria-label="Write a message" className="input-field" value={message} onChange={e=>setMessage(e.target.value)} placeholder={connectionStatus==="connected"?"Write a message...":"Waiting for connection..."} disabled={connectionStatus!=="connected"} /><button type="submit" aria-label="Send message" disabled={connectionStatus!=="connected"} className="primary-button px-4"><Send size={17}/></button></form>
      </div>
    </main>
  </div>
}