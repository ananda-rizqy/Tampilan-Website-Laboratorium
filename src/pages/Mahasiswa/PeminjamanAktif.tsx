import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import DetailPeminjamanModal from './DetailPeminjamanModal';
import { SectionHeader } from "../../components/molecules/SectionHeader";

export default function PeminjamanAktif() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const fetchMyLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/mahasiswa/riwayat-saya");
      
      const responseData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const activeLoans = responseData.filter((item: any) => 
        ['pending', 'approved', 'ongoing'].includes(item.status)
      );

      setList(activeLoans);
    } catch (err) {
      console.error("Gagal mengambil data peminjaman", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchMyLoans(); 
  }, [fetchMyLoans]);

  const handleFileChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto_before", file);

    try {
      setUploading(id);
      await api.post(`/peminjaman/${id}/upload-before`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("✅ Foto berhasil diunggah! Status sekarang: Ongoing.");
      fetchMyLoans(); 
    } catch (err: any) {
      alert("❌ " + (err.response?.data?.message || "Gagal mengunggah foto. Pastikan ukuran file max 2MB."));
    } finally {
      setUploading(null);
    }
  };

  const handleCardClick = (item: any) => {
    setSelectedData(item);
    setIsModalOpen(true);
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
    const pending = list.filter(item => item.status === 'pending').length;
    const approved = list.filter(item => item.status === 'approved').length;
    const ongoing = list.filter(item => item.status === 'ongoing').length;
    
    return { total: list.length, pending, approved, ongoing };
  }, [list]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <SectionHeader
        title="Peminjaman Aktif"
        description="Kelola dan pantau status peminjaman alat laboratorium Anda"
      />

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Aktif</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="bi bi-card-checklist text-white text-xl"></i>
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
              <i className="bi bi-hourglass-split text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-3xl border-2 border-slate-100">
           <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
           <p className="text-slate-400 font-semibold text-sm">Memuat data peminjaman...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {list.length > 0 ? (
            list.map((item: any) => {
              const statusConfig = getStatusConfig(item.status);
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => handleCardClick(item)}
                  className="group bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 transition-all hover:shadow-xl hover:border-indigo-300 cursor-pointer relative overflow-hidden active:scale-[0.99]"
                >
                  {/* Gradient Background Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all pointer-events-none rounded-3xl"></div>
                  
                  <div className="relative flex flex-col lg:flex-row justify-between gap-6">
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
                        <h3 className="text-xl font-black text-slate-900 mb-1">
                          {item.ruangan_lab || 'Laboratorium'}
                        </h3>
                        <p className="text-sm text-slate-600 italic">
                          <i className="bi bi-quote text-slate-400"></i> {item.tujuan_penggunaan}
                        </p>
                      </div>
                      
                      {/* ITEMS LIST */}
                      <div className="flex flex-wrap gap-2">
                        {item.details?.map((det: any) => (
                          <div key={det.id} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
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
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTON */}
                      <div className="w-full" onClick={(e) => e.stopPropagation()}>
                        {item.status === 'approved' ? (
                          <label 
                            className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer ${uploading === item.id ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploading === item.id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Mengunggah...</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-camera-fill text-lg"></i>
                                <span>Ambil & Foto Alat</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileChange(item.id, e)}
                            />
                          </label>
                        ) : (
                          <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                            <span>Lihat Detail</span>
                            <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-clipboard-x text-4xl text-slate-400"></i>
              </div>
              <h3 className="text-xl font-black text-slate-400 mb-2">Tidak Ada Peminjaman Aktif</h3>
              <p className="text-sm text-slate-500">Semua peminjaman Anda sudah selesai atau belum ada pengajuan</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      <DetailPeminjamanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedData} 
      />
    </div>
  );
}