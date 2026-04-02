import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { SectionHeader } from '../../components/molecules/SectionHeader';

// 1. Interface disesuaikan dengan JSON Backend (Flat Data)
interface RiwayatRuang {
  id: number;
  laboratorium: string;
  keperluan: string;
  kondisi_masuk: string;
  kondisi_keluar: string;
  waktu_masuk: string;
  waktu_keluar: string;
  jam_mulai: string;
  jam_selesai: string;
  nama_mahasiswa: string; 
  nim_mahasiswa: string;   
  foto_before: string;
  foto_after: string;
}

const RiwayatRuangStaff: React.FC = () => {
  const [riwayat, setRiwayat] = useState<RiwayatRuang[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null); // State untuk Modal Zoom

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/staff/riwayat-ruang', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRiwayat(response.data.data || []);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const stats = useMemo(() => {
    const total = riwayat.length;
    const aktif = riwayat.filter(item => item.kondisi_keluar.toLowerCase().includes('belum')).length;
    const selesai = total - aktif;
    const bersihMasuk = riwayat.filter(item => item.kondisi_masuk === 'Bersih').length;
    const bersihKeluar = riwayat.filter(item => item.kondisi_keluar === 'Bersih').length;
    
    return { total, aktif, selesai, bersihMasuk, bersihKeluar };
  }, [riwayat]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* HEADER */}
      <SectionHeader
        title="Riwayat Penggunaan Ruang"
        description="Monitor seluruh aktivitas penggunaan ruangan laboratorium"
        rightElement={
          <button 
            onClick={fetchRiwayat} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all font-semibold text-sm shadow-sm"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      {!loading && riwayat.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard title="Total Riwayat" value={stats.total} icon="bi-door-open" color="blue" />
          <StatCard title="Sedang Aktif" value={stats.aktif} icon="bi-hourglass-split" color="amber" />
          <StatCard title="Selesai" value={stats.selesai} icon="bi-check-circle-fill" color="emerald" />
          <StatCard title="Masuk Bersih" value={stats.bersihMasuk} icon="bi-box-arrow-in-right" color="green" />
          <StatCard title="Keluar Bersih" value={stats.bersihKeluar} icon="bi-stars" color="teal" />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Foto</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Mahasiswa</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Lab & Keperluan</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Check In/Out</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Kondisi</th>
                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRow />
              ) : riwayat.length > 0 ? (
                riwayat.map((item) => {
                  const isActive = item.kondisi_keluar.toLowerCase().includes('belum');
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID & Foto Preview dengan fungsi Zoom */}
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-slate-400 text-[10px]">#{item.id}</span>
                          <div className="flex gap-2">
                            <img 
                              src={item.foto_before} 
                              onClick={() => setSelectedImg(item.foto_before)}
                              className="w-12 h-12 object-cover rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-500 hover:scale-110 transition-all shadow-sm" 
                              alt="In" 
                            />
                            <img 
                              src={item.foto_after} 
                              onClick={() => setSelectedImg(item.foto_after)}
                              className="w-12 h-12 object-cover rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-500 hover:scale-110 transition-all shadow-sm" 
                              alt="Out" 
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-black text-slate-800 uppercase italic leading-none text-sm">
                          {item.nama_mahasiswa || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest">
                          NIM: {item.nim_mahasiswa || '-'}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-indigo-600 text-xs uppercase">{item.laboratorium}</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1 italic uppercase truncate max-w-[150px]">
                           "{item.keperluan}"
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                            IN: {item.waktu_masuk}
                          </span>
                          <span className={`font-black px-2 py-0.5 rounded border w-fit ${
                            isActive ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            OUT: {isActive ? 'BERLANGSUNG' : item.waktu_keluar}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                           <ConditionBadge label="IN" status={item.kondisi_masuk} />
                           {!isActive && <ConditionBadge label="OUT" status={item.kondisi_keluar} />}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black uppercase animate-pulse">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[9px] font-black uppercase">
                            <i className="bi bi-check-circle-fill"></i>
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyRow />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ZOOM FOTO - FIXED Z-INDEX TINGGI */}
      {selectedImg && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10 transition-all duration-300"
          style={{ zIndex: 9999 }} 
          onClick={() => setSelectedImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setSelectedImg(null)}
          >
            <i className="bi bi-x-lg text-4xl"></i>
          </button>

          <div 
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <img 
              src={selectedImg} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white/10"
              alt="Zoomed View"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
              <p className="text-white font-black uppercase italic tracking-[0.3em] text-xs">
                Preview Kondisi Ruangan
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-Komponen
const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-200 rounded-2xl p-4 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-[9px] font-black text-${color}-600 uppercase tracking-widest`}>{title}</p>
        <p className={`text-2xl font-black text-${color}-900 mt-1`}>{value}</p>
      </div>
      <div className={`w-10 h-10 bg-${color}-500 rounded-xl flex items-center justify-center shadow-lg shadow-${color}-200`}>
        <i className={`bi ${icon} text-white text-lg`}></i>
      </div>
    </div>
  </div>
);

const ConditionBadge = ({ label, status }: { label: string, status: string }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black border ${
    status === 'Bersih' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
  }`}>
    <span className="opacity-50">{label}:</span> {status.toUpperCase()}
  </div>
);

const LoadingRow = () => (
  <tr>
    <td colSpan={6} className="p-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Menganalisa Riwayat...</p>
      </div>
    </td>
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={6} className="p-20 text-center">
      <div className="flex flex-col items-center">
        <i className="bi bi-door-closed text-5xl text-slate-200 mb-4"></i>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Belum Ada Aktivitas</h3>
      </div>
    </td>
  </tr>
);

export default RiwayatRuangStaff;