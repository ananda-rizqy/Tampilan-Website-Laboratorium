import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { SectionHeader } from '../../components/molecules/SectionHeader';

interface RiwayatRuang {
  id: number;
  laboratorium: string;
  keperluan: string;
  kondisi_masuk: string;
  kondisi_keluar: string;
  waktu_masuk: string;
  waktu_keluar: string;
  jam_mulai: string;
  jam_selesai: string;
}

const RiwayatRuangSaya: React.FC = () => {
  const [riwayat, setRiwayat] = useState<RiwayatRuang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('http://localhost:8000/api/mahasiswa/riwayat-ruang', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRiwayat(response.data.data);
      } catch (err) {
        console.error("Gagal ambil data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/mahasiswa/riwayat-ruang', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRiwayat(response.data.data);
    } catch (err) {
      console.error("Gagal refresh data", err);
    } finally {
      setLoading(false);
    }
  };

  // Statistik
  const stats = useMemo(() => {
    const total = riwayat.length;
    const aktif = riwayat.filter(item => item.kondisi_keluar === 'Belum Check-out').length;
    const selesai = riwayat.filter(item => item.kondisi_keluar !== 'Belum Check-out').length;
    const bersih = riwayat.filter(item => 
      item.kondisi_keluar !== 'Belum Check-out' && item.kondisi_keluar === 'Bersih'
    ).length;
    
    return { total, aktif, selesai, bersih };
  }, [riwayat]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <SectionHeader
        title="Riwayat Penggunaan Ruang"
        description="Pantau aktivitas penggunaan ruangan laboratorium Anda"
        rightElement={
          <button 
            onClick={handleRefresh} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all font-semibold text-sm"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        }
      />

      {/* STATISTICS CARDS */}
      {!loading && riwayat.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Riwayat</p>
                <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="bi bi-door-open text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Sedang Aktif</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{stats.aktif}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <i className="bi bi-hourglass-split text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Selesai</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{stats.selesai}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <i className="bi bi-check-circle-fill text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Kondisi Bersih</p>
                <p className="text-2xl font-black text-green-900 mt-1">{stats.bersih}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <i className="bi bi-stars text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-3xl border-2 border-slate-100">
           <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
           <p className="text-slate-400 font-semibold text-sm">Memuat riwayat penggunaan ruang...</p>
        </div>
      ) : riwayat.length > 0 ? (
        <div className="grid gap-4">
          {riwayat.map((item) => {
            const isActive = item.kondisi_keluar === 'Belum Check-out';
            
            return (
              <div key={item.id} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-indigo-300 group">
                
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* LEFT SECTION */}
                  <div className="flex-1 space-y-4">
                    {/* TITLE */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="bi bi-building text-indigo-600 text-lg"></i>
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                          {item.laboratorium}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          <i className="bi bi-quote text-slate-400"></i> {item.keperluan}
                        </p>
                      </div>
                    </div>
                    
                    {/* JADWAL RENCANA */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="bi bi-calendar-range text-indigo-600"></i>
                        <p className="text-xs font-bold text-indigo-900">Jadwal Rencana</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <i className="bi bi-clock text-indigo-600 text-xs"></i>
                          <span className="font-bold text-indigo-700">{item.jam_mulai}</span>
                        </div>
                        <i className="bi bi-arrow-right text-indigo-400"></i>
                        <div className="flex items-center gap-2">
                          <i className="bi bi-clock-fill text-indigo-600 text-xs"></i>
                          <span className="font-bold text-indigo-700">{item.jam_selesai}</span>
                        </div>
                      </div>
                    </div>

                    {/* CHECK-IN/OUT TIME */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="bi bi-box-arrow-in-right text-emerald-600"></i>
                          <p className="text-xs font-bold text-slate-700">Check-In</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{item.waktu_masuk}</p>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <i className={`bi ${isActive ? 'bi-hourglass-split text-amber-600' : 'bi-box-arrow-left text-orange-600'}`}></i>
                          <p className="text-xs font-bold text-slate-700">Check-Out</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {isActive ? 'Belum selesai' : item.waktu_keluar}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="flex flex-col justify-between items-end min-w-[180px] space-y-3">
                    {/* STATUS BADGE */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 ${
                      isActive 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isActive ? (
                        <>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span>Sedang Digunakan</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill"></i>
                          <span>Selesai</span>
                        </>
                      )}
                    </div>

                    {/* KONDISI BADGES */}
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-500">Kondisi Masuk:</span>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                          item.kondisi_masuk === 'Bersih' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {item.kondisi_masuk === 'Bersih' ? '✓' : '✗'}
                          <span>{item.kondisi_masuk}</span>
                        </div>
                      </div>
                      
                      {!isActive && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-500">Kondisi Keluar:</span>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                            item.kondisi_keluar === 'Bersih' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {item.kondisi_keluar === 'Bersih' ? '✓' : '✗'}
                            <span>{item.kondisi_keluar}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-door-closed text-4xl text-slate-400"></i>
          </div>
          <h3 className="text-xl font-black text-slate-400 mb-2">Belum Ada Riwayat</h3>
          <p className="text-sm text-slate-500">Anda belum pernah menggunakan ruangan laboratorium</p>
        </div>
      )}
    </div>
  );
};

export default RiwayatRuangSaya;