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
  alasan_penolakan: string | null; 
  foto_before: string | null;
  foto_after: string | null;
  created_at: string; 
  updated_at: string;
  waktu_pinjam: string | null;
  waktu_kembali: string | null;
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
        title="Monitor Riwayat Peminjaman"
        description="Pantau seluruh jejak aktivitas penggunaan alat laboratorium oleh mahasiswa"
        rightElement={
          <button 
            onClick={fetchRiwayat} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-500 transition-all font-black text-[10px] tracking-widest shadow-sm active:scale-95"
          >
            <i className="bi bi-arrow-clockwise text-sm"></i>
            <span>REFRESH DATA</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
          <StatCard title="Total Masuk" value={stats.total} icon="bi-archive" color="blue" />
          <StatCard title="Selesai" value={stats.returned} icon="bi-check-circle-fill" color="emerald" />
          <StatCard title="Ditolak" value={stats.rejected} icon="bi-x-circle-fill" color="red" />
          <StatCard title="Kondisi Rusak" value={stats.rusak} icon="bi-exclamation-octagon-fill" color="amber" />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-20">ID</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Mahasiswa</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Alat & Tujuan</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Waktu</th>
                <th className="p-5 text-center text-[10px] font-black uppercase tracking-widest">Dokumentasi</th>
                <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest">Status & Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <LoadingRow />
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-5 text-center font-black text-slate-300 text-xs">#{item.id}</td>

                    <td className="p-5">
                      <div className="font-black text-slate-800 uppercase italic leading-tight text-sm tracking-tighter">
                        {item.nama_mahasiswa}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase">
                        NIM: {item.nim}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        {item.details?.map((detail, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                            <div className="font-black text-slate-700 text-[10px] uppercase">{detail.alat?.nama_alat}</div>
                            <div className="text-[8px] text-indigo-500 font-black uppercase tracking-tighter">TAG: {detail.alat?.kode_tag || '-'}</div>
                          </div>
                        ))}
                        <div className="mt-1 text-[10px] text-slate-400 font-bold italic leading-tight line-clamp-2 max-w-[180px]">
                           "{item.tujuan_penggunaan}"
                        </div>
                      </div>
                    </td>

                    <td className="p-5 text-[10px]">
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <span className="font-black text-emerald-600 uppercase tracking-tighter">
                          <i className="bi bi-box-arrow-in-right mr-1"></i> Pinjam: {formatWaktu(item.waktu_pinjam)}
                        </span>
                        <span className="font-black text-slate-400 uppercase tracking-tighter">
                          <i className="bi bi-box-arrow-left mr-1"></i> Kembali: {formatWaktu(item.waktu_kembali)}
                        </span>
                      </div>
                    </td>

                    <td className="p-5">
                      {item.status.toLowerCase() !== 'rejected' ? (
                        <div className="flex justify-center gap-3">
                          {[
                            { label: 'Before', path: item.foto_before },
                            { label: 'After', path: item.foto_after }
                          ].map((img, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <span className="text-[7px] font-black text-slate-400 uppercase">{img.label}</span>
                              {getImageUrl(img.path) ? (
                                <button 
                                  onClick={() => setSelectedImg(getImageUrl(img.path)!)}
                                  className="w-10 h-10 rounded-xl border-2 border-slate-100 overflow-hidden shadow-sm hover:border-indigo-400 transition-all"
                                >
                                  <img src={getImageUrl(img.path)!} className="w-full h-full object-cover" alt={img.label} />
                                </button>
                              ) : <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 text-slate-200"><i className="bi bi-camera"></i></div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center italic text-red-200 font-black text-[9px] uppercase">Dibatalkan</div>
                      )}
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                           {/* Info Staff yang approve/reject */}
                           {item.penerima && (
                             <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-tighter bg-slate-50 px-2 py-1 rounded-lg">
                               By: {item.penerima.name.split(' ')[0]}
                             </span>
                           )}
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border-b-2 shadow-sm ${
                            item.status === 'returned' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                            item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 
                            'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/**/}
                        {item.status.toLowerCase() === 'rejected' && item.alasan_penolakan && (
                          <div className="mt-1 bg-red-50 border border-red-100 p-2 rounded-xl max-w-[160px] shadow-sm animate-in slide-in-from-top-1">
                            <p className="text-[7px] font-black text-red-400 uppercase mb-0.5 tracking-tighter text-right">Alasan Penolakan:</p>
                            <p className="text-[10px] font-bold text-red-800 leading-tight italic text-right">
                              "{item.alasan_penolakan}"
                            </p>
                          </div>
                        )}

                        {item.kondisi_kembali && item.status === 'returned' && (
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

      {/* MODAL ZOOM */}
      {selectedImg && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] animate-in fade-in" 
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <i className="bi bi-x-circle text-5xl"></i>
          </button>
          <img src={selectedImg} className="max-w-full max-h-[85vh] object-contain rounded-[2.5rem] shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300" alt="Zoom" />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-900 bg-blue-500',
    emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600 text-emerald-900 bg-emerald-500',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600 text-red-900 bg-red-500',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-600 text-amber-900 bg-amber-500',
  };
  const c = colors[color].split(' ');

  return (
    <div className={`bg-gradient-to-br ${c[0]} ${c[1]} border ${c[2]} rounded-[1.5rem] p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-[10px] font-black ${c[3]} uppercase tracking-widest mb-1 italic`}>{title}</p>
          <p className={`text-3xl font-black ${c[4]}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${c[5]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          <i className={`bi ${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

const LoadingRow = () => (
  <tr>
    <td colSpan={6} className="p-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        <p className="text-slate-400 font-black uppercase italic text-xs tracking-widest tracking-tighter">Mengkonsolidasi Data...</p>
      </div>
    </td>
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={6} className="p-20 text-center opacity-30 animate-in zoom-in-95">
      <div className="flex flex-col items-center">
        <i className="bi bi-clipboard-x text-5xl text-slate-400 mb-4"></i>
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Data Tidak Ditemukan</h3>
      </div>
    </td>
  </tr>
);

export default RiwayatPeminjamanDosen;