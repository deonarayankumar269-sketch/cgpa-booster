import { useEffect, useState } from "react";
import { Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, loginUser } from "../redux/authSlice";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const dispatch = useDispatch(), navigate = useNavigate();
  const { status, error, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);

  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const submit = async e => {
    e.preventDefault();
    const r = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(r)) navigate("/dashboard", { replace: true });
  };

  return <main className="min-h-screen bg-slate-50">
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-500 p-2"><GraduationCap size={22}/></div><b className="text-xl">CGPA Booster</b></div>
        <div className="max-w-xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-300">Your academic workspace</p><h1 className="mt-4 text-5xl font-bold leading-tight">Learn together.<br/>Stay organized.<br/>Move forward.</h1><p className="mt-6 leading-7 text-slate-300">Keep notes, previous-year questions, academic progress and study rooms together in one focused workspace.</p></div>
        <p className="text-sm text-slate-400">Built for modern university students.</p>
      </section>
      <section className="relative flex items-center justify-center overflow-hidden px-5 py-10">
        <video className="absolute inset-0 h-full w-full object-cover" src="/bg-video.mp4" autoPlay loop muted playsInline/>
        <div className="absolute inset-0 bg-black/20"/>
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><div className="rounded-xl bg-indigo-600 p-2 text-white"><GraduationCap size={22}/></div><b className="text-xl text-white drop-shadow">CGPA Booster</b></div>
          <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-3xl font-bold text-navy">Welcome back</h2><p className="mt-2 text-sm text-slate-600">Sign in to continue to your academic workspace.</p>
            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">{error}</div>}
            <a href={`${API}/auth/google`} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.1z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 36.5 26.9 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 40.6 16.2 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.2 5.6-6 7.4l6.6 5.4C39.6 38.1 45 32.6 45 24c0-1.4-.1-2.8-.4-4.1z"/></svg>
              Continue with Google
            </a>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><div className="h-px flex-1 bg-slate-200"/>or<div className="h-px flex-1 bg-slate-200"/></div>
            <form onSubmit={submit} className="space-y-5">
              <div><label className="mb-2 block text-sm font-semibold">Email address</label><input className="input-field bg-white/80" type="email" name="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></div>
              <div><label className="mb-2 block text-sm font-semibold">Password</label><div className="relative"><input className="input-field bg-white/80 pr-12" type={show?"text":"password"} name="password" value={form.password} onChange={e=>{setForm({...form,password:e.target.value});dispatch(clearAuthError())}} placeholder="Enter your password" required/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
              <button disabled={status==="loading"} className="primary-button w-full">{status==="loading"?"Signing in...":<><span>Sign in</span><ArrowRight size={17}/></>}</button>
            </form>
            <p className="mt-7 text-center text-sm text-slate-600">New to CGPA Booster? <Link to="/register" className="font-semibold text-indigo-600">Create an account</Link></p>
          </div>
        </div>
      </section>
    </div>
  </main>;
}