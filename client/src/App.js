import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Main from "./pages/Main";       
import Results from "./pages/Results"; 
import Live from "./pages/Live";       
import AdminSignup from "./pages/AdminSignup";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/results" element={<Results />} />
        <Route path="/live" element={<Live />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
      </Routes>
    </BrowserRouter>
  );
}
