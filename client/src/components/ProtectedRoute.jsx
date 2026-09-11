import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { token, user, status } = useSelector(s => s.auth);
  if (status === "checking") return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="rounded-2xl bg-white border border-slate-200 px-6 py-4 shadow-sm text-sm font-medium text-slate-600">Loading your workspace...</div>
    </div>
  );
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Outlet />;
}