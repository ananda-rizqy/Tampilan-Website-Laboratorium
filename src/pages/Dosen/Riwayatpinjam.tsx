import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { SectionHeader } from '../../components/molecules/SectionHeader';

interface RiwayatData {
  id: number;
  nama_mahasiswa: string;
  nim: string;
  tujuan_penggunaan: string;
  status: string;
  kondisi_kembali: string | null;
  foto_before: string | null;
  foto_after: string | null;
  created_at: string; 
  waktu_kembali: string | null; 
  details: Array<{
    alat: {
      nama_alat: string;
      kode_tag: string;
    };
  }>;
}

const RiwayatPeminjamanDosen: React.FC = () => {
  const [data, setData] = useState<RiwayatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/peminjaman/pantau-riwayat', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      setData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil riwayat dosen", error);
    } finally {
      setLoading(false);
    }
  };

  const formatWaktu = (dateString: string | null) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\./g, ':');
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;
  };

  // Statistik 
  const stats = useMemo(() => {
    const total = data.length;
    const returned = data.filter(item => item.status === 'returned').length;
    const rusak = data.filter(item => item.kondisi_kembali === 'rusak').length;
    const baik = data.filter(item => item.kondisi_kembali === 'baik' || (!item.kondisi_kembali && item.status === 'returned')).length;
    return { total, returned, rusak, baik };
  }, [data]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* HEADER */}
      <SectionHeader
        title="Riwayat Peminjaman"
        description="Monitor dan dokumentasi seluruh aktivitas peminjaman alat laboratorium"
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
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Riwayat" value={stats.total} icon="bi-archive" color="blue" />
          <StatCard title="Dikembalikan" value={stats.returned} icon="bi-check-circle-fill" color="emerald" />
          <StatCard title="Kondisi Baik" value={stats.baik} icon="bi-stars" color="green" />
          <StatCard title="Kondisi Rusak" value={stats.rusak} icon="bi-exclamation-triangle-fill" color="red" />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Mahasiswa</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Alat & Tujuan</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Waktu</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest">Dokumentasi</th>
                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRow />
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-4 text-slate-400 font-bold text-xs">#{item.id}</td>

                    {/* Mahasiswa */}
                    <td className="p-4">
                      <div className="font-black text-slate-800 uppercase italic leading-none text-sm">
                        {item.nama_mahasiswa}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase">
                        NIM: {item.nim}
                      </div>
                    </td>

                    {/* Alat & Tujuan */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {item.details?.map((detail, idx) => (
                          <div key={idx} className="border-l-2 border-indigo-200 pl-2">
                            <div className="font-black text-slate-700 text-[11px] uppercase leading-none">{detail.alat?.nama_alat}</div>
                            <div className="text-[9px] text-indigo-500 font-black uppercase tracking-tighter mt-1">TAG: {detail.alat?.kode_tag || '-'}</div>
                          </div>
                        ))}
                        <div className="mt-1 text-[10px] text-slate-400 font-bold italic uppercase truncate max-w-[180px]">
                           "{item.tujuan_penggunaan}"
                        </div>
                      </div>
                    </td>

                    {/* Waktu */}
                    <td className="p-4 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                          PINJAM: {formatWaktu(item.created_at)}
                        </span>
                        <span className="font-black text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 w-fit">
                          KEMBALI: {formatWaktu(item.waktu_kembali)}
                        </span>
                      </div>
                    </td>

                    {/* Dokumentasi */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Before</span>
                          {getImageUrl(item.foto_before) ? (
                            <img 
                              src={getImageUrl(item.foto_before)!} 
                              className="w-12 h-12 object-cover rounded-lg border-2 border-slate-200 cursor-zoom-in hover:border-indigo-500 transition-all shadow-sm" 
                              onClick={() => setSelectedImg(getImageUrl(item.foto_before)!)} 
                              alt="Before"
                            />
                          ) : <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200"><i className="bi bi-image text-slate-200"></i></div>}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase">After</span>
                          {getImageUrl(item.foto_after) ? (
                            <img 
                              src={getImageUrl(item.foto_after)!} 
                              className="w-12 h-12 object-cover rounded-lg border-2 border-slate-200 cursor-zoom-in hover:border-emerald-500 transition-all shadow-sm" 
                              onClick={() => setSelectedImg(getImageUrl(item.foto_after)!)} 
                              alt="After"
                            />
                          ) : <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200"><i className="bi bi-image text-slate-200"></i></div>}
                        </div>
                      </div>
                    </td>

                    {/* Status & Kondisi */}
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${
                          item.status === 'returned' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}>
                          {item.status}
                        </span>
                        {item.kondisi_kembali && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            item.kondisi_kembali === 'rusak' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>
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

      {/* MODAL ZOOM */}
      {selectedImg && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10 transition-all duration-300"
          style={{ zIndex: 9999 }} 
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <i className="bi bi-x-lg text-4xl"></i>
          </button>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300" alt="Zoom" />
            <div className="absolute -bottom-10 text-center w-full text-white font-black uppercase italic tracking-widest text-xs opacity-60">
              Preview Dokumentasi Peminjaman
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-komponen StatCard, LoadingRow, dan EmptyRow 
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
        <i className="bi bi-inbox text-5xl text-slate-200 mb-4"></i>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Belum Ada Aktivitas</h3>
      </div>
    </td>
  </tr>
);

export default RiwayatPeminjamanDosen;