import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/LoginPage/Login";
import QrGateway from "./components/QrGateway";
import MasterQR from "./pages/MasterQr";
import DaftarAlat from "./pages/DaftarAlatPage/DaftarAlat";
import PeminjamanAktif from "./pages/Mahasiswa/PeminjamanAktif";
import PengembalianAlat from "./pages/Mahasiswa/PengembalianAlat";
import RiwayatPeminjamanSaya from "./pages/Mahasiswa/RiwayatPeminjamanSaya";
import PenggunaanRuang from "./pages/Mahasiswa/PenggunaanRuang";
import RiwayatRuang from "./pages/Mahasiswa/RiwayatRuang";
import PersetujuanPinjam from "./pages/Staff/PersetujuanPinjam";
import AduanKerusakan from "./pages/Staff/AduanKerusakan";
import RiwayatPeminjaman from "./pages/Staff/RiwayatPeminjaman";
import RiwayatRuangStaff from "./pages/Staff/RiwayatRuangStaff";
import RiwayatRuangDosen from "./pages/Dosen/Riwayatruang";
import RiwayatPinjamDosen from "./pages/Dosen/Riwayatpinjam";
import "bootstrap-icons/font/bootstrap-icons.css";
import PeminjamanPage from "./pages/Mahasiswa/Peminjaman";

interface UserProfile {
  name: string;
  role: "mahasiswa" | "staff" | "dosen";
  nim_nip?: string;
}

const App: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = () => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUserStatus();
  }, [location.pathname]);

  if (loading) return null;

  const isLoginPage = location.pathname === "/login";

  if (!user && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      
      {!isLoginPage && user && (
        <header
          style={{
            height: "64px",
            backgroundColor: "#1e40af",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: "bold", fontStyle: "italic" }}>
            POLINES <span className="text-yellow-400">LAB</span>
          </div>

          <div className="text-sm font-bold uppercase italic">
            {user.name} <span className="text-slate-300 mx-2">|</span> {user.role}
          </div>
        </header>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        
        {!isLoginPage && user && <Sidebar />}

        <main
          style={{
            flex: 1,
            padding: isLoginPage ? "0" : "24px",
            backgroundColor: isLoginPage ? "transparent" : "#f1f5f9",
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h2 className="text-3xl font-black italic uppercase text-slate-800">
                    Halo, {user?.name}
                  </h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                    Selamat datang di dashboard kontrol laboratorium
                  </p>
                </div>
              }
            />

            <Route path="/generate-pintu" element={<QrGateway />} />
            <Route path="/generate-qr" element={<MasterQR />} />
            <Route path="/daftar-alat" element={<DaftarAlat />} />
            <Route path="/ajukan_pinjam" element={<PeminjamanPage />} />
            <Route path="/peminjaman_aktif" element={<PeminjamanAktif />} />
            <Route path="/pengembalian" element={<PengembalianAlat />} />
            <Route path="/riwayat-saya" element={<RiwayatPeminjamanSaya />} /> 
            <Route path="/penggunaan_ruang" element={<PenggunaanRuang />} />
            <Route path="/riwayat-ruang" element={<RiwayatRuang />} />
            <Route path="/staff/persetujuan" element={<PersetujuanPinjam />} />
            <Route path="/aduan" element={<AduanKerusakan />} />
            <Route path="/riwayat_peminjaman" element={<RiwayatPeminjaman />} />
            <Route path="/riwayat-staff" element={<RiwayatRuangStaff />} />
            <Route path="/pantau-riwayat" element={<RiwayatPinjamDosen />} />
            <Route path="/pantau-ruang" element={<RiwayatRuangDosen />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;