import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const KEY = "academic_hub_token";

export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API}/auth/login`, payload);
    localStorage.setItem(KEY, data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || "Unable to log in"); }
});

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API}/auth/register`, payload);
    localStorage.setItem(KEY, data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || "Unable to create account"); }
});

export const loadCurrentUser = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  const token = localStorage.getItem(KEY);
  if (!token) return rejectWithValue("No session");
  try {
    const { data } = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    return { token, user: data.user };
  } catch {
    localStorage.removeItem(KEY);
    return rejectWithValue("Session expired");
  }
});

const slice = createSlice({
  name: "auth",
  initialState: { user: null, token: localStorage.getItem(KEY), status: localStorage.getItem(KEY) ? "checking" : "idle", error: null },
  reducers: {
    logout: state => { state.user = null; state.token = null; state.status = "idle"; state.error = null; localStorage.removeItem(KEY); },
    clearAuthError: state => { state.error = null; }
  },
  extraReducers: b => b
    .addCase(loginUser.pending, s => { s.status = "loading"; s.error = null; })
    .addCase(loginUser.fulfilled, (s,a) => { s.status="authenticated"; s.token=a.payload.token; s.user=a.payload.user; })
    .addCase(loginUser.rejected, (s,a) => { s.status="idle"; s.error=a.payload; })
    .addCase(registerUser.pending, s => { s.status="loading"; s.error=null; })
    .addCase(registerUser.fulfilled, (s,a) => { s.status="authenticated"; s.token=a.payload.token; s.user=a.payload.user; })
    .addCase(registerUser.rejected, (s,a) => { s.status="idle"; s.error=a.payload; })
    .addCase(loadCurrentUser.pending, s => { s.status="checking"; })
    .addCase(loadCurrentUser.fulfilled, (s,a) => { s.status="authenticated"; s.token=a.payload.token; s.user=a.payload.user; })
    .addCase(loadCurrentUser.rejected, s => { s.status="idle"; s.token=null; s.user=null; })
});
export const { logout, clearAuthError } = slice.actions;
export default slice.reducer;