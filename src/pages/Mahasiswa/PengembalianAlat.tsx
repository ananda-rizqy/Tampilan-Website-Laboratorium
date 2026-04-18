import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";
import Webcam from "react-webcam";
import Swal from 'sweetalert2';

export default function PengembalianAlat() {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const [cameraActiveId, setCameraActiveId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{ [key: number]: { file: File | null, preview: string | null, kondisi: string, catatan: string } }>({});

  const fetchActiveLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/mahasiswa/riwayat-saya");
      const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
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

  const capture = useCallback((id: number) => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `return_${id}.jpg`, { type: "image/jpeg" });
          setFormData(prev => ({
            ...prev,
            [id]: { ...(prev[id] || { kondisi: 'baik', catatan: '' }), file, preview: imageSrc }
          }));
          setCameraActiveId(null);
        });
    }
  }, [webcamRef]);

  const handleReturn = async (id: number) => {
    const data = formData[id];
    if (!data?.file) return Swal.fire('Foto Wajib', 'Ambil foto bukti kondisi alat terlebih dahulu.', 'warning');

    try {
      setSubmittingId(id);
      const body = new FormData();
      body.append("foto_after", data.file);
      body.append("kondisi_kembali", data.kondisi || 'baik');
      body.append("deskripsi_kerusakan", data.catatan || '');

      await api.post(`/peminjaman/${id}/kembalikan`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire('Berhasil', 'Alat dikembalikan.', 'success');
      fetchActiveLoans(); 
    } catch (err: any) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses data.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <SectionHeader 
        title="Pengembalian Alat" 
        description="Daftar pinjaman aktif yang harus dikembalikan ke laboratorium" 
      />

      {loading ? (
        <div className="py-24 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-xs">Memuat Data Pinjaman...</div>
      ) : activeLoans.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="font-black text-slate-400 uppercase italic tracking-widest text-sm">Tidak ada alat yang perlu dikembalikan</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Informasi Pinjam</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Daftar Item</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Foto Kondisi</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Kondisi & Catatan</th>
                  <th className="p-5 text-center text-[10px] font-black uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* INFO PINJAM */}
                    <td className="p-5 align-top min-w-[180px]">
                      <span className="text-[10px] font-black text-indigo-600 block mb-1">ID: #{item.id}</span>
                      <p className="font-black text-slate-900 uppercase italic text-xs leading-none mb-2">{item.ruangan_lab}</p>
                      <p className="text-[9px] font-bold text-slate-400 leading-tight italic">"{item.tujuan_penggunaan}"</p>
                    </td>

                    {/* DAFTAR ITEM */}
                    <td className="p-5 align-top min-w-[200px]">
                      <div className="space-y-1">
                        {item.details?.map((det: any) => (
                          <div key={det.id} className="flex justify-between text-[10px] font-bold text-slate-600 border-b border-slate-50 pb-1">
                            <span className="uppercase">{det.alat?.nama_alat}</span>
                            <span className="text-indigo-600">x{det.jumlah_pinjam}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* FOTO KONDISI */}
                    <td className="p-5 align-top w-[200px]">
                      {cameraActiveId === item.id ? (
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-black border-2 border-indigo-500 shadow-lg">
                          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full h-full object-cover" />
                          <button onClick={() => capture(item.id)} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-xl">Jepret</button>
                        </div>
                      ) : (
                        <div onClick={() => setCameraActiveId(item.id)} className="w-40 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all overflow-hidden relative">
                          {formData[item.id]?.preview ? (
                            <img src={formData[item.id].preview!} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <>
                              <i className="bi bi-camera-fill text-xl text-indigo-400 mb-1"></i>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ambil Foto</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    {/* KONDISI & CATATAN */}
                    <td className="p-5 align-top min-w-[200px]">
                      <div className="space-y-3">
                        <select 
                          onChange={(e) => setFormData(p => ({ ...p, [item.id]: { ...(p[item.id] || {file:null,preview:null,catatan:''}), kondisi: e.target.value }}))}
                          className="w-full p-2.5 bg-slate-50 rounded-xl border-2 border-slate-100 text-[10px] font-black italic outline-none focus:border-indigo-500"
                        >
                          <option value="baik">✅ BAIK</option>
                          <option value="rusak">⚠️ RUSAK</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Catatan..." 
                          onChange={(e) => setFormData(p => ({ ...p, [item.id]: { ...(p[item.id] || {file:null,preview:null,kondisi:'baik'}), catatan: e.target.value }}))}
                          className="w-full p-2.5 bg-slate-50 rounded-xl border-2 border-slate-100 text-[10px] font-bold outline-none focus:border-indigo-500"
                        />
                      </div>
                    </td>

                    {/* AKSI */}
                    <td className="p-5 align-middle text-center">
                      <button 
                        onClick={() => handleReturn(item.id)}
                        disabled={submittingId === item.id}
                        className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-md active:scale-90 disabled:bg-slate-200"
                      >
                        {submittingId === item.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          <i className="bi bi-arrow-right-circle-fill text-xl"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}