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

  const handleSetujui = async (id: number) => {
    const result = await Swal.fire({
      title: 'Setujui Peminjaman?',
      text: "Status akan berubah menjadi Booking (Siap Diambil).",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'YA, SETUJUI'
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(id);
      const res = await api.post(`/peminjaman/${id}/setujui`);
      Swal.fire('Berhasil!', res.data.message || 'Peminjaman telah disetujui.', 'success');
      fetchPeminjaman();
    } catch (err: any) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal memproses persetujuan.', 'error');
    } finally {
      setProcessing(null);
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
      confirmButtonColor: '#dc2626'
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

      {/* STATISTICS CARDS*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-2 italic">Total Masuk</p>
            <p className="text-3xl font-black text-blue-900">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <i className="bi bi-stack text-xl"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-2 italic">Menunggu</p>
            <p className="text-3xl font-black text-amber-900">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <i className="bi bi-clock-history text-xl"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-2 italic">Booking</p>
            <p className="text-3xl font-black text-emerald-900">{stats.booking}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <i className="bi bi-calendar-check text-xl"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-2 italic">Berlangsung</p>
            <p className="text-3xl font-black text-indigo-900">{stats.ongoing}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="bi bi-play-circle-fill text-xl"></i>
          </div>
        </div>
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
                            {det.alat?.nama_alat} <span className="text-indigo-600 ml-auto">x{det.jumlah_pinjam}</span>
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
                            onClick={() => handleSetujui(item.id)}
                            disabled={processing === item.id}
                            className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 active:scale-90"
                            title="Setujui"
                          >
                            <i className="bi bi-check-lg text-lg"></i>
                          </button>
                          
                          <button
                            onClick={() => handleTolak(item.id)}
                            disabled={processing === item.id}
                            className="p-3 bg-red-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-red-100 active:scale-90"
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