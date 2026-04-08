import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";
import Webcam from "react-webcam";

export default function PengembalianAlat() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  
  // State Kamera
  const webcamRef = useRef<Webcam>(null);
  const [cameraActiveId, setCameraActiveId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{ [key: number]: { file: File | null, preview: string | null, kondisi: string, catatan: string } }>({});

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

  // Fungsi Ambil Foto (Sama dengan Peminjaman)
  const capture = useCallback((id: number) => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // 1. Convert Base64 ke File/Blob untuk dikirim ke Backend
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `return_photo_${id}.jpg`, { type: "image/jpeg" });
          
          setFormData(prev => ({
            ...prev,
            [id]: {
              ...(prev[id] || { kondisi: 'baik', catatan: '' }),
              file: file,
              preview: imageSrc // Simpan string base64 untuk preview di UI
            }
          }));
          setCameraActiveId(null); // Tutup kamera setelah jepret
        });
    }
  }, [webcamRef]);

  const handleInputChange = (id: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { file: null, preview: null, kondisi: 'baik', catatan: '' }),
        [field]: value
      }
    }));
  };

  const handleReturn = async (id: number) => {
    const data = formData[id];
    if (!data?.file) return alert("⚠️ Wajib ambil foto bukti pengembalian!");
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
      alert("✅ Alat berhasil dikembalikan!");
      fetchActiveLoans(); 
    } catch (err) {
      alert("❌ Gagal memproses pengembalian.");
    } finally {
      setSubmittingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = activeLoans.length;
    const totalAlat = activeLoans.reduce((sum: number, item: any) => sum + (item.details?.length || 0), 0);
    return { total, totalAlat };
  }, [activeLoans]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <SectionHeader title="Pengembalian Alat" description="Kembalikan alat laboratorium dengan dokumentasi foto kondisi terkini" />

      {/* STATS ... (tetap sama) */}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div><p>Memuat data...</p></div>
      ) : activeLoans.length === 0 ? (
        <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <i className="bi bi-emoji-smile text-4xl text-emerald-500 mb-4 block"></i>
          <h3 className="font-black text-slate-400 uppercase tracking-widest">Semua Aman!</h3>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeLoans.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                
                {/* INFO ALAT */}
                <div className="lg:w-1/2 p-8 bg-slate-900 text-white">
                  <div className="flex justify-between mb-6">
                    <span className="bg-indigo-600 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">ID: {item.id}</span>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Lab: {item.ruangan_lab}</span>
                  </div>
                  <h3 className="text-xl font-black mb-6 uppercase tracking-tight italic">Daftar Alat Yang Dipinjam:</h3>
                  <div className="space-y-3">
                    {item.details?.map((det: any) => (
                      <div key={det.id} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="font-bold">{det.alat?.nama_alat}</span>
                        <span className="text-indigo-400 font-black">x{det.jumlah_pinjam}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FORM PENGEMBALIAN */}
                <div className="lg:w-1/2 p-8 bg-white space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">1. Dokumentasi Kamera</label>
                    
                    {cameraActiveId === item.id ? (
                      // TAMPILAN LIVE KAMERA
                      <div className="relative w-full h-64 rounded-[2rem] overflow-hidden bg-black shadow-2xl border-2 border-indigo-500">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{ facingMode: "environment" }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                          <button onClick={() => setCameraActiveId(null)} className="p-3 bg-red-500 text-white rounded-full"><i className="bi bi-x-lg"></i></button>
                          <button onClick={() => capture(item.id)} className="px-6 py-2 bg-white text-slate-900 font-black rounded-full uppercase text-[10px] tracking-widest shadow-lg">Ambil Foto</button>
                        </div>
                      </div>
                    ) : (
                      // PREVIEW ATAU TOMBOL BUKA KAMERA
                      <div 
                        onClick={() => setCameraActiveId(item.id)}
                        className="w-full h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/50 transition-all overflow-hidden"
                      >
                        {formData[item.id]?.preview ? (
                          <img src={formData[item.id].preview!} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <>
                            <i className="bi bi-camera-fill text-3xl text-indigo-500 mb-2"></i>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Klik Untuk Foto Alat</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">2. Kondisi</label>
                      <select 
                        onChange={(e) => handleInputChange(item.id, 'kondisi', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 text-xs font-bold focus:border-indigo-500 outline-none"
                      >
                        <option value="baik">✅ BAIK</option>
                        <option value="rusak">⚠️ RUSAK</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">3. Catatan</label>
                      <input 
                        type="text"
                        placeholder="Misal: Aman"
                        onChange={(e) => handleInputChange(item.id, 'catatan', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleReturn(item.id)}
                    disabled={submittingId === item.id}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:bg-slate-300"
                  >
                    {submittingId === item.id ? "PROSES..." : "SELESAIKAN PENGEMBALIAN"}
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