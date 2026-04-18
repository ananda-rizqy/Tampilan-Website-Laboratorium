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

  const formatWaktuLengkap = (dateString: string | null) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <SectionHeader
        title="Laporan Kerusakan Inventori"
        description="Pantau aset laboratorium yang memerlukan perbaikan berdasarkan laporan mahasiswa"
        rightElement={
          <button 
            onClick={fetchRusak}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 rounded-2xl hover:border-red-500 transition-all font-black text-[10px] tracking-widest shadow-sm active:scale-95"
          >
            <i className="bi bi-arrow-clockwise text-sm"></i>
            <span>REFRESH DATA</span>
          </button>
        }
      />

      {/* STATISTICS CARDS*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-2 italic">Aduan Kerusakan</p>
            <p className="text-3xl font-black text-red-900">{stats.total}</p>
          </div>
          <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 relative z-10">
            <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center w-20">ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Dokumentasi (B/A)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Informasi Alat</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Pelapor & Lokasi</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Detail Kerusakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center animate-pulse font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">
                    Menganalisa data kerusakan...
                  </td>
                </tr>
              ) : rusak.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="bi bi-shield-check text-2xl text-emerald-500"></i>
                    </div>
                    <p className="font-black text-slate-300 uppercase tracking-[0.2em] text-xs">Semua Inventori Aman</p>
                  </td>
                </tr>
              ) : (
                rusak.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="p-6 text-center font-black text-slate-400 text-xs tracking-tighter">#{item.id}</td>
                    
                    {/* FOTO COMPARISON */}
                    <td className="p-6">
                      <div className="flex justify-center gap-4">
                        <div className="relative cursor-zoom-in group/img" onClick={() => setSelectedImg(getImageUrl(item.foto_before))}>
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                            <img src={getImageUrl(item.foto_before)} className="w-full h-full object-cover grayscale opacity-60 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all" alt="Before" />
                          </div>
                          <span className="absolute -top-2 -right-2 text-[7px] bg-slate-800 text-white px-1.5 py-0.5 rounded-md font-black uppercase shadow-sm">Before</span>
                        </div>
                        <div className="relative cursor-zoom-in group/img" onClick={() => setSelectedImg(getImageUrl(item.foto_after))}>
                          <div className="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-500 overflow-hidden shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                            <img src={getImageUrl(item.foto_after)} className="w-full h-full object-cover" alt="After" />
                          </div>
                          <span className="absolute -top-2 -right-2 text-[7px] bg-red-600 text-white px-1.5 py-0.5 rounded-md font-black uppercase shadow-sm animate-pulse">After</span>
                        </div>
                      </div>
                    </td>

                    {/* ALAT */}
                    <td className="p-6">
                      <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-none mb-2">{item.nama_alat}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                        <i className="bi bi-tag-fill text-indigo-500 text-[10px]"></i>
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                          {item.kode_tag || 'NON-TAG'}
                        </span>
                      </div>
                    </td>

                    {/* PELAPOR */}
                    <td className="p-6">
                      <p className="text-[11px] font-black text-slate-700 uppercase italic tracking-tighter leading-none mb-2">{item.nama_mahasiswa}</p>
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center border border-slate-100">
                            <i className="bi bi-geo-alt-fill text-[10px]"></i>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight">{item.ruangan_lab}</span>
                      </div>
                    </td>

                    {/* DETAIL KERUSAKAN */}
                    <td className="p-6">
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 max-w-xs relative group/desc hover:border-red-300 transition-colors">
                        <p className="text-[11px] font-black text-red-900 leading-tight italic line-clamp-2 group-hover/desc:line-clamp-none transition-all">
                          "{item.deskripsi_kerusakan || 'Tanpa keterangan'}"
                        </p>
                        
                        <div className="mt-3 pt-3 border-t border-red-200 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <i className="bi bi-clock-fill text-[10px] text-red-400"></i>
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                              {formatWaktuLengkap(item.tanggal_kembali)}
                            </p>
                          </div>
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
          className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] animate-in fade-in"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors active:scale-90">
            <i className="bi bi-x-circle text-5xl"></i>
          </button>
          <img 
            src={selectedImg} 
            className="max-w-full max-h-[80vh] object-contain rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.3)] border-4 border-white/10 animate-in zoom-in-95"
            alt="Zoomed"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-8 px-8 py-3 bg-red-600 text-white font-black uppercase italic tracking-[0.4em] text-[10px] rounded-full shadow-xl">
            Bukti Dokumentasi Kerusakan
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarAlatRusak;