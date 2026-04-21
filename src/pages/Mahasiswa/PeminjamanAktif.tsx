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
      
      // Filter hanya peminjaman yang belum selesai/ditolak
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

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Check-in berhasil! Alat kini dalam status AKTIF.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
      
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
    switch (item.status) {
      case 'booking': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bi-calendar-check', label: 'SIAP DIAMBIL' };
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bi-clock-history', label: 'MENUNGGU' };
      case 'ongoing': return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bi-play-circle', label: 'AKTIF' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'bi-info-circle', label: item.status };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SectionHeader 
        title="Status Peminjaman Aktif" 
        description="Pantau status dan lakukan aktivasi alat yang sudah disetujui staff"
      />

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
        <StatCard title="Total Aktif" value={stats.total} icon="bi-stack" color="blue" />
        <StatCard title="Menunggu" value={stats.pending} icon="bi-clock-history" color="amber" />
        <StatCard title="Siap Ambil" value={stats.pemesanan} icon="bi-calendar-check" color="emerald" />
        <StatCard title="Berlangsung" value={stats.berlangsung} icon="bi-play-circle-fill" color="indigo" />
      </div>

      {loading ? (
        <div className="py-32 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Menyinkronkan data...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="bi bi-inbox text-4xl text-slate-300"></i>
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-widest">Antrean Kosong</h3>
            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">Tidak ada peminjaman yang sedang aktif saat ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {list.map((item) => {
            const badge = getStatusBadge(item);
            const isBooking = item.status === 'booking';
            const isCameraOpen = activeCameraId === item.id;

            return (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 transition-all hover:border-indigo-300 shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                  
                  {/* LEFT: INFO PINJAM */}
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text} ${badge.border}`}>
                        <i className={`bi ${badge.icon} mr-2`}></i>{badge.label}
                      </span>

                      {/* INFO STAFF */}
                      {item.penerima && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <i className="bi bi-person-badge text-slate-400 text-[10px]"></i>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">
                            By: {item.penerima.name.split(' ')[0]}
                          </span>
                        </div>
                      )}

                      <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-slate-200">
                        ID: #{item.id}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-none mb-2">
                        {item.ruangan_lab}
                      </h3>
                      <div className="inline-flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                         <i className="bi bi-calendar3"></i> 
                         {item.waktu_mulai ? new Date(item.waktu_mulai).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Langsung'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.details?.map((det: any) => (
                        <div key={det.id} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                            {det.alat?.nama_alat}
                          </span>
                          <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 rounded-lg">
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
                                <p className="text-[10px] font-black text-emerald-600 uppercase italic tracking-widest">Booking Terkonfirmasi!</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-1 leading-tight">Silakan ambil alat dan ambil foto check-in di depan staff.</p>
                             </div>
                             <button 
                                onClick={() => setActiveCameraId(item.id)}
                                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-slate-900 text-white py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 active:scale-95"
                             >
                               <i className="bi bi-camera-fill text-lg"></i> Check-In Sekarang
                             </button>
                          </div>
                        ) : (
                          <div className="relative w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border-4 border-indigo-500 animate-in zoom-in-95">
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: "environment" }}
                              className="w-full h-56 object-cover"
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                              <button 
                                onClick={() => setActiveCameraId(null)} 
                                className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-white/20 hover:bg-red-600 transition-colors"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => handleCapture(item.id)} 
                                disabled={uploading === item.id}
                                className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-[9px] uppercase shadow-lg active:scale-95 disabled:opacity-50"
                              >
                                {uploading === item.id ? 'Mengupload...' : 'Ambil Foto Alat'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setSelectedData(item); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200"
                      >
                         Lihat Detail <i className="bi bi-arrow-right text-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* PROGRESS BAR ANIMATION */}
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

const StatCard = ({ title, value, icon, color }: any) => {
    const colors: any = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-900 shadow-blue-200 bg-blue-500',
      amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-600 text-amber-900 shadow-amber-200 bg-amber-500',
      emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600 text-emerald-900 shadow-emerald-200 bg-emerald-500',
      indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-600 text-indigo-900 shadow-indigo-200 bg-indigo-500',
    };
    const c = colors[color].split(' ');
    
    return (
      <div className={`bg-gradient-to-br ${c[0]} ${c[1]} border ${c[2]} rounded-[1.5rem] p-5 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-black ${c[3]} uppercase tracking-widest mb-1 italic`}>{title}</p>
            <p className={`text-3xl font-black ${c[4]}`}>{value}</p>
          </div>
          <div className={`w-12 h-12 ${c[6]} rounded-2xl flex items-center justify-center text-white shadow-lg ${c[5]}`}>
            <i className={`bi ${icon} text-xl`}></i>
          </div>
        </div>
      </div>
    );
};