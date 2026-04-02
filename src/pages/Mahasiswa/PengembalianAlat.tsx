import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";

export default function PengembalianAlat() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{ [key: number]: { file: File | null, kondisi: string, catatan: string } }>({});

  const fetchActiveLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/mahasiswa/riwayat-saya");
      
      const rawData = res.data.data || [];
      const ongoing = rawData.filter((item: any) => item.status === 'ongoing');
      setActiveLoans(ongoing);
    } catch (err) {
      console.error("Gagal mengambil data pinjaman");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveLoans();
  }, [fetchActiveLoans]);

  const handleInputChange = (id: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { file: null, kondisi: 'baik', catatan: '' }),
        [field]: value
      }
    }));
  };

  const handleReturn = async (id: number) => {
    const data = formData[id];
    
    if (!data?.file) return alert("⚠️ Wajib upload foto bukti pengembalian!");
    if (data.kondisi === 'rusak' && !data.catatan.trim()) {
      return alert("⚠️ Catatan wajib diisi jika kondisi alat Rusak.");
    }

    setSubmittingId(id);
    const body = new FormData();
    body.append("foto_after", data.file);
    body.append("kondisi_kembali", data.kondisi);
    body.append("deskripsi_kerusakan", data.catatan);

    try {
      await api.post(`/peminjaman/${id}/kembalikan`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Alat berhasil dikembalikan! Terima kasih.");
      fetchActiveLoans(); 
    } catch (err) {
      alert("❌ Gagal memproses pengembalian.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Statistik
  const stats = useMemo(() => {
    const total = activeLoans.length;
    const totalAlat = activeLoans.reduce((sum: number, item: any) => 
      sum + (item.details?.length || 0), 0
    );
    
    return { total, totalAlat };
  }, [activeLoans]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <SectionHeader
        title="Pengembalian Alat"
        description="Kembalikan alat laboratorium yang telah Anda pinjam dengan dokumentasi lengkap"
      />

      {/* STATISTICS CARDS */}
      {!loading && activeLoans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Transaksi Aktif</p>
                <p className="text-2xl font-black text-indigo-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <i className="bi bi-receipt text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Total Alat Dipinjam</p>
                <p className="text-2xl font-black text-purple-900 mt-1">{stats.totalAlat}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <i className="bi bi-box-seam text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-3xl border-2 border-slate-100">
           <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
           <p className="text-slate-400 font-semibold text-sm">Memuat data peminjaman...</p>
        </div>
      ) : activeLoans.length === 0 ? (
        <div className="text-center py-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-emoji-smile text-4xl text-emerald-500"></i>
          </div>
          <h3 className="text-xl font-black text-slate-400 mb-2">Tidak Ada Alat Yang Perlu Dikembalikan</h3>
          <p className="text-sm text-slate-500">Semua peminjaman Anda sudah diselesaikan</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeLoans.map((item: any) => (
            <div key={item.id} className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden">
              
              <div className="flex flex-col lg:flex-row">
                
                {/* SISI KIRI: DETAIL ALAT */}
                <div className="lg:w-1/2 p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  {/* HEADER INFO */}
                  <div className="flex justify-between items-start mb-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 rounded-xl">
                       <i className="bi bi-hash text-xs"></i>
                       <span className="text-xs font-bold">{item.id}</span>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-slate-400 mb-1">Diambil Pada</p>
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                         <i className="bi bi-calendar-check text-indigo-400 text-sm"></i>
                         <span className="text-xs font-bold text-white">
                           {new Date(item.tanggal_diambil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* LAB & PURPOSE */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-black mb-2">{item.ruangan_lab}</h3>
                    <p className="text-sm text-indigo-300 italic">
                      <i className="bi bi-quote text-indigo-400"></i> {item.tujuan_penggunaan}
                    </p>
                  </div>

                  {/* ITEMS LIST */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Daftar Alat:</p>
                    {item.details?.map((det: any) => (
                      <div key={det.id} className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full group-hover:scale-125 transition-transform"></div>
                          <span className="font-semibold text-white">{det.alat?.nama_alat}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-lg">
                          <i className="bi bi-x text-indigo-300 text-sm"></i>
                          <span className="font-bold text-indigo-300">{det.jumlah_pinjam}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SISI KANAN: FORM UPLOAD */}
                <div className="lg:w-1/2 p-8 space-y-6 bg-slate-50">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
                      <span>Foto Kondisi Pengembalian</span>
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                      <input 
                        type="file" 
                        onChange={(e) => handleInputChange(item.id, 'file', e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept="image/*"
                      />
                      <div className="text-center pointer-events-none">
                        {formData[item.id]?.file ? (
                          <>
                            <i className="bi bi-check-circle-fill text-4xl text-emerald-500 mb-2 block"></i>
                            <p className="text-sm font-bold text-emerald-600">{formData[item.id]?.file?.name}</p>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-upload text-4xl text-slate-400 group-hover:text-indigo-500 mb-2 block transition-colors"></i>
                            <p className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                              Klik atau drag foto disini
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 2MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
                        <span>Kondisi Alat</span>
                      </label>
                      <select 
                        onChange={(e) => handleInputChange(item.id, 'kondisi', e.target.value)}
                        className="w-full bg-white p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      >
                        <option value="baik">✅ Baik (Normal)</option>
                        <option value="rusak">⚠️ Rusak / Hilang</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black">3</div>
                        <span>Catatan</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="Contoh: Aman, tidak ada masalah"
                        onChange={(e) => handleInputChange(item.id, 'catatan', e.target.value)}
                        className="w-full bg-white p-3 rounded-xl border-2 border-slate-200 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {formData[item.id]?.kondisi === 'rusak' && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <i className="bi bi-exclamation-triangle-fill text-red-600 text-xl mt-0.5"></i>
                        <div>
                          <p className="text-sm font-bold text-red-900 mb-1">Perhatian!</p>
                          <p className="text-xs text-red-700">Anda melaporkan kondisi rusak. Catatan wajib diisi dengan detail kerusakan.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => handleReturn(item.id)}
                    disabled={submittingId === item.id}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submittingId === item.id ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill text-xl"></i>
                        <span>Konfirmasi Pengembalian</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}