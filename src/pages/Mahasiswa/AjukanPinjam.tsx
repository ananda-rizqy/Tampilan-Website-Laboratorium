import React, { useState } from "react";
import axios from "axios";

const AjukanPinjam: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [formData, setFormData] = useState({
    alat_id: 1, 
    laboratorium: "Elektronika",
    tujuan_penggunaan: "",
    waktu_pinjam: "",
    waktu_kembali: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/peminjaman/ajukan", formData);
      alert("Permohonan terkirim! Silakan tunggu konfirmasi staff.");
    } catch (err) {
      alert("Gagal mengajukan pinjaman.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-6">Form Peminjaman Alat</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400">NAMA</label>
            <input type="text" value={user.name} readOnly className="w-full p-2 bg-slate-100 rounded border" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">NIM</label>
            <input type="text" value={user.nim_nip} readOnly className="w-full p-2 bg-slate-100 rounded border" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">TUJUAN PENGGUNAAN</label>
          <textarea 
            required
            className="w-full p-2 border rounded" 
            onChange={(e) => setFormData({...formData, tujuan_penggunaan: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
          Kirim Pengajuan
        </button>
      </form>
    </div>
  );
};

export default AjukanPinjam;