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
  status: 'pending' | 'approved' | 'ongoing' | 'returned' | 'rejected';
  waktu_pinjam: string;
  created_at: string;
  foto_before: string | null;
  details: PeminjamanDetail[];
}

const RiwayatSaya: React.FC = () => {
  const [data, setData] = useState<MyRiwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const fetchMyRiwayat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/mahasiswa/riwayat-saya');
      const result = response.data.data || [];
      setData(result);
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

  const handleFileChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert("⚠️ Ukuran file terlalu besar! Maksimal 2MB.");
    }

    const formData = new FormData();
    formData.append('foto_before', file);

    try {
      setIsUploading(id);
      const response = await api.post(`/peminjaman/${id}/upload-before`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("✅ " + (response.data.message || "Berhasil mengunggah foto!"));
      fetchMyRiwayat(); 
    } catch (error: any) {
      alert("❌ " + (error.response?.data?.message || "Gagal mengunggah foto."));
    } finally {
      setIsUploading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': 
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-700', 
          border: 'border-amber-200',
          icon: 'bi-clock-history',
          label: 'Menunggu'
        };
      case 'approved': 
        return { 
          bg: 'bg-blue-50', 
          text: 'text-blue-700', 
          border: 'border-blue-200',
          icon: 'bi-check-circle-fill',
          label: 'Disetujui'
        };
      case 'ongoing': 
        return { 
          bg: 'bg-indigo-50', 
          text: 'text-indigo-700', 
          border: 'border-indigo-200',
          icon: 'bi-hourglass-split',
          label: 'Berlangsung'
        };
      case 'returned': 
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          border: 'border-emerald-200',
          icon: 'bi-check-all',
          label: 'Selesai'
        };
      case 'rejected': 
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: 'bi-x-circle-fill',
          label: 'Ditolak'
        };
      default: 
        return { 
          bg: 'bg-slate-50', 
          text: 'text-slate-700', 
          border: 'border-slate-200',
          icon: 'bi-question-circle',
          label: status
        };
    }
  };

  // Statistik
  const stats = useMemo(() => {
    const total = data.length;
    const pending = data.filter(item => item.status === 'pending').length;
    const ongoing = data.filter(item => item.status === 'ongoing').length;
    const returned = data.filter(item => item.status === 'returned').length;
    
    return { total, pending, ongoing, returned };
  }, [data]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <SectionHeader
        title="Riwayat Peminjaman"
        description="Pantau semua aktivitas peminjaman alat laboratorium Anda"
        rightElement={
          <button 
            onClick={() => fetchMyRiwayat()} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all font-semibold text-sm"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>REFRESH</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Riwayat</p>
                <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="bi bi-clock-history text-white text-xl"></i>
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
                <i className="bi bi-hourglass-split text-white text-xl"></i>
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

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Selesai</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{stats.returned}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <i className="bi bi-check-circle-fill text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-3xl border-2 border-slate-100">
           <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
           <p className="text-slate-400 font-semibold text-sm">Memuat riwayat peminjaman...</p>
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {data.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            
            return (
              <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 transition-all hover:shadow-xl hover:border-indigo-300 group">
                
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* LEFT SECTION */}
                  <div className="flex-1 space-y-4">
                    {/* BADGES */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-full">
                        <i className="bi bi-hash text-xs"></i>
                        <span className="text-xs font-bold">{item.id}</span>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <i className={`bi ${statusConfig.icon} text-xs`}></i>
                        <span className="text-xs font-bold">{statusConfig.label}</span>
                      </div>
                    </div>

                    {/* LAB & PURPOSE */}
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {item.ruangan_lab}
                      </h3>
                      <p className="text-sm text-slate-600 italic">
                        <i className="bi bi-quote text-slate-400"></i> {item.tujuan_penggunaan}
                      </p>
                    </div>
                    
                    {/* ITEMS LIST */}
                    <div className="flex flex-wrap gap-2">
                      {item.details.map((det) => (
                        <div key={det.id} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-200 transition-all">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-xs font-semibold text-slate-700">
                            {det.alat?.nama_alat}
                          </span>
                          <span className="text-xs font-black text-indigo-600">
                            ×{det.jumlah_pinjam}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="flex flex-col justify-between items-end min-w-[200px] space-y-4">
                    {/* DATE */}
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Diajukan Pada</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                        <i className="bi bi-calendar-event text-slate-600"></i>
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(item.created_at || item.waktu_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* ACTION AREA */}
                    <div className="w-full">
                      {item.status === 'approved' && (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`upload-history-${item.id}`}
                            onChange={(e) => handleFileChange(item.id, e)}
                            disabled={isUploading === item.id}
                          />
                          <label
                            htmlFor={`upload-history-${item.id}`}
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer ${isUploading === item.id ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {isUploading === item.id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-camera-fill text-lg"></i>
                                <span>Ambil & Foto</span>
                              </>
                            )}
                          </label>
                        </div>
                      )}

                      {item.status === 'pending' && (
                        <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center justify-center gap-2 text-amber-700">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <p className="text-xs font-bold">Menunggu Persetujuan</p>
                          </div>
                        </div>
                      )}

                      {item.status === 'ongoing' && (
                        <div className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="bi bi-hourglass-split text-indigo-600"></i>
                            <p className="text-xs font-bold text-indigo-900">Sedang Berlangsung</p>
                          </div>
                          <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                            <div className="w-1/2 h-full bg-indigo-500 animate-pulse"></div>
                          </div>
                        </div>
                      )}

                      {item.status === 'returned' && (
                        <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center justify-center gap-2 text-emerald-700">
                            <i className="bi bi-check-circle-fill"></i>
                            <p className="text-xs font-bold">Selesai Dikembalikan</p>
                          </div>
                        </div>
                      )}

                      {item.status === 'rejected' && (
                        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-center justify-center gap-2 text-red-700">
                            <i className="bi bi-x-circle-fill"></i>
                            <p className="text-xs font-bold">Ditolak</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-clipboard-x text-4xl text-slate-400"></i>
          </div>
          <h3 className="text-xl font-black text-slate-400 mb-2">Belum Ada Riwayat</h3>
          <p className="text-sm text-slate-500">Anda belum pernah melakukan peminjaman alat</p>
        </div>
      )}
    </div>
  );
};

export default RiwayatSaya;