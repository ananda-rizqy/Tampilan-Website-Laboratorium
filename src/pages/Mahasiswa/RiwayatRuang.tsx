/// <reference types="vite/client" />
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";

interface RiwayatRuang {
  id: number;
  laboratorium: string;
  keperluan: string;
  kondisi_masuk: string;
  kondisi_keluar: string;
  waktu_masuk: string;
  waktu_keluar: string | null;
  jam_mulai: string;
  jam_selesai: string;
  foto_before: string | null;
  foto_after: string | null;
}

const RiwayatRuangSaya: React.FC = () => {
  const [riwayat, setRiwayat] = useState<RiwayatRuang[]>([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = "http://localhost:8000";

  const fetchRiwayat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/mahasiswa/riwayat-ruang');
      setRiwayat(response.data.data || []);
    } catch (err) {
      console.error("Gagal ambil data", err);
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  // Statistik
  const stats = useMemo(() => {
    const total = riwayat.length;
    const aktif = riwayat.filter(item => !item.waktu_keluar).length;
    const selesai = riwayat.filter(item => item.waktu_keluar).length;
    return { total, aktif, selesai };
  }, [riwayat]);

  const renderImage = (path: string | null, label: string) => {
    if (!path) return <i className="bi bi-camera text-slate-300"></i>;

    let cleanPath = path.trim();

    cleanPath = cleanPath.replace(/^public\//, '');

    return (
      <img 
        src={cleanPath} 
        className="w-full h-full object-cover cursor-pointer" 
        alt={label}
        onClick={() => window.open(cleanPath, '_blank')}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.dataset.retried) {
            target.dataset.retried = "true";
            target.src = `${BACKEND_URL}/${cleanPath}`;
          } else {
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="flex items-center justify-center h-full w-full bg-red-50"><span class="text-[8px] text-red-500 font-black">404</span></div>';
            }
          }
        }}
      />
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <SectionHeader
        title="Riwayat Penggunaan Ruang"
        description="Monitor log check-in dan check-out ruangan laboratorium"
        rightElement={
          <button 
            onClick={fetchRiwayat} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all font-semibold text-sm shadow-sm"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>REFRESH</span>
          </button>
        }
      />

    {/* STATISTICS CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Penggunaan*/}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-2 italic">Total Penggunaan</p>
                <p className="text-3xl font-black text-blue-900">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="bi bi-journal-check text-2xl"></i>
            </div>
        </div>

        {/* Sesi Berjalan*/}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-2 italic">Sesi Aktif</p>
                <p className="text-3xl font-black text-amber-900">{stats.aktif}</p>
            </div>
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <i className="bi bi-door-open-fill text-2xl"></i>
            </div>
        </div>

        {/* Selesai*/}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-2 italic">Selesai</p>
                <p className="text-3xl font-black text-emerald-900">{stats.selesai}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <i className="bi bi-check-circle-fill text-2xl"></i>
            </div>
        </div>
    </div>

      {/* TABLE AREA */}
      <div className="bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-16">ID</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Kondisi Ruang</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Laboratorium</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Waktu Check-In/Out</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase text-xs">Memuat Data...</td></tr>
              ) : riwayat.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase text-xs">Belum ada riwayat</td></tr>
              ) : (
                riwayat.map((item) => {
                  const isActive = !item.waktu_keluar;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 text-center font-black text-slate-400 text-xs">#{item.id}</td>
                      
                      <td className="p-5">
                        <div className="flex gap-2">
                          <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Before</p>
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner relative">
                                {renderImage(item.foto_before, 'Before')}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">After</p>
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner relative">
                                {renderImage(item.foto_after, 'After')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                          <p className="text-[11px] font-black text-slate-900 uppercase leading-tight">{item.laboratorium}</p>
                          <p className="text-[10px] font-bold text-indigo-500 italic mt-1 leading-none">"{item.keperluan}"</p>
                      </td>

                      <td className="p-5 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <i className="bi bi-box-arrow-in-right text-emerald-500 text-xs"></i>
                                <span className="text-[11px] font-bold text-slate-600 leading-none">{item.waktu_masuk}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className={`bi ${isActive ? 'bi-hourglass-split text-amber-500' : 'bi-box-arrow-left text-orange-500'} text-xs`}></i>
                                <span className={`text-[11px] font-bold leading-none ${isActive ? 'text-amber-500 italic' : 'text-slate-600'}`}>
                                    {isActive ? 'Masih Digunakan' : item.waktu_keluar}
                                </span>
                            </div>
                          </div>
                      </td>

                      <td className="p-5 text-center">
                        {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black tracking-wider border border-amber-200">
                                <i className="bi bi-record-fill animate-pulse"></i> ACTIVE
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-wider border border-emerald-200">
                                <i className="bi bi-check-all"></i> SELESAI
                            </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatRuangSaya;