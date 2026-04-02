import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QrGateway: React.FC = () => {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      // HAPUS headers Authorization agar tidak kena "Unauthenticated"
      const response = await axios.get('http://localhost:8000/api/generate-qr-pintu');
      
      if (response.data.status === 'success') {
        setQrUrl(response.data.qr_code_url);
      }
    } catch (error) {
      console.error("Gagal mengambil QR Code:", error);
      alert("Gagal memuat QR. Pastikan Backend sudah dijalankan dan Route bersifat publik.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'QR_PINTU_LAB.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(qrUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-md mx-auto mt-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black uppercase italic text-slate-800 tracking-tighter">
          Master QR Pintu
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
          Cetak dan tempel pada pintu laboratorium
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-[2.5rem] blur opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-white p-6 rounded-[2rem] border-4 border-slate-900 shadow-2xl">
          {loading ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase italic">Memuat Kode...</span>
            </div>
          ) : qrUrl ? (
            <img 
              src={qrUrl} 
              alt="QR Gateway" 
              className="w-64 h-64 object-contain"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-red-500 font-bold text-xs uppercase">
              QR Tidak Ditemukan
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 w-full">
        <button 
          onClick={fetchQRCode}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Refresh QR
        </button>
        
        <button 
          onClick={handleDownload}
          disabled={loading || !qrUrl}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center shadow-lg shadow-indigo-100"
        >
          Download PNG
        </button>
      </div>

      <p className="mt-6 text-[9px] text-slate-400 text-center italic leading-relaxed uppercase font-bold tracking-tight">
        Arahkan ke: http://localhost:5173/login
      </p>
    </div>
  );
};

export default QrGateway;