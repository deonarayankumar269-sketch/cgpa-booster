import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, Calculator, FileText, LogOut, Search, Users, Plus, ArrowUpRight, GraduationCap, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const API=import.meta.env.VITE_API_URL||"http://localhost:5000/api";
const starter=[["Data Structures",4,9],["Database Systems",4,8],["Operating Systems",3,8],["Computer Networks",3,9]];
const RESOURCE_TYPES=["Notes","PYQ","Assignment","Question Bank","Other"];
const emptyUpload={title:"",description:"",type:"Notes",subject:"",semester:1,branch:"",fileUrl:""};

export default function Dashboard(){
 const {user,token}=useSelector(s=>s.auth),dispatch=useDispatch(),navigate=useNavigate();
 const [resources,setResources]=useState([]),[search,setSearch]=useState(""),[loading,setLoading]=useState(true);
 const [subjects,setSubjects]=useState(starter.map(([name,credits,gradePoint])=>({name,credits,gradePoint}))),[sgpa,setSgpa]=useState(null),[room,setRoom]=useState("");
 const [calcError,setCalcError]=useState(""),[calculating,setCalculating]=useState(false);
 const [showUpload,setShowUpload]=useState(false),[uploadForm,setUploadForm]=useState(emptyUpload),[uploadErrors,setUploadErrors]=useState([]),[uploading,setUploading]=useState(false);
 const [uploadMode,setUploadMode]=useState("link"),[file,setFile]=useState(null);
 const [deleteTarget,setDeleteTarget]=useState(null),[deleting,setDeleting]=useState(false);
 const headers=useMemo(()=>({Authorization:`Bearer ${token}`}),[token]);
 const fetchResources=async()=>{try{setLoading(true);const r=await axios.get(`${API}/resources`,{headers,params:{search,limit:8}});setResources(r.data.resources||[])}catch(e){console.error(e)}finally{setLoading(false)}};
 useEffect(()=>{if(token)fetchResources()},[token]);
 const calc=async()=>{
  setCalcError("");
  const invalid=subjects.find(s=>!s.name.trim()||s.credits<=0||s.gradePoint<0||s.gradePoint>10);
  if(invalid){
    setCalcError(`Check "${invalid.name||"a subject"}": credits must be greater than 0, and grade point must be between 0 and 10.`);
    return;
  }
  setCalculating(true);
  try{
    const r=await axios.post(`${API}/academic/sgpa`,{subjects}, {headers});
    setSgpa(r.data.sgpa);
  }catch(err){
    setCalcError(err.response?.data?.message||"Unable to calculate SGPA. Please try again.");
  }finally{
    setCalculating(false);
  }
 };
 const update=(i,k,v)=>{setCalcError("");setSubjects(s=>s.map((x,j)=>j===i?{...x,[k]:k==="name"?v:Number(v)}:x))};
 const add=()=>setSubjects(s=>[...s,{name:"New Subject",credits:3,gradePoint:8}]);
 const join=()=>room.trim()&&navigate(`/dashboard/rooms/${encodeURIComponent(room.trim())}`);
 const updateUpload=(k,v)=>setUploadForm(f=>({...f,[k]:v}));
 const submitUpload=async(e)=>{
  e.preventDefault();
  setUploadErrors([]);
  if(!uploadForm.title.trim()||!uploadForm.subject.trim()||(uploadMode==="link"&&!uploadForm.fileUrl.trim())||(uploadMode==="file"&&!file)){
    setUploadErrors(["Please fill in Title, Subject, and provide a File URL or upload a file"]);
    return;
  }

  setUploading(true);
  try{
    let fileUrl=uploadForm.fileUrl;
    if(uploadMode==="file"){
      const fd=new FormData();
      fd.append("file",file);
      const up=await axios.post(`${API}/resources/upload`,fd,{headers:{...headers,"Content-Type":"multipart/form-data"}});
      fileUrl=up.data.fileUrl;
    }
    await axios.post(`${API}/resources`,{...uploadForm,fileUrl,semester:Number(uploadForm.semester)},{headers});
    setShowUpload(false);
    setUploadForm(emptyUpload);
    setFile(null);
    setUploadMode("link");
    fetchResources();
  }catch(err){
    const errs=err.response?.data?.errors;
    if(errs) setUploadErrors(errs.map(e=>e.message));
    else setUploadErrors([err.response?.data?.message||"Unable to upload resource"]);
  }finally{
    setUploading(false);
  }
};
  const confirmDelete=async()=>{
   if(!deleteTarget) return;
   setDeleting(true);
   try{
     await axios.delete(`${API}/resources/${deleteTarget._id}`,{headers});
     setDeleteTarget(null);
     fetchResources();
   }catch(err){
     alert(err.response?.data?.message||"Unable to delete resource");
   }finally{
     setDeleting(false);
   }
 };
 return <div className="min-h-screen bg-canvas">
  <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
    <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-600 p-2 text-white"><GraduationCap size={21}/></div><div><b className="text-base text-navy">CGPA Booster</b><p className="text-xs text-slate-400">Student workspace</p></div></div>
    <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><b className="text-sm text-slate-700">{user?.name}</b><p className="text-xs text-slate-400">{user?.course||"Student"}</p></div><button className="secondary-button px-3 py-2" onClick={()=>{dispatch(logout());navigate("/login",{replace:true})}}><LogOut size={17}/><span className="hidden sm:inline">Sign out</span></button></div>
  </div></header>
  <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
   <section className="rounded-3xl bg-navy p-7 text-white shadow-xl sm:p-9"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="text-sm font-semibold text-indigo-300">Good to see you</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {user?.name?.split(" ")[0]||"Student"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Access your study resources, calculate academic performance and connect with classmates.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Stat label="Semester" value={user?.semester||1}/><Stat label="Branch" value={user?.branch||"Not set"}/><Stat label="Resources" value={resources.length}/></div></div></section>
   <section className="mt-7 grid gap-6 lg:grid-cols-3">
    <div className="card p-6"><IconBox icon={<Calculator size={20}/>}/><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-navy">SGPA Calculator</h2><p className="mt-1 text-sm text-slate-500">Calculate your semester performance.</p></div>{sgpa!==null&&<div className="text-right"><p className="text-xs text-slate-400">SGPA</p><b className="text-3xl text-indigo-600">{sgpa}</b></div>}</div>
      {calcError&&<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{calcError}</div>}
      <div className="mt-5 space-y-3">{subjects.map((s,i)=><div key={i} className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_65px_75px]"><input id={`subject-name-${i}`} name={`subject-name-${i}`} aria-label={`Subject ${i+1} name`} className="input-field px-3 py-2 text-sm" value={s.name} onChange={e=>update(i,"name",e.target.value)}/><div className="grid grid-cols-2 gap-2 sm:contents"><input id={`subject-credits-${i}`} name={`subject-credits-${i}`} aria-label={`Subject ${i+1} credits`} className="input-field px-3 py-2 text-xs" type="number" min="1" max="30" value={s.credits} onChange={e=>update(i,"credits",e.target.value)}/><input id={`subject-grade-${i}`} name={`subject-grade-${i}`} aria-label={`Subject ${i+1} grade point`} className="input-field px-3 py-2 text-xs" type="number" min="0" max="10" step="0.1" value={s.gradePoint} onChange={e=>update(i,"gradePoint",e.target.value)}/></div></div>)}</div>
      <div className="mt-5 flex gap-2"><button className="secondary-button flex-1 px-3 py-2" onClick={add}><Plus size={16}/>Add</button><button disabled={calculating} className="primary-button flex-1 px-3 py-2" onClick={calc}>{calculating?<><Loader2 size={16} className="animate-spin"/>Calculating...</>:"Calculate"}</button></div>
    </div>
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <IconBox icon={<BookOpen size={20}/>}/>
        <button className="secondary-button px-3 py-1.5 text-xs" onClick={()=>setShowUpload(true)}><Plus size={14}/>Add</button>
      </div>
      <h2 className="text-lg font-bold text-navy">Study Resources</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">Find notes, PYQs, assignments and question banks.</p>
      <div className="relative mt-5"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input id="resource-search" name="resource-search" aria-label="Search resources" className="input-field pl-10" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchResources()} placeholder="Search resources..."/></div>
      <button disabled={loading} className="primary-button mt-3 w-full" onClick={fetchResources}>{loading?<><Loader2 size={16} className="animate-spin"/>Searching...</>:"Search resources"}</button>
      <div className="mt-5 space-y-2">{loading?<div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100"/>)}</div>:resources.length?resources.slice(0,4).map(r=><a key={r._id} href={r.fileUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-indigo-50/50"><div className="min-w-0"><p className="truncate text-sm font-semibold">{r.title}</p><p className="text-xs text-slate-400">{r.type} · {r.subject}</p></div><ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-600"/></a>):<p className="text-sm text-slate-400">No matching resources found.</p>}</div>
    </div>
    <div className="card p-6"><IconBox icon={<Users size={20}/>}/><h2 className="text-lg font-bold text-navy">Study Rooms</h2><p className="mt-1 text-sm leading-6 text-slate-500">Join a room and collaborate with classmates in real time.</p><label htmlFor="room-code" className="mt-6 mb-2 block text-sm font-semibold">Room code</label><input id="room-code" name="room-code" className="input-field" value={room} onChange={e=>setRoom(e.target.value)} onKeyDown={e=>e.key==="Enter"&&join()} placeholder="e.g. dsa-sem4"/><button className="primary-button mt-4 w-full" onClick={join}>Join study room <ArrowUpRight size={17}/></button><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Room messaging is secured through your authenticated session.</div></div>
   </section>
   <section className="mt-7"><div className="card overflow-hidden"><div className="border-b border-slate-100 p-6"><h2 className="text-lg font-bold text-navy">Recent resources</h2><p className="mt-1 text-sm text-slate-500">Latest material available to your student community.</p></div>{loading?<div className="space-y-0">{[1,2,3].map(i=><div key={i} className="flex items-center gap-4 border-b border-slate-100 p-5"><div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100"/><div className="flex-1 space-y-2"><div className="h-4 w-1/3 animate-pulse rounded bg-slate-100"/><div className="h-3 w-1/4 animate-pulse rounded bg-slate-100"/></div></div>)}</div>:resources.length?resources.map(r=><div key={r._id} className="flex items-center justify-between gap-4 border-b border-slate-100 p-5"><div className="flex min-w-0 items-center gap-4"><div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><FileText size={19}/></div><div className="min-w-0"><h3 className="truncate font-semibold">{r.title}</h3><p className="text-xs text-slate-400">{r.type} · {r.subject} · Semester {r.semester}</p></div></div><div className="flex shrink-0 items-center gap-2"><a href={r.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">Open <ArrowUpRight size={16}/></a>{r.uploadedBy?._id===user?.id&&<button onClick={()=>setDeleteTarget(r)} className="rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">Delete</button>}</div></div>):<div className="p-10 text-center text-sm text-slate-400">No resources available yet.</div>}</div></section>
  </main>
  {showUpload&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-navy">Upload Resource</h3><button onClick={()=>{setShowUpload(false);setUploadErrors([])}}><X size={20} className="text-slate-400"/></button></div>
      {uploadErrors.length>0&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{uploadErrors.map((e,i)=><p key={i}>{e}</p>)}</div>}
      <form onSubmit={submitUpload} className="mt-4 space-y-3">
        <input id="upload-title" name="title" aria-label="Resource title" className="input-field" placeholder="Title" value={uploadForm.title} onChange={e=>updateUpload("title",e.target.value)}/>
        <textarea id="upload-description" name="description" aria-label="Resource description" className="input-field" placeholder="Description (optional)" rows={2} value={uploadForm.description} onChange={e=>updateUpload("description",e.target.value)}/>
        <select id="upload-type" name="type" aria-label="Resource type" className="input-field" value={uploadForm.type} onChange={e=>updateUpload("type",e.target.value)}>{RESOURCE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>
        <input id="upload-subject" name="subject" aria-label="Resource subject" className="input-field" placeholder="Subject" value={uploadForm.subject} onChange={e=>updateUpload("subject",e.target.value)}/>
        <div className="grid grid-cols-2 gap-3">
          <input id="upload-semester" name="semester" aria-label="Semester" className="input-field" type="number" min="1" max="20" placeholder="Semester" value={uploadForm.semester} onChange={e=>updateUpload("semester",e.target.value)}/>
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
  <button type="button" onClick={()=>setUploadMode("link")} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${uploadMode==="link"?"bg-white shadow text-navy":"text-slate-500"}`}>Paste Link</button>
  <button type="button" onClick={()=>setUploadMode("file")} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${uploadMode==="file"?"bg-white shadow text-navy":"text-slate-500"}`}>Upload File</button>
</div>
{uploadMode==="link"?<input id="upload-fileurl" name="fileUrl" aria-label="File URL" className="input-field" placeholder="File URL (e.g. Google Drive link)" value={uploadForm.fileUrl} onChange={e=>updateUpload("fileUrl",e.target.value)}/>:<input id="upload-file" name="file" aria-label="Choose file to upload" className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e=>setFile(e.target.files[0])}/>}
        </div>
        <button type="submit" disabled={uploading} className="primary-button w-full">{uploading?<><Loader2 size={16} className="animate-spin"/>Uploading...</>:"Upload Resource"}</button>
      </form>
    </div>
  </div>}
  {deleteTarget&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold text-navy">Delete resource?</h3>
      <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.</p>
      <div className="mt-6 flex gap-3"><button onClick={()=>setDeleteTarget(null)} disabled={deleting} className="secondary-button flex-1 px-3 py-2">Cancel</button><button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">{deleting?"Deleting...":"Delete"}</button></div>
    </div>
  </div>}
 </div>;
}
function Stat({label,value}){return <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-lg font-bold leading-tight" title={value}>{value}</p></div>}
function IconBox({icon}){return <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">{icon}</div>}