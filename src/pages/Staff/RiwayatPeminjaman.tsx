import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { SectionHeader } from '../../components/molecules/SectionHeader';

interface RiwayatData {
  id: number;
  tujuan_penggunaan: string;
  status: string;
  kondisi_kembali: string | null;
  alasan_penolakan: string | null;
  created_at: string;
  waktu_mulai: string | null; 
  waktu_pinjam: string | null; 
  waktu_kembali: string | null; 
  foto_before: string | null;
  foto_after: string | null;
  user: {
    name: string;
    nim_nip: string;
  };
  penerima?: { 
    name: string;
  };
  details: Array<{
    alat: {
      nama_alat: string;
      kode_tag: string;
    };
  }>;
}

const RiwayatPeminjaman: React.FC = () => {
  const [data, setData] = useState<RiwayatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const fetchRiwayat = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/peminjaman/monitor-riwayat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil riwayat", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  const formatWaktu = (dateString: string | null) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `http://localhost:8000/storage/${path}`;
  };

  const stats = useMemo(() => {
    const total = data.length;
    const returned = data.filter(item => item.status === 'returned').length;
    const rejected = data.filter(item => item.status === 'rejected').length;
    const rusak = data.filter(item => item.kondisi_kembali === 'rusak').length;
    return { total, returned, rejected, rusak };
  }, [data]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      <SectionHeader
        title="Riwayat Peminjaman Staff"
        description="Pantau audit log dan dokumentasi seluruh transaksi alat laboratorium"
        rightElement={
          <button onClick={fetchRiwayat} className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 transition-all font-bold text-[10px] tracking-widest shadow-sm active:scale-95">
            <i className="bi bi-arrow-clockwise"></i> REFRESH DATA
          </button>
        }
      />

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
          <StatCard title="Total Transaksi" value={stats.total} icon="bi-archive" color="blue" />
          <StatCard title="Selesai" value={stats.returned} icon="bi-check-circle-fill" color="emerald" />
          <StatCard title="Ditolak" value={stats.rejected} icon="bi-x-circle-fill" color="red" />
          <StatCard title="Rusak" value={stats.rusak} icon="bi-exclamation-octagon-fill" color="amber" />
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-20">ID</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Mahasiswa</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Alat & Tujuan</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Waktu</th>
                <th className="p-5 text-center text-[10px] font-black uppercase tracking-widest">Dokumentasi</th>
                <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRow />
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-5 text-center font-bold text-slate-300 text-xs">#{item.id}</td>

                    <td className="p-5">
                      <div className="font-black text-slate-800 uppercase italic leading-tight text-sm tracking-tighter">
                        {item.user?.name || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest">
                        NIM: {item.user?.nim_nip}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        {item.details?.map((detail, idx) => (
                          <div key={idx} className="bg-slate-100/50 px-2 py-1 rounded border border-slate-200">
                            <span className="font-black text-slate-700 text-[10px] uppercase">{detail.alat?.nama_alat}</span>
                            <span className="text-[8px] text-indigo-500 font-black ml-2">TAG: {detail.alat?.kode_tag}</span>
                          </div>
                        ))}
                        <div className="mt-1 text-[10px] text-slate-400 font-bold italic line-clamp-1">"{item.tujuan_penggunaan}"</div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col gap-1.5 min-w-[170px]">
                        {/* Waktu Pinjam = Saat alat benar-benar diambil */}
                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                          <i className="bi bi-box-arrow-in-right"></i> PINJAM: {formatWaktu(item.waktu_pinjam)}
                        </div>
                        {/* Waktu Kembali = Saat alat dikembalikan */}
                        <div className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1">
                          <i className="bi bi-box-arrow-left"></i> KEMBALI: {formatWaktu(item.waktu_kembali)}
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        {[{ label: 'Before', path: item.foto_before }, { label: 'After', path: item.foto_after }].map((img, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-[7px] font-black text-slate-400 uppercase">{img.label}</span>
                            {getImageUrl(img.path) ? (
                              <button onClick={() => setSelectedImg(getImageUrl(img.path)!)} className="w-10 h-10 rounded-lg border-2 border-slate-100 overflow-hidden shadow-sm hover:border-indigo-400 transition-all active:scale-90">
                                <img src={getImageUrl(img.path)!} className="w-full h-full object-cover" alt={img.label} />
                              </button>
                            ) : <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200 text-slate-200"><i className="bi bi-camera"></i></div>}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex flex-col gap-1.5 items-end">
                        <div className="flex items-center gap-2">
                           {item.penerima && (
                             <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-tighter bg-slate-50 px-2 py-1 rounded-lg border">
                               Staff: {item.penerima.name.split(' ')[0]}
                             </span>
                           )}
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border-b-2 shadow-sm ${
                            item.status === 'returned' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                            item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {item.status === 'rejected' && item.alasan_penolakan && (
                          <div className="bg-red-50 p-2 rounded-xl border border-red-100 max-w-[150px] animate-in slide-in-from-top-1">
                            <p className="text-[7px] font-black text-red-400 uppercase text-right">Alasan Penolakan:</p>
                            <p className="text-[10px] font-bold text-red-800 italic leading-tight text-right">"{item.alasan_penolakan}"</p>
                          </div>
                        )}

                        {item.kondisi_kembali && (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            item.kondisi_kembali === 'rusak' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
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

      {selectedImg && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] animate-in fade-in" onClick={() => setSelectedImg(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors active:scale-90"><i className="bi bi-x-circle text-5xl"></i></button>
          <img src={selectedImg} className="max-w-full max-h-[85vh] object-contain rounded-[2.5rem] shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300" alt="Zoom" onClick={(e) => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-gradient-to-br from-${color === 'blue' ? 'blue' : color === 'emerald' ? 'emerald' : color === 'red' ? 'red' : 'amber'}-50 to-white border rounded-[1.5rem] p-5 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-amber-500'}`}>
        <i className={`bi ${icon} text-xl`}></i>
      </div>
    </div>
  </div>
);

const LoadingRow = () => (
  <tr><td colSpan={6} className="p-20 text-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest">Sinkronisasi Audit Log...</p>
    </div>
  </td></tr>
);

const EmptyRow = () => (
  <tr><td colSpan={6} className="p-20 text-center opacity-30">
    <div className="flex flex-col items-center">
      <i className="bi bi-clipboard-x text-6xl text-slate-400 mb-4"></i>
      <h3 className="text-sm font-black uppercase tracking-[0.3em]">Riwayat Kosong</h3>
    </div>
  </td></tr>
);

export default RiwayatPeminjaman;