import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadCurrentUser } from "../redux/authSlice";
import { GraduationCap } from "lucide-react";

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("academic_hub_token", token);
      dispatch(loadCurrentUser()).then(() => navigate("/dashboard", { replace: true }));
    } else {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, []);

  return <div className="grid min-h-screen place-items-center bg-slate-50">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="rounded-xl bg-indigo-600 p-3 text-white"><GraduationCap size={24}/></div>
      <p className="text-sm font-medium">Signing you in...</p>
    </div>
  </div>;
}