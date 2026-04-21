import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";

interface PeminjamanDetail {
  id: number;
  alat_id: number;
  jumlah_pinjam: number;
  alat: {
    nama_alat: string;
    kode_tag: string;
  };
}

interface MyRiwayat {
  id: number;
  ruangan_lab: string;
  tujuan_penggunaan: string;
  status: string;
  kondisi_kembali: string | null;
  alasan_penolakan: string | null;
  penerima?: {
    name: string;
  };
  waktu_mulai: string | null; 
  waktu_pinjam: string | null; 
  waktu_kembali: string | null; 
  created_at: string;
  foto_before: string | null;
  foto_after: string | null;
  details: PeminjamanDetail[];
}

const RiwayatSaya: React.FC = () => {
  const [data, setData] = useState<MyRiwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchMyRiwayat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/mahasiswa/riwayat-saya');
      setData(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat riwayat", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRiwayat();
  }, [fetchMyRiwayat]);

  const formatWaktu = (dateString: string | null) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    const cleanPath = path.replace(/^public\//, '');
    return `${API_URL}/storage/${cleanPath}`;
  };

  const getStatusBadge = (status: string) => {
    const configs: any = {
      pending: { bg: 'bg-amber-50 text-amber-600 border-amber-200', icon: 'bi-clock', label: 'MENUNGGU' },
      booking: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: 'bi-calendar-check', label: 'BOOKING' },
      ongoing: { bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: 'bi-play-circle', label: 'AKTIF' },
      returned: { bg: 'bg-slate-50 text-slate-500 border-slate-200', icon: 'bi-check-all', label: 'SELESAI' },
      rejected: { bg: 'bg-red-50 text-red-600 border-red-200', icon: 'bi-x-circle', label: 'DITOLAK' },
    };
    const config = configs[status.toLowerCase()] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: 'bi-info-circle', label: status.toUpperCase() };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border-b-2 shadow-sm ${config.bg}`}>
        <i className={config.icon}></i> {config.label}
      </span>
    );
  };

  const stats = useMemo(() => ({
    total: data.length,
    baik: data.filter(item => item.kondisi_kembali?.toLowerCase() === 'baik').length,
    rusak: data.filter(item => item.kondisi_kembali?.toLowerCase() === 'rusak').length,
    rejected: data.filter(item => item.status === 'rejected').length,
  }), [data]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SectionHeader
        title="Riwayat Peminjaman Saya"
        description="Monitor status, timeline, dan dokumentasi aktivitas peminjaman"
        rightElement={
          <button onClick={fetchMyRiwayat} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-500 transition-all font-black text-[10px] tracking-widest shadow-sm active:scale-95">
            <i className="bi bi-arrow-clockwise text-sm"></i> REFRESH DATA
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
        <StatCard title="Total Riwayat" value={stats.total} icon="bi-archive" color="blue" />
        <StatCard title="Kembali Baik" value={stats.baik} icon="bi-patch-check-fill" color="emerald" />
        <StatCard title="Kondisi Rusak" value={stats.rusak} icon="bi-exclamation-octagon-fill" color="red" />
        <StatCard title="Dibatalkan" value={stats.rejected} icon="bi-x-circle" color="red" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center w-20">ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Alat Laboratorium</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Tujuan & Ruang</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Timeline</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Dokumentasi</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Status & Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRow />
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-6 text-center font-black text-slate-400 text-xs tracking-tighter">#{item.id}</td>
                    
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5">
                        {item.details?.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            <span className="font-black text-slate-800 text-[10px] uppercase italic tracking-tight">{detail.alat?.nama_alat}</span>
                            <span className="text-[10px] font-black text-indigo-600 ml-auto">x{detail.jumlah_pinjam}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-6">
                      <p className="text-[11px] font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">{item.ruangan_lab || '---'}</p>
                      <p className="text-[10px] text-slate-500 font-bold italic leading-tight line-clamp-2 max-w-[180px]">"{item.tujuan_penggunaan}"</p>
                    </td>

                    <td className="p-6">
                      <div className="flex flex-col gap-2 min-w-[170px]">
                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">
                            <i className="bi bi-box-arrow-in-right"></i> Ambil: {formatWaktu(item.waktu_pinjam)}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-tighter">
                            <i className="bi bi-box-arrow-left"></i> Kembali: {formatWaktu(item.waktu_kembali)}
                        </div>
                      </div>
                    </td>

                    <td className="p-6 text-center">
                      {item.status.toLowerCase() !== 'rejected' ? (
                        <div className="flex justify-center gap-3">
                          {[
                            { label: 'Before', path: item.foto_before, accent: 'border-indigo-400' },
                            { label: 'After', path: item.foto_after, accent: 'border-emerald-400' }
                          ].map((img, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{img.label}</span>
                              {img.path ? (
                                <button 
                                  onClick={() => setSelectedImg(getImageUrl(img.path)!)}
                                  className={`w-12 h-12 rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm hover:${img.accent} transition-all active:scale-90`}
                                >
                                  <img src={getImageUrl(img.path)!} className="w-full h-full object-cover" alt={img.label} />
                                </button>
                              ) : (
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200">
                                  <i className="bi bi-camera"></i>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                         <div className="text-center italic text-red-300 font-black text-[9px] uppercase tracking-widest">Cancelled</div>
                      )}
                    </td>

                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {getStatusBadge(item.status)}
                        
                        {/* BAGIAN STAFF (Penerima) */}
                        {item.penerima ? (
                          <div className="flex items-center gap-1 mt-0.5 animate-in fade-in duration-500">
                            <i className="bi bi-person-badge text-[9px] text-slate-400"></i>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">
                              {item.status.toLowerCase() === 'rejected' ? 'Rejected By: ' : 'Approved By: '}
                              {item.penerima.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          item.status.toLowerCase() === 'pending' && (
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic animate-pulse">
                              Waiting Review
                            </span>
                          )
                        )}

                        {item.status.toLowerCase() === 'rejected' && item.alasan_penolakan && (
                          <div className="bg-red-50 border border-red-100 p-2.5 rounded-2xl max-w-[150px] shadow-sm animate-in fade-in slide-in-from-top-1">
                            <p className="text-[7px] font-black text-red-400 uppercase tracking-tighter mb-1 leading-none text-left italic">Alasan Penolakan:</p>
                            <p className="text-[9px] font-bold text-red-800 italic leading-tight text-left italic">
                              "{item.alasan_penolakan}"
                            </p>
                          </div>
                        )}

                        {item.kondisi_kembali && item.status.toLowerCase() === 'returned' && (
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border-b-2
                            ${item.kondisi_kembali === 'rusak' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                            {item.kondisi_kembali === 'rusak' ? '✗ Rusak' : '✓ Baik'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow />
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            className="max-w-full max-h-[80vh] object-contain rounded-[2.5rem] shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()} 
          />
          <p className="mt-8 text-white/50 font-black uppercase italic tracking-[0.4em] text-[10px]">Dokumentasi Peminjaman Alat</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => {
  const themes: any = {
    blue: 'from-blue-50 to-blue-100 text-blue-600 border-blue-200 shadow-blue-200 bg-blue-500',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200 shadow-emerald-200 bg-emerald-500',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200 shadow-indigo-200 bg-indigo-500',
    red: 'from-red-50 to-red-100 text-red-600 border-red-200 shadow-red-200 bg-red-500'
  };
  const t = themes[color].split(' ');

  return (
    <div className={`bg-gradient-to-br ${t[0]} ${t[1]} border ${t[2]} p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm`}>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-2 italic ${t[3]}`}>{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${t[5]} ${t[4]}`}>
        <i className={`bi ${icon} text-xl`}></i>
      </div>
    </div>
  );
};

const LoadingRow = () => (
  <tr><td colSpan={6} className="p-24 text-center">
    <div className="flex flex-col items-center gap-4 animate-in fade-in">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full shadow-lg shadow-indigo-100"></div>
      <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Menyusun Data Riwayat...</p>
    </div>
  </td></tr>
);

const EmptyRow = () => (
  <tr><td colSpan={6} className="p-32 text-center">
    <div className="flex flex-col items-center opacity-30 animate-in zoom-in-95">
      <i className="bi bi-clipboard-x text-6xl text-slate-300 mb-4"></i>
      <h3 className="text-sm font-black uppercase tracking-[0.4em]">Belum Ada Aktivitas</h3>
    </div>
  </td></tr>
);

export default RiwayatSaya;