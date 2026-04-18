import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Webcam from "react-webcam";
import api from "../../api/axios";
import DetailPeminjamanModal from './DetailPeminjamanModal';
import { SectionHeader } from "../../components/molecules/SectionHeader";
import Swal from 'sweetalert2';

export default function PeminjamanAktif() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const webcamRef = useRef<Webcam>(null);
  const [activeCameraId, setActiveCameraId] = useState<number | null>(null);

  const fetchMyLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/mahasiswa/riwayat-saya");
      const responseData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const activeLoans = responseData.filter((item: any) => 
        ['pending', 'booking', 'ongoing'].includes(item.status)
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

  const handleCapture = useCallback(async (id: number) => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return Swal.fire('Error', 'Gagal mengambil gambar!', 'error');

    try {
      setUploading(id);
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], `checkin_${id}.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("foto_before", file);

      await api.post(`/peminjaman/${id}/upload-before`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire('Berhasil!', 'Check-in berhasil! Alat kini dalam status Berlangsung.', 'success');
      setActiveCameraId(null);
      fetchMyLoans(); 
    } catch (err: any) {
      Swal.fire('Gagal!', err.response?.data?.message || "Terjadi kesalahan.", 'error');
    } finally {
      setUploading(null);
    }
  }, [webcamRef, fetchMyLoans]);

  const stats = useMemo(() => {
    const pemesanan = list.filter(item => item.status === 'booking').length;
    const berlangsung = list.filter(item => item.status === 'ongoing').length;
    const pending = list.filter(item => item.status === 'pending').length;
    return { total: list.length, pemesanan, berlangsung, pending };
  }, [list]);

  const getStatusBadge = (item: any) => {
    if (item.status === 'booking') {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bi-calendar-check', label: 'SIAP DIAMBIL' };
    }
    switch (item.status) {
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bi-clock-history', label: 'MENUNGGU' };
      case 'ongoing': return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bi-hourglass-split', label: 'SEDANG DIPINJAM' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'bi-info-circle', label: item.status };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SectionHeader 
        title="Status Peminjaman Aktif" 
        description="Pantau pengajuan dan lakukan check-in kamera untuk mengaktifkan peminjaman"
      />

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Aktif</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="bi bi-stack text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Menunggu</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
              <i className="bi bi-clock-history text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Siap Ambil</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{stats.pemesanan}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <i className="bi bi-calendar-check text-white text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Berlangsung</p>
              <p className="text-2xl font-black text-indigo-900 mt-1">{stats.berlangsung}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
              <i className="bi bi-play-circle-fill text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyinkronkan data...</p>
        </div>
      ) : list.length === 0 ? (
        /* EMPTY STATE - BELUM ADA PEMINJAMAN */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="bi bi-inbox text-4xl text-slate-300"></i>
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-widest">Belum Ada Peminjaman Aktif</h3>
            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-tight">Silakan ajukan peminjaman alat di menu Peminjaman</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {list.map((item) => {
            const badge = getStatusBadge(item);
            const isBooking = item.status === 'booking';
            const isCameraOpen = activeCameraId === item.id;

            return (
              <div key={item.id} className="group bg-white rounded-[2rem] border-2 border-slate-100 p-8 transition-all hover:border-blue-300 shadow-sm relative overflow-hidden active:scale-[0.99]">
                <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                  
                  {/* LEFT: INFO PINJAM */}
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text} ${badge.border}`}>
                        <i className={`bi ${badge.icon} mr-2`}></i>{badge.label}
                      </span>
                      <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest">
                        ID: #{item.id}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-none mb-2">
                        {item.ruangan_lab}
                      </h3>
                      <div className="inline-flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                         <i className="bi bi-calendar3"></i> 
                         {item.waktu_mulai ? new Date(item.waktu_mulai).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Langsung'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.details?.map((det: any) => (
                        <div key={det.id} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                            {det.alat?.nama_alat}
                          </span>
                          <span className="text-xs font-black text-blue-600">
                            ×{det.jumlah_pinjam}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: CAMERA / DETAIL ACTION */}
                  <div className="flex flex-col justify-center items-end min-w-[320px]">
                    {isBooking ? (
                      <div className="w-full">
                        {!isCameraOpen ? (
                          <div className="space-y-4 w-full">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-600 uppercase italic">Siap Diambil!</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-1 leading-tight">Gunakan kamera di depan petugas untuk aktifkan alat.</p>
                             </div>
                             <button 
                                onClick={() => setActiveCameraId(item.id)}
                                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white py-4 px-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
                             >
                               <i className="bi bi-camera-fill text-lg"></i> Ambil Foto & Check-In
                             </button>
                          </div>
                        ) : (
                          <div className="relative w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border-2 border-blue-500 animate-in zoom-in-95">
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: "environment" }}
                              className="w-full h-56 object-cover"
                            />
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                              <button 
                                onClick={() => setActiveCameraId(null)} 
                                className="bg-red-500 text-white p-2 px-4 rounded-full text-[9px] font-black uppercase"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => handleCapture(item.id)} 
                                disabled={uploading === item.id}
                                className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-[9px] uppercase shadow-lg active:scale-95 disabled:opacity-50"
                              >
                                {uploading === item.id ? 'Memproses...' : 'Jepret Alat'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setSelectedData(item); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-3 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                         Detail Peminjaman <i className="bi bi-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={`absolute bottom-0 left-0 h-2 transition-all duration-1000 ${item.status === 'ongoing' ? 'w-full bg-indigo-500' : 'w-1/3 bg-amber-400'}`}></div>
              </div>
            );
          })}
        </div>
      )}

      <DetailPeminjamanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedData} />
    </div>
  );
}