import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";

interface AlatRusak {
  id: number;
  nama_mahasiswa: string;
  nama_alat: string;
  kode_tag: string;
  deskripsi_kerusakan: string;
  tanggal_kembali: string;
  foto_before: string;
  foto_after: string;
  ruangan_lab: string;
}

const DaftarAlatRusak: React.FC = () => {
  const [rusak, setRusak] = useState<AlatRusak[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fungsi format waktu lengkap (Tanggal + Jam)
  const formatWaktuLengkap = (dateString: string | null) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('.', ':');
  };

  const getImageUrl = (path: string) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^public\//, '');
    return `${API_URL}/storage/${cleanPath}`;
  };

  const fetchRusak = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/peminjaman/laporan-rusak');
      setRusak(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat aduan", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRusak();
  }, [fetchRusak]);

  const stats = useMemo(() => ({ total: rusak.length }), [rusak]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <SectionHeader
        title="Laporan Kerusakan Alat"
        description="Daftar inventori yang dilaporkan bermasalah oleh mahasiswa"
        rightElement={
          <button 
            onClick={fetchRusak}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-red-500 transition-all font-black text-[10px] tracking-widest shadow-sm"
          >
            <i className="bi bi-arrow-clockwise text-sm"></i>
            <span>REFRESH</span>
          </button>
        }
      />

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[1.5rem] border-2 border-slate-100 flex items-center justify-between shadow-sm overflow-hidden relative">
          <div className="absolute -right-2 -bottom-2 opacity-5">
             <i className="bi bi-exclamation-triangle-fill text-6xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Kasus Aktif</p>
            <p className="text-3xl font-black text-red-600">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 relative z-10 shadow-inner">
            <i className="bi bi-exclamation-triangle-fill text-xl"></i>
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-16">ID</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Dokumentasi (B/A)</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Informasi Alat</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Pelapor & Lokasi</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Detail Kerusakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
                    <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Menganalisa Kerusakan...</p>
                  </div>
                </td></tr>
              ) : rusak.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <i className="bi bi-shield-check text-6xl text-slate-300 mb-4"></i>
                    <h3 className="text-sm font-black uppercase tracking-[0.4em]">Semua Alat Aman</h3>
                  </div>
                </td></tr>
              ) : (
                rusak.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="p-5 text-center font-black text-slate-400 text-xs">#{item.id}</td>
                    
                    {/* FOTO COMPARISON */}
                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        <div className="relative cursor-zoom-in" onClick={() => setSelectedImg(getImageUrl(item.foto_before))}>
                          <img src={getImageUrl(item.foto_before)} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 grayscale hover:grayscale-0 transition-all shadow-sm" alt="Before" />
                          <span className="absolute -top-2 -right-2 text-[7px] bg-slate-800 text-white px-1.5 py-0.5 rounded-full font-black uppercase shadow-sm">Sebelum</span>
                        </div>
                        <div className="relative cursor-zoom-in" onClick={() => setSelectedImg(getImageUrl(item.foto_after))}>
                          <img src={getImageUrl(item.foto_after)} className="w-12 h-12 rounded-xl object-cover border-2 border-red-500 group-hover:scale-110 transition-transform shadow-md" alt="After" />
                          <span className="absolute -top-2 -right-2 text-[7px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase shadow-sm">Sesudah</span>
                        </div>
                      </div>
                    </td>

                    {/* ALAT */}
                    <td className="p-5">
                      <p className="text-[11px] font-black text-slate-900 uppercase leading-tight tracking-tight">{item.nama_alat}</p>
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black tracking-tighter border border-indigo-100">
                        <i className="bi bi-tag-fill"></i> {item.kode_tag || 'NON-TAG'}
                      </span>
                    </td>

                    {/* PELAPOR */}
                    <td className="p-5">
                      <p className="text-[11px] font-black text-slate-700 uppercase leading-none">{item.nama_mahasiswa}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                        <i className="bi bi-geo-alt-fill text-[10px]"></i>
                        <span className="text-[10px] font-bold uppercase tracking-tight">{item.ruangan_lab}</span>
                      </div>
                    </td>

                    {/* DETAIL KERUSAKAN (UPDATE WAKTU) */}
                    <td className="p-5">
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 max-w-xs relative group/desc">
                        <p className="text-[11px] font-black text-red-900 leading-tight italic truncate group-hover/desc:whitespace-normal">
                          "{item.deskripsi_kerusakan || 'Tanpa keterangan'}"
                        </p>
                        
                        {/* WAKTU LAPORAN */}
                        <div className="mt-3 pt-2 border-t border-red-200 flex items-center gap-1.5">
                          <i className="bi bi-clock-fill text-[10px] text-red-400"></i>
                          <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                            {formatWaktuLengkap(item.tanggal_kembali)}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ZOOM */}
      {selectedImg && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in z-[9999]"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <i className="bi bi-x-lg text-4xl"></i>
          </button>
          <img 
            src={selectedImg} 
            className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300"
            alt="Zoomed"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-6 text-white font-black uppercase italic tracking-[0.3em] text-[10px] opacity-60">Dokumentasi Bukti Kerusakan</p>
        </div>
      )}
    </div>
  );
};

export default DaftarAlatRusak;