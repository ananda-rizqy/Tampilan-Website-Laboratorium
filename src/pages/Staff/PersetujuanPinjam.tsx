import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";
import Swal from 'sweetalert2';

export default function PersetujuanPinjam() {
  const [dataPinjam, setDataPinjam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchPeminjaman = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/peminjaman/semua");
      const responseData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setDataPinjam(responseData);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeminjaman();
  }, [fetchPeminjaman]);

  const handleSetujui = async (item: any) => {
    const isBooking = item.jenis_peminjaman === 'pesanan';
    
    const titleText = isBooking ? 'Setujui Pesanan (Booking)?' : 'Setujui Peminjaman Langsung?';
    const subText = isBooking 
      ? "Status akan menjadi BOOKING. Mahasiswa harus melakukan CHECK-IN saat mengambil alat nanti." 
      : "Status akan menjadi ONGOING. Peminjaman alat dinyatakan AKTIF mulai saat ini.";

    const result = await Swal.fire({
      title: titleText,
      text: subText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isBooking ? '#10b981' : '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: isBooking ? 'YA, SETUJU BOOKING' : 'YA, SETUJU LANGSUNG',
      cancelButtonText: 'BATAL',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        setProcessing(item.id);
        const res = await api.post(`/peminjaman/${item.id}/setujui`);
        
        await Swal.fire({
          title: 'Berhasil!',
          text: res.data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchPeminjaman();
      } catch (err: any) {
        Swal.fire(
          'Gagal!', 
          err.response?.data?.message || 'Terjadi kesalahan saat memproses data.', 
          'error'
        );
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleTolak = async (id: number) => {
    const { value: alasan } = await Swal.fire({
      title: 'Tolak Peminjaman',
      input: 'textarea',
      inputLabel: 'Alasan Penolakan',
      inputPlaceholder: 'Masukkan alasan...',
      inputAttributes: { 'aria-label': 'Masukkan alasan penolakan' },
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Tolak Pengajuan'
    });

    if (!alasan) return;

    try {
      setProcessing(id);
      await api.post(`/peminjaman/${id}/tolak`, { alasan });
      Swal.fire('Ditolak', 'Pengajuan peminjaman telah ditolak.', 'info');
      fetchPeminjaman();
    } catch (err: any) {
      Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const stats = useMemo(() => {
    const total = dataPinjam.length;
    const pending = dataPinjam.filter((item: any) => item.status === 'pending').length;
    const booking = dataPinjam.filter((item: any) => item.status === 'booking').length;
    const ongoing = dataPinjam.filter((item: any) => item.status === 'ongoing').length;
    return { total, pending, booking, ongoing };
  }, [dataPinjam]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SectionHeader 
        title="Antrean Persetujuan" 
        description="Verifikasi pengajuan peminjaman alat dari mahasiswa secara real-time"
        rightElement={
          <button 
            onClick={fetchPeminjaman} 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-500 transition-all font-black text-[10px] tracking-widest shadow-sm active:scale-95"
          >
            <i className="bi bi-arrow-clockwise text-sm"></i>
            <span>REFRESH DATA</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
        <StatCard title="Total Masuk" value={stats.total} icon="bi-stack" color="blue" />
        <StatCard title="Menunggu" value={stats.pending} icon="bi-clock-history" color="amber" />
        <StatCard title="Booking" value={stats.booking} icon="bi-calendar-check" color="emerald" />
        <StatCard title="Berlangsung" value={stats.ongoing} icon="bi-play-circle-fill" color="indigo" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Mahasiswa</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Detail Lab & Tujuan</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Item Alat</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Aksi Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center animate-pulse font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">
                    Menyinkronkan data peminjaman...
                  </td>
                </tr>
              ) : dataPinjam.length > 0 ? (
                dataPinjam.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 mb-1">ID: #{item.id}</span>
                        <span className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{item.user?.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">NIM: {item.user?.nim_nip}</span>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="font-black text-xs text-slate-700 uppercase leading-none mb-2 tracking-tighter">{item.ruangan_lab}</div>
                      <div className="text-[10px] text-slate-500 italic font-bold leading-tight line-clamp-2 max-w-[220px]">
                        "{item.tujuan_penggunaan}"
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5">
                        {item.details?.map((det: any) => (
                          <div key={det.id} className="text-[10px] font-black text-slate-600 flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            {det.alat?.nama_alat} <span className="text-indigo-600 ml-auto font-black">x{det.jumlah_pinjam}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-b-2 shadow-sm
                        ${item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          item.status === 'booking' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.status === 'ongoing' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-slate-50 text-slate-400 border-slate-200'}
                      `}>
                        {item.status}
                      </span>
                    </td>
                    
                    <td className="p-6">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleSetujui(item)} // FIX: Mengirim item (objek), bukan id
                            disabled={processing !== null}
                            className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 active:scale-90 disabled:opacity-50"
                            title="Setujui"
                          >
                            <i className="bi bi-check-lg text-lg"></i>
                          </button>
                          
                          <button
                            onClick={() => handleTolak(item.id)}
                            disabled={processing !== null}
                            className="p-3 bg-red-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-red-100 active:scale-90 disabled:opacity-50"
                            title="Tolak"
                          >
                            <i className="bi bi-x-lg text-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center italic text-slate-300 font-black text-[9px] uppercase tracking-widest">
                          Processed
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="bi bi-inbox text-2xl text-slate-300"></i>
                    </div>
                    <p className="font-black text-slate-300 uppercase tracking-[0.2em] text-xs">Antrean Kosong</p>
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

const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-900 shadow-blue-200 bg-blue-500",
    amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-600 text-amber-900 shadow-amber-200 bg-amber-500",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600 text-emerald-900 shadow-emerald-200 bg-emerald-500",
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-600 text-indigo-900 shadow-indigo-200 bg-indigo-500",
  };

  const c = colors[color].split(" ");

  return (
    <div className={`bg-gradient-to-br ${c[0]} ${c[1]} border ${c[2]} p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm`}>
      <div>
        <p className={`text-[10px] font-black ${c[3]} uppercase tracking-widest leading-none mb-2 italic`}>{title}</p>
        <p className={`text-3xl font-black ${c[4]}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 ${c[6]} rounded-full flex items-center justify-center text-white shadow-lg ${c[5]}`}>
        <i className={`bi ${icon} text-xl`}></i>
      </div>
    </div>
  );
};