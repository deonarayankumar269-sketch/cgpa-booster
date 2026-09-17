import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Room from "./pages/Room";
import ProtectedRoute from "./components/ProtectedRoute";
import { loadCurrentUser } from "./redux/authSlice";
import OAuthSuccess from "./pages/OAuthSuccess";

export default function App(){
 const dispatch=useDispatch();
 useEffect(()=>{if(localStorage.getItem("academic_hub_token"))dispatch(loadCurrentUser())},[dispatch]);
 return <Routes>
   <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
   <Route path="/login" element={<Login/>}/>
   <Route path="/register" element={<Register/>}/>
   <Route path="/oauth-success" element={<OAuthSuccess/>}/>
   <Route element={<ProtectedRoute/>}>
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/dashboard/rooms/:roomId" element={<Room/>}/>
   </Route>
   <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
 </Routes>
}