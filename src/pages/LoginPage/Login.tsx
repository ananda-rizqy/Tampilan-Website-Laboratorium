import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "126477442709-d4c4e3pf8tfj8bfga4p5dkbnsainvu63.apps.googleusercontent.com", 
          callback: handleGoogleResponse,
          auto_select: false, // Memaksa muncul pilihan akun jika ada banyak akun
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "outline", size: "large", width: "300", shape: "pill" }
        );
      }
    };
    
    // Memberikan sedikit delay untuk memastikan script Google terload sempurna
    const timer = setTimeout(initializeGoogle, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      // 1. Kirim ID Token ke Laravel
      const res = await axios.post("http://localhost:8000/api/auth/google", {
        token: response.credential,
      });

      // 2. Ambil data dari response Laravel
      const { user, token } = res.data;

      if (user && token) {
        // 3. Simpan data ke LocalStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);

        console.log("Login Berhasil sebagai:", user.role);
        
        // 4. Gunakan window.location agar App.tsx merefresh state user-nya secara total
        // Ini solusi paling ampuh jika sering 'mental' balik ke login
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.message || "Gagal memverifikasi akun ke server.";
      alert(errorMsg);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center',
      alignItems: 'center', background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        backgroundColor: 'white', padding: '40px', borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', width: '100%',
        maxWidth: '400px', textAlign: 'center'
      }}>
        <div style={{
          width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', color: '#2563eb'
        }}>
          <i className="bi bi-shield-lock-fill" style={{ fontSize: '2rem' }}></i>
        </div>

        <h2 style={{ margin: '0 0 10px', color: '#0f172a', fontWeight: '800' }}>POLINES LAB</h2>
        <p style={{ margin: '0 0 30px', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Sistem Informasi Laboratorium.<br/>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '40px' }}>
          <div id="googleBtn"></div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            &copy; 2026 Jurusan Teknik Elektro - POLINES
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;