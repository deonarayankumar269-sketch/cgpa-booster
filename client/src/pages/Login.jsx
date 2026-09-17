import { useEffect, useState } from "react";
import { Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, loginUser } from "../redux/authSlice";

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
            <form onSubmit={submit} className="mt-7 space-y-5">
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