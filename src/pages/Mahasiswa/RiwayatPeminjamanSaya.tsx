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
  waktu_pinjam: string;
  tanggal_diambil: string | null;
  tanggal_kembali: string | null;
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
      pending: { bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'bi-clock', label: 'MENUNGGU' },
      approved: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'bi-check2-circle', label: 'DISETUJUI' },
      ongoing: { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'bi-play-circle', label: 'BERLANGSUNG' },
      returned: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'bi-arrow-left-right', label: 'SELESAI' },
      rejected: { bg: 'bg-red-100 text-red-700 border-red-200', icon: 'bi-x-circle', label: 'DITOLAK' },
    };
    const config = configs[status.toLowerCase()] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'bi-info-circle', label: status.toUpperCase() };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider border ${config.bg}`}>
        <i className={config.icon}></i> {config.label}
      </span>
    );
  };

  const stats = useMemo(() => ({
    total: data.length,
    returned: data.filter(item => item.status === 'returned').length,
    ongoing: data.filter(item => item.status === 'ongoing').length,
    pending: data.filter(item => item.status === 'pending').length,
  }), [data]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="Riwayat Peminjaman Saya"
        description="Monitor seluruh aktivitas peminjaman alat yang Anda lakukan"
        rightElement={
          <button onClick={fetchMyRiwayat} className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 transition-all font-black text-[10px] tracking-widest shadow-sm">
            <i className="bi bi-arrow-clockwise"></i> REFRESH
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Pinjam" value={stats.total} icon="bi-archive" color="blue" />
        <StatCard title="Selesai" value={stats.returned} icon="bi-check-circle-fill" color="emerald" />
        <StatCard title="Berlangsung" value={stats.ongoing} icon="bi-play-circle" color="indigo" />
        <StatCard title="Menunggu" value={stats.pending} icon="bi-clock" color="amber" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-16">ID</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Detail Alat</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Tujuan & Lokasi</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Timeline</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Dokumentasi</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRow />
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 text-center font-black text-slate-400 text-xs">#{item.id}</td>
                    <td className="p-5">
                      <div className="space-y-1">
                        {item.details?.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 border-l-2 border-indigo-100 pl-2">
                            <span className="font-bold text-slate-700 text-[11px] uppercase">{detail.alat?.nama_alat}</span>
                            <span className="text-[10px] font-black text-indigo-600">x{detail.jumlah_pinjam}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-[11px] font-black text-slate-900 uppercase leading-tight">{item.ruangan_lab || '---'}</p>
                      <p className="text-[9px] text-slate-400 font-bold italic mt-2 truncate max-w-[150px]">"{item.tujuan_penggunaan}"</p>
                    </td>
                    <td className="p-5 text-[10px]">
                      <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <div className="flex items-center gap-2 text-emerald-600 font-black">
                            <span>AMBIL: {formatWaktu(item.waktu_pinjam)}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-[150px]"></div>
                        <div className="flex items-center gap-2 text-slate-600 font-black">
                            <span>KEMBALI: {formatWaktu(item.tanggal_kembali)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        {[
                          { label: 'Sebelum', path: item.foto_before, border: 'hover:border-indigo-400' },
                          { label: 'Sesudah', path: item.foto_after, border: 'hover:border-emerald-400' }
                        ].map((img, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{img.label}</span>
                            {img.path ? (
                              <img 
                                src={getImageUrl(img.path)!} 
                                onClick={() => setSelectedImg(getImageUrl(img.path)!)}
                                className={`w-12 h-12 object-cover rounded-xl border-2 border-slate-100 cursor-zoom-in transition-all shadow-sm ${img.border}`} 
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                                <i className="bi bi-image text-slate-200"></i>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {getStatusBadge(item.status)}
                        {item.kondisi_kembali && (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.kondisi_kembali === 'rusak' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
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
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in z-[9999]" onClick={() => setSelectedImg(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><i className="bi bi-x-lg text-4xl"></i></button>
          <img src={selectedImg} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => {
  const colorMap: any = {
    blue: 'from-blue-50 to-blue-100 text-blue-600 border-blue-200',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200',
    amber: 'from-amber-50 to-amber-100 text-amber-600 border-amber-200'
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-[1.5rem] p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</p>
          <p className="text-3xl font-black mt-1 leading-none">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center shadow-inner">
          <i className={`bi ${icon} text-2xl`}></i>
        </div>
      </div>
    </div>
  );
};

const LoadingRow = () => (
  <tr><td colSpan={6} className="p-24 text-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Sinkronisasi Riwayat...</p>
    </div>
  </td></tr>
);

const EmptyRow = () => (
  <tr><td colSpan={6} className="p-32 text-center">
    <div className="flex flex-col items-center opacity-30">
      <i className="bi bi-clipboard-x text-6xl text-slate-300 mb-4"></i>
      <h3 className="text-sm font-black uppercase tracking-[0.4em]">Data Kosong</h3>
    </div>
  </td></tr>
);

export default RiwayatSaya;