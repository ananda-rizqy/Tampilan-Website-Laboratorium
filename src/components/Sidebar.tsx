import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface MenuItem {
  name: string;
  icon: string;
  path: string;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useMemo(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  }, []);

  const userRole = user?.role?.toLowerCase() || "";

  const allMenu: MenuItem[] = [
    // MENU UMUM
    { name: "Beranda", icon: "bi-house", path: "/dashboard", roles: ["mahasiswa", "staff", "dosen"] },
    { name: "Ketersediaan Alat", icon: "bi-search", path: "/daftar-alat", roles: ["mahasiswa", "dosen", "staff"] },

    // MENU MAHASISWA
    { name: "Peminjaman", icon: "bi-box-arrow-right", path: "/ajukan_pinjam", roles: ["mahasiswa"] },
    { name: "Peminjaman Aktif", icon: "bi-card-checklist", path: "/peminjaman_aktif", roles: ["mahasiswa"] },
    { name: "Pengembalian Alat", icon: "bi-arrow-left-right", path: "/pengembalian", roles: ["mahasiswa"] },
    { name: 'Penggunaan Ruang Lab', icon: "bi-door-open", path: '/penggunaan_ruang', roles: ["mahasiswa"] },
    { name: "Riwayat Peminjaman", icon: "bi-clock-history", path: "/riwayat-saya", roles: ["mahasiswa"] },
    { name: "Riwayat Ruang", icon: "bi-calendar-check", path: "/riwayat-ruang", roles: ["mahasiswa"] },

    // MENU STAFF
    { name: "Persetujuan Pinjam", icon: "bi-check2-square", path: "/staff/persetujuan", roles: ["staff"] },
    { name: "Laporan Kerusakan", icon: "bi-exclamation-triangle-fill", path: "/aduan", roles: ["staff"] },
    { name: "Riwayat Peminjaman", icon: "bi-clock-history", path: "/riwayat_peminjaman", roles: ["staff"] },
    { name: "Riwayat Penggunaan Ruang", icon: "bi-calendar-check", path: "/riwayat-staff", roles: ["staff"] },

    // MENU DOSEN
    { name: "Riwayat Peminjaman", icon: "bi-clock-history", path: "/pantau-riwayat", roles: ["dosen"] },
    { name: "Riwayat Penggunaan Ruang", icon: "bi-calendar-check", path: "/pantau-ruang", roles: ["dosen"] },

  //   // MENU ADMIN (GENERATE QR PINTU)
    // { name: "Master QR Pintu", icon: "bi-qr-code", path: "/generate-qr", roles: ["mahasiswa", "staff", "dosen"] },
  ];

  const menu = allMenu.filter((item) => item.roles.includes(userRole));

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token"); 
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: "260px",
        backgroundColor: "#0f172a",
        color: "#94a3b8",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid #1e293b",
        flexShrink: 0,
      }}
    >
      {/* LABEL MENU - Langsung dari atas */}
      <div style={{ padding: "24px 20px 8px", fontSize: "0.625rem", fontWeight: "800", color: "#334155", letterSpacing: "0.1em", flexShrink: 0 }}>
        MENU UTAMA
      </div>

      {/* MENU ITEMS - NO SCROLL */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: "2px", minHeight: 0 }}>
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.name + item.path}
              onClick={() => handleNavigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                color: isActive ? "#3b82f6" : "#94a3b8",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#1e293b";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: "1.125rem", flexShrink: 0 }}></i>
              <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 }}>
                {item.name}
              </span>
            </div>
          );
        })}
      </nav>

      {/* LOGOUT BUTTON */}
      <div
        onClick={handleLogout}
        style={{
          padding: "16px 12px",
          borderTop: "1px solid #1e293b",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            color: "#f87171",
            borderRadius: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#f87171";
          }}
        >
          <i className="bi bi-box-arrow-left" style={{ fontSize: "1.125rem" }}></i>
          <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Keluar</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;