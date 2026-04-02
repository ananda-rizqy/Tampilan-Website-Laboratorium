import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MasterQR: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('http://localhost:8000/api/generate-qr-pintu', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Kita ambil qr_code_url dari backend
        setQrUrl(response.data.qr_code_url);
      } catch (error) {
        console.error("Gagal ambil QR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, []);

  return (
    <main className="p-8 bg-slate-50 min-h-screen w-full flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 flex flex-col items-center max-w-sm w-full text-center">
        
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase italic text-slate-800 tracking-tighter">
            QR Pintu Utama
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Portal Akses Laboratorium
          </p>
        </div>

        {/* AREA QR CODE */}
        <div className="relative p-6 bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-inner mb-8 overflow-hidden">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center animate-pulse text-slate-300 font-black italic text-xs">
              MENGAMBIL KODE...
            </div>
          ) : (
            /* Karena QuickChart itu URL, kita pakai tag img biasa */
            <img 
              src={qrUrl} 
              alt="QR Pintu" 
              className="w-64 h-64 object-contain"
            />
          )}
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={() => window.print()}
            className="block w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
          >
            Cetak QR Pintu
          </button>
        </div>

        <p className="mt-8 text-[9px] text-slate-400 font-medium leading-relaxed italic">
          *QR ini digenerate via QuickChart API. Tetap tajam dan mudah discan.
        </p>
      </div>
    </main>
  );
};

export default MasterQR;