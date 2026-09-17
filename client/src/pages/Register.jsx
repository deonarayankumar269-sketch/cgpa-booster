import { useEffect, useState } from "react";
import { Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, registerUser } from "../redux/authSlice";

export default function Register() {
  const dispatch=useDispatch(), navigate=useNavigate();
  const {status,error,user}=useSelector(s=>s.auth);
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:"",email:"",password:"",university:"",course:"B.Tech",branch:"",semester:"1"});
  useEffect(()=>{if(user)navigate("/dashboard",{replace:true})},[user,navigate]);
  const change=e=>{setForm({...form,[e.target.name]:e.target.value}); if(error)dispatch(clearAuthError())};
  const submit=async e=>{e.preventDefault();const r=await dispatch(registerUser({...form,semester:Number(form.semester)}));if(registerUser.fulfilled.match(r))navigate("/dashboard",{replace:true})};

  return <main className="relative min-h-screen overflow-hidden px-5 py-10">
    <video className="absolute inset-0 h-full w-full object-cover" src="/bg-video.mp4" autoPlay loop muted playsInline/>
    <div className="absolute inset-0 bg-black/30"/>
    <div className="relative z-10 mx-auto max-w-2xl">
    <div className="mb-8 flex items-center justify-center gap-3"><div className="rounded-xl bg-indigo-600 p-2 text-white"><GraduationCap size={22}/></div><b className="text-xl text-white drop-shadow">CGPA Booster</b></div>
    <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md sm:p-10"><h1 className="text-3xl font-bold text-navy">Create your account</h1><p className="mt-2 text-sm text-slate-600">Set up your student profile and start organizing your academic life.</p>
    {error&&<div className="mt-6 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">{error}</div>}
    <form onSubmit={submit} className="mt-7 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name"><input className="input-field bg-white/80" name="name" value={form.name} onChange={change} placeholder="Your name" required/></Field>
        <Field label="Email address"><input className="input-field bg-white/80" type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required/></Field>
      </div>
      <Field label="Password"><div className="relative"><input className="input-field bg-white/80 pr-12" type={show?"text":"password"} name="password" value={form.password} onChange={change} placeholder="Choose any password" required/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div><p className="mt-2 text-xs text-slate-500">No password complexity rules are applied.</p></Field>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="University"><input className="input-field bg-white/80" name="university" value={form.university} onChange={change} placeholder="University name"/></Field><Field label="Course"><input className="input-field bg-white/80" name="course" value={form.course} onChange={change} placeholder="B.Tech"/></Field></div>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Branch"><input className="input-field bg-white/80" name="branch" value={form.branch} onChange={change} placeholder="Computer Science"/></Field><Field label="Current semester"><select className="input-field bg-white/80" name="semester" value={form.semester} onChange={change}>{Array.from({length:12},(_,i)=><option key={i+1}>{i+1}</option>)}</select></Field></div>
      <button disabled={status==="loading"} className="primary-button w-full">{status==="loading"?"Creating account...":<>Create account <ArrowRight size={17}/></>}</button>
    </form><p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-indigo-600">Sign in</Link></p>
    </div></div></main>
}
function Field({label,children}){return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}</div>}