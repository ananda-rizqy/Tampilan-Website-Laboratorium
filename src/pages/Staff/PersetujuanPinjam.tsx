import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";

export default function PersetujuanPinjam() {
  const [dataPinjam, setDataPinjam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const res = await api.get("/peminjaman/semua");
      setDataPinjam(Array.isArray(res.data) ? res.data : res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const handleSetujui = async (id: number) => {
    if (!confirm("✅ Setujui peminjaman ini? Stok alat akan otomatis berkurang.")) return;
    try {
      setProcessing(id);
      await api.post(`/peminjaman/${id}/setujui`);
      alert("✅ Peminjaman berhasil disetujui!");
      fetchPeminjaman();
    } catch (err: any) {
      alert("❌ " + (err.response?.data?.message || "Gagal menyetujui"));
    } finally {
      setProcessing(null);
    }
  };

  const handleTolak = async (id: number) => {
    const alasan = prompt("Masukkan alasan penolakan:");
    if (!alasan || !alasan.trim()) return;
    
    try {
      setProcessing(id);
      await api.post(`/peminjaman/${id}/tolak`, { alasan });
      alert("✅ Peminjaman berhasil ditolak!");
      fetchPeminjaman();
    } catch (err: any) {
      alert("❌ " + (err.response?.data?.message || "Gagal menolak"));
    } finally {
      setProcessing(null);
    }
  };

  // Statistik
  const stats = useMemo(() => {
    const total = dataPinjam.length;
    const pending = dataPinjam.filter((item: any) => item.status === 'pending').length;
    const approved = dataPinjam.filter((item: any) => item.status === 'approved').length;
    const ongoing = dataPinjam.filter((item: any) => item.status === 'ongoing').length;
    
    return { total, pending, approved, ongoing };
  }, [dataPinjam]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <SectionHeader 
        title="Persetujuan Peminjaman" 
        description="Kelola dan setujui pengajuan peminjaman alat dari mahasiswa"
        rightElement={
          <button 
            onClick={fetchPeminjaman} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all font-semibold text-sm"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      {!loading && dataPinjam.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Pengajuan</p>
                <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="bi bi-inbox text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Menunggu</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <i className="bi bi-clock-history text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Disetujui</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <i className="bi bi-check-circle-fill text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Berlangsung</p>
                <p className="text-2xl font-black text-indigo-900 mt-1">{stats.ongoing}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <i className="bi bi-arrow-repeat text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Mahasiswa</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Lab & Tujuan</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Daftar Alat</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                   <td colSpan={6} className="p-20 text-center">
                     <div className="flex flex-col items-center gap-4">
                       <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                       <p className="text-slate-400 font-semibold text-sm">Memuat data pengajuan...</p>
                     </div>
                   </td>
                </tr>
              ) : dataPinjam.length > 0 ? (
                dataPinjam.map((item: any) => (
                  <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                        <i className="bi bi-hash text-slate-600 text-xs"></i>
                        <span className="font-bold text-slate-700">{item.id}</span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.user?.name}</div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">{item.user?.nim_nip || '-'}</div>
                    </td>
                    
                    <td className="p-4">
                      <div className="font-bold text-indigo-600 text-sm">{item.ruangan_lab}</div>
                      <div className="text-xs text-slate-600 italic mt-1">
                        <i className="bi bi-quote text-slate-400"></i> {item.tujuan_penggunaan}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {item.details?.map((det: any) => (
                          <div key={det.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            <span className="font-semibold text-slate-700">{det.alat?.nama_alat}</span>
                            <span className="font-black text-indigo-600">×{det.jumlah_pinjam}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {item.status === 'pending' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold">Menunggu</span>
                        </div>
                      )}
                      {item.status === 'approved' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                          <i className="bi bi-check-circle-fill text-xs"></i>
                          <span className="text-xs font-bold">Disetujui</span>
                        </div>
                      )}
                      {item.status === 'ongoing' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                          <i className="bi bi-hourglass-split text-xs"></i>
                          <span className="text-xs font-bold">Berlangsung</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSetujui(item.id)}
                            disabled={processing === item.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg"
                          >
                            {processing === item.id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Proses...</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle-fill"></i>
                                <span>Setujui</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleTolak(item.id)}
                            disabled={processing === item.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg"
                          >
                            <i className="bi bi-x-circle-fill"></i>
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-slate-400 font-semibold">
                          Selesai
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-20">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <i className="bi bi-inbox text-4xl text-slate-300"></i>
                      </div>
                      <h3 className="text-xl font-black text-slate-400 mb-2">Tidak Ada Pengajuan</h3>
                      <p className="text-sm text-slate-500">Belum ada peminjaman yang menunggu persetujuan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}