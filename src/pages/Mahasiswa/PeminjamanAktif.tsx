import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Webcam from "react-webcam";
import api from "../../api/axios";
import DetailPeminjamanModal from './DetailPeminjamanModal';
import { SectionHeader } from "../../components/molecules/SectionHeader";
import Swal from 'sweetalert2'; // Menggunakan Swal agar konsisten dengan PenggunaanRuang

export default function PeminjamanAktif() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  // Kamera States & Refs
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

  // Fungsi Capture & Upload (Disamakan logikanya dengan PenggunaanRuang)
  const handleCapture = useCallback(async (id: number) => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
        return Swal.fire('Error', 'Gagal mengambil gambar dari webcam!', 'error');
    }

    try {
      setUploading(id);
      
      // Mengonversi Base64 ke File (Blob) agar bisa diterima Backend Laravel
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], `checkin_${id}_${Date.now()}.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("foto_before", file);

      await api.post(`/peminjaman/${id}/upload-before`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire('Berhasil!', '✅ Check-in berhasil! Alat kini dalam status Berlangsung.', 'success');
      setActiveCameraId(null);
      fetchMyLoans(); 
    } catch (err: any) {
      const msg = err.response?.data?.message || "Terjadi kesalahan server saat aktivasi.";
      Swal.fire('Gagal!', '❌ ' + msg, 'error');
    } finally {
      setUploading(null);
    }
  }, [webcamRef, fetchMyLoans]);

  const stats = useMemo(() => {
    const pemesanan = list.filter(item => item.jenis_peminjaman === 'pesanan' && item.status !== 'ongoing').length;
    const berlangsung = list.filter(item => item.status === 'ongoing').length;
    const pending = list.filter(item => item.status === 'pending').length;
    
    return { total: list.length, pemesanan, berlangsung, pending };
  }, [list]);

  const getStatusBadge = (item: any) => {
    if (item.status === 'booking' && item.jenis_peminjaman === 'pesanan') {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bi-box-seam-fill', label: 'Siap Diambil' };
    }
    switch (item.status) {
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bi-clock-history', label: 'Menunggu Persetujuan' };
      case 'ongoing': return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bi-hourglass-split', label: 'Sedang Digunakan' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'bi-info-circle', label: item.status };
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 pb-20">
      <SectionHeader title="Peminjaman Aktif" description="Lakukan check-in dengan memotret alat saat pengambilan di Laboratorium" />

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-black text-amber-500 uppercase italic">Menunggu Approval</p>
          <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase italic">Siap Diambil (Booking)</p>
          <p className="text-3xl font-black text-slate-900">{stats.pemesanan}</p>
        </div>
        <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-black text-indigo-500 uppercase italic">Berlangsung (Ongoing)</p>
          <p className="text-3xl font-black text-slate-900">{stats.berlangsung}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse italic text-slate-400 font-bold tracking-widest uppercase text-xs">Menyinkronkan Sesi...</div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => {
            const badge = getStatusBadge(item);
            const isBookingReady = item.status === 'booking' && item.jenis_peminjaman === 'pesanan';
            const isCameraOpen = activeCameraId === item.id;

            return (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border-2 border-slate-100 p-6 transition-all hover:border-indigo-300 shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
                  
                  {/* INFO ALAT */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text} ${badge.border}`}>
                        <i className={`bi ${badge.icon} mr-2`}></i>{badge.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">ID: #{item.id}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{item.ruangan_lab}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                         <i className="bi bi-calendar-check"></i> 
                         {item.waktu_mulai ? new Date(item.waktu_mulai).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Sekarang'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.details?.map((det: any) => (
                        <div key={det.id} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600">
                          {det.alat?.nama_alat} <span className="text-indigo-600 ml-1">x{det.jumlah_pinjam}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTION AREA (SAMA DENGAN PENGGUNAAN RUANG) */}
                  <div className="flex flex-col justify-center items-end min-w-[300px]">
                    {isBookingReady ? (
                      <div className="w-full space-y-3">
                        {!isCameraOpen ? (
                          <>
                            <div className="text-right mb-2">
                              <p className="text-[10px] font-black text-emerald-600 uppercase italic">Konfirmasi Pengambilan:</p>
                              <p className="text-[9px] font-bold text-slate-400 leading-tight">Gunakan kamera untuk bukti pengambilan alat.</p>
                            </div>
                            <button 
                              onClick={() => setActiveCameraId(item.id)}
                              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl"
                            >
                              <i className="bi bi-camera-fill text-lg"></i> Buka Kamera
                            </button>
                          </>
                        ) : (
                          /* UI KAMERA MIRIP PENGGUNAAN RUANG */
                          <div className="relative w-full h-56 rounded-[2rem] overflow-hidden bg-black shadow-inner border-2 border-indigo-500 animate-in zoom-in-95 duration-300">
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: "environment" }}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                              <button 
                                type="button" 
                                onClick={() => setActiveCameraId(null)} 
                                className="bg-red-500 text-white p-2 px-4 rounded-full text-[9px] font-black uppercase shadow-lg"
                              >
                                Batal
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleCapture(item.id)} 
                                disabled={uploading === item.id}
                                className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-[9px] uppercase shadow-lg border-b-2 border-slate-300 active:scale-95 disabled:opacity-50"
                              >
                                {uploading === item.id ? 'Memproses...' : 'Jepret & Aktifkan'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-right">
                         <button 
                          onClick={() => { setSelectedData(item); setIsModalOpen(true); }}
                          className="group/btn flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all"
                         >
                           Lihat Detail <i className="bi bi-arrow-right transition-transform group-hover/btn:translate-x-1"></i>
                         </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar visual */}
                <div className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ${item.status === 'ongoing' ? 'w-full bg-indigo-500' : 'w-1/3 bg-amber-400'}`}></div>
              </div>
            );
          })}
        </div>
      )}

      <DetailPeminjamanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedData} />
    </div>
  );
}