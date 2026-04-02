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
  const [selectedImg, setSelectedImg] = useState<string | null>(null); // State untuk Modal Zoom

  const getImageUrl = (path: string) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const fetchRusak = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/peminjaman/laporan-rusak');
      const result = response.data.data || [];
      setRusak(result);
    } catch (error) {
      console.error("Gagal memuat aduan", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRusak();
  }, [fetchRusak]);

  const stats = useMemo(() => {
    const total = rusak.length;
    return { total };
  }, [rusak]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* HEADER */}
      <SectionHeader
        title="Laporan Kerusakan Alat"
        description="Pantau dan kelola laporan kerusakan alat dari mahasiswa"
        rightElement={
          <button 
            onClick={fetchRusak}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-red-500 transition-all font-semibold text-sm shadow-sm"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      {!loading && rusak.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Total Laporan</p>
                <p className="text-3xl font-black text-red-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                <i className="bi bi-exclamation-triangle-fill text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-3xl border-2 border-slate-100">
           <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
           <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Menganalisa Kerusakan...</p>
        </div>
      ) : rusak.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {rusak.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden hover:border-red-200 transition-all group">
              
              <div className="flex flex-col lg:flex-row">
                {/* LEFT: PHOTOS COMPARISON */}
                <div className="lg:w-80 p-8 bg-slate-900 flex flex-row lg:flex-col gap-6 justify-center items-center">
                  <div className="text-center group-hover:scale-105 transition-transform duration-500">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest">Kondisi Awal</p>
                    <div className="relative">
                      <img 
                        src={getImageUrl(item.foto_before)} 
                        onClick={() => setSelectedImg(getImageUrl(item.foto_before))}
                        className="w-28 h-28 lg:w-36 lg:h-36 object-cover rounded-3xl border-2 border-slate-700 shadow-2xl grayscale hover:grayscale-0 transition-all cursor-zoom-in" 
                        alt="Before" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <i className="bi bi-arrow-right lg:bi-arrow-down text-xl text-slate-700"></i>
                  </div>
                  
                  <div className="text-center group-hover:scale-110 transition-transform duration-500">
                    <p className="text-[9px] font-black text-red-500 uppercase mb-3 tracking-widest">Kondisi Rusak</p>
                    <div className="relative">
                      <img 
                        src={getImageUrl(item.foto_after)} 
                        onClick={() => setSelectedImg(getImageUrl(item.foto_after))}
                        className="w-28 h-28 lg:w-36 lg:h-36 object-cover rounded-3xl border-4 border-red-600 shadow-2xl shadow-red-900/40 cursor-zoom-in" 
                        alt="After" 
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT: CONTENT */}
                <div className="flex-1 p-8 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase tracking-widest border border-red-100 mb-3 inline-block">
                        TIKET: #{item.id}
                      </span>
                      <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                        {item.nama_alat}
                      </h3>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Dilaporkan</p>
                      <p className="text-xs font-black text-slate-600 uppercase italic">
                        {item.tanggal_kembali 
                          ? new Date(item.tanggal_kembali).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mahasiswa</p>
                      <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{item.nama_mahasiswa}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Lab</p>
                      <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{item.ruangan_lab}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <i className="bi bi-exclamation-triangle-fill text-4xl text-red-600"></i>
                    </div>
                    <p className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest">Detail Aduan:</p>
                    <p className="text-lg font-black text-red-900 italic leading-tight tracking-tight">
                      {item.deskripsi_kerusakan ? `"${item.deskripsi_kerusakan}"` : '"Tidak ada deskripsi kerusakan."'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-shield-check text-4xl text-emerald-600"></i>
          </div>
          <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-[0.3em]">Semua Alat Aman 🎉</h3>
        </div>
      )}

      {/* MODAL ZOOM FOTO - FULLSCREEN OVERLAY */}
      {selectedImg && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10 transition-all duration-300"
          style={{ zIndex: 9999 }} 
          onClick={() => setSelectedImg(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setSelectedImg(null)}
          >
            <i className="bi bi-x-lg text-4xl"></i>
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <img 
              src={selectedImg} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 animate-in zoom-in-95 duration-300"
              alt="Zoomed View"
            />
            
            <div className="mt-6 text-center">
              <p className="text-white font-black uppercase italic tracking-[0.3em] text-xs">
                Bukti Dokumentasi Kerusakan
              </p>
              <p className="text-white/40 text-[9px] uppercase font-bold mt-2">
                Klik di luar gambar untuk kembali
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarAlatRusak;