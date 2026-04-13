import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";

export default function PersetujuanPinjam() {
  const [dataPinjam, setDataPinjam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchPeminjaman = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/peminjaman/semua");
      setDataPinjam(Array.isArray(res.data) ? res.data : res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeminjaman();
  }, [fetchPeminjaman]);

  const handleSetujui = async (id: number) => {
    if (!confirm("✅ Setujui peminjaman ini? Status akan menjadi BOOKING (Pemesanan) atau ONGOING (Langsung).")) return;
    try {
      setProcessing(id);
      const res = await api.post(`/peminjaman/${id}/setujui`);
      alert(`✅ ${res.data.message || "Peminjaman berhasil disetujui!"}`);
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

  // Statistik yang disesuaikan dengan status BOOKING
  const stats = useMemo(() => {
    const total = dataPinjam.length;
    const pending = dataPinjam.filter((item: any) => item.status === 'pending').length;
    const booking = dataPinjam.filter((item: any) => item.status === 'booking').length;
    const ongoing = dataPinjam.filter((item: any) => item.status === 'ongoing').length;
    
    return { total, pending, booking, ongoing };
  }, [dataPinjam]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <SectionHeader 
        title="Persetujuan Peminjaman" 
        description="Kelola pengajuan peminjaman dan pantau alat yang sedang dipesan (booking)"
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
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider italic">Total Masuk</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          </div>

          <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider italic">Menunggu (Pending)</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider italic">Pemesanan (Booking)</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{stats.booking}</p>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider italic">Berlangsung (Ongoing)</p>
            <p className="text-2xl font-black text-indigo-900 mt-1">{stats.ongoing}</p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white border-b-4 border-indigo-600">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Identitas</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Detail Lab</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Item Alat</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Status Peminjaman</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Aksi Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center italic font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Menyinkronkan data peminjaman...
                  </td>
                </tr>
              ) : dataPinjam.length > 0 ? (
                dataPinjam.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600">#{item.id}</span>
                        <span className="font-black text-slate-800 text-sm uppercase">{item.user?.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1">{item.user?.nim_nip}</span>
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="font-black text-xs text-slate-700 uppercase">{item.ruangan_lab}</div>
                      <div className="text-[10px] text-slate-500 italic mt-1 font-medium leading-tight line-clamp-2 max-w-[200px]">
                        "{item.tujuan_penggunaan}"
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        {item.details?.map((det: any) => (
                          <div key={det.id} className="text-[10px] font-bold text-slate-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                            {det.alat?.nama_alat} <span className="text-indigo-600">x{det.jumlah_pinjam}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    
                    <td className="p-5 text-center">
                      {item.status === 'pending' && (
                        <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-widest">Menunggu</span>
                      )}
                      {item.status === 'booking' && (
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-widest">
                          <i className="bi bi-calendar-check mr-1"></i> Booking
                        </span>
                      )}
                      {item.status === 'ongoing' && (
                        <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-full uppercase tracking-widest">
                          <i className="bi bi-hourglass-split mr-1"></i> Berlangsung
                        </span>
                      )}
                      {item.status === 'returned' && (
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[9px] font-black rounded-full uppercase tracking-widest">Selesai</span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="px-4 py-1.5 bg-red-100 text-red-600 text-[9px] font-black rounded-full uppercase tracking-widest">Ditolak</span>
                      )}
                    </td>
                    
                    <td className="p-5">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSetujui(item.id)}
                            disabled={processing === item.id}
                            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md active:scale-90"
                            title="Setujui"
                          >
                            <i className="bi bi-check-lg text-lg"></i>
                          </button>
                          
                          <button
                            onClick={() => handleTolak(item.id)}
                            disabled={processing === item.id}
                            className="p-3 bg-red-600 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md active:scale-90"
                            title="Tolak"
                          >
                            <i className="bi bi-x-lg text-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center italic text-slate-300 font-bold text-[10px] uppercase">
                          No Action Needed
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">
                    Empty Queue
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