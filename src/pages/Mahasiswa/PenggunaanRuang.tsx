import React, { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios'; 
import Swal from 'sweetalert2'; 
import { SectionHeader } from '../../components/molecules/SectionHeader';
import Webcam from "react-webcam";

// 1. DAFTAR RUANGAN SPESIFIK (Dropdown)
const RUANGAN_SPESIFIK = [
  "Lab. TK Barat I/01",         
  "Lab. TK Barat I/02",            
  "Lab. TK Barat I/04",            
  "Lab. TK Timur I/01",           
  "Lab. TK Timur I/02",            
  "Lab. TK Timur II/01",           
];

interface FormState {
  laboratorium: string;
  kondisi: string;
  keperluan: string;
  jam_mulai: string;   
  jam_selesai: string; 
  foto: File | null;
  fotoPreview: string | null;
}

const PenggunaanRuang: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'masuk' | 'keluar'>('masuk');
  const [idLaporan, setIdLaporan] = useState<number | null>(null);
  
  // Kamera States & Refs
  const webcamRef = useRef<Webcam>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    laboratorium: '',
    kondisi: '',
    keperluan: '',
    jam_mulai: '',
    jam_selesai: '',
    foto: null,
    fotoPreview: null
  });

  // Load sesi aktif dari localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('active_session_id');
    const savedLab = localStorage.getItem('active_lab_name');
    if (savedId && savedLab) {
      setIdLaporan(parseInt(savedId));
      setStep('keluar');
      setFormData(prev => ({ ...prev, laboratorium: savedLab }));
    }
  }, []);

  // Fungsi Ambil Foto (Capture)
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFormData(prev => ({ ...prev, fotoPreview: imageSrc }));
      
      // Ubah Base64 ke File
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `ruang_${step}_${Date.now()}.jpg`, { type: "image/jpeg" });
          setFormData(prev => ({ ...prev, foto: file }));
          setShowCamera(false);
        });
    }
  }, [webcamRef, step]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.foto) return Swal.fire('Peringatan', 'Harap ambil foto dokumentasi!', 'warning');
    
    setLoading(true);
    const data = new FormData();

    try {
      if (step === 'masuk') {
        data.append('laboratorium', formData.laboratorium);
        data.append('kondisi_masuk', formData.kondisi);
        data.append('keperluan', formData.keperluan);
        data.append('jam_mulai', formData.jam_mulai);      
        data.append('jam_selesai', formData.jam_selesai);  
        data.append('foto_before', formData.foto);

        const res = await api.post('/ruang/masuk', data);
        
        const newId = res.data.data.id;
        setIdLaporan(newId);
        localStorage.setItem('active_session_id', newId.toString());
        localStorage.setItem('active_lab_name', formData.laboratorium);
        
        setStep('keluar');
        // Reset form tapi tetap pertahankan nama lab untuk sesi keluar nanti
        setFormData({ ...formData, foto: null, fotoPreview: null, kondisi: '', jam_mulai: '', jam_selesai: '' }); 
        Swal.fire('Berhasil!', '✅ Check-in berhasil disimpan.', 'success');
      } else {
        data.append('kondisi_keluar', formData.kondisi);
        data.append('foto_after', formData.foto);

        await api.post(`/ruang/keluar/${idLaporan}`, data);
        
        localStorage.removeItem('active_session_id');
        localStorage.removeItem('active_lab_name');
        
        Swal.fire('Berhasil!', '✅ Check-out berhasil. Terima kasih.', 'success')
            .then(() => window.location.reload());
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim data.";
      Swal.fire('Gagal!', '❌ ' + msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      
      <SectionHeader
        title={step === 'masuk' ? 'Check-In Laboratorium' : 'Check-Out Laboratorium'}
        description={step === 'masuk' ? 'Catat penggunaan ruangan dan kondisi awal laboratorium' : 'Selesaikan sesi dan dokumentasikan kondisi akhir ruangan'}
      />

      {/* Sesi Aktif Card */}
      {step === 'keluar' && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
              <i className="bi bi-door-open text-white text-xl"></i>
            </div>
            <div>
              <h3 className="font-black text-orange-900 text-lg mb-1">Sesi Aktif</h3>
              <p className="text-sm text-orange-700 mb-3 font-medium">
                Anda sedang menggunakan <span className="font-black underlineDecoration-orange-500">{formData.laboratorium}</span>
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 rounded-lg border border-orange-200">
                 <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest">ID Sesi: #{idLaporan}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden">
        
        <div className={`p-6 text-white flex justify-between items-center transition-all ${
          step === 'masuk' ? 'bg-slate-900' : 'bg-orange-600'
        }`}>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
              {step === 'masuk' ? 'Form Check-In' : 'Form Check-Out'}
            </h2>
            <p className="text-xs opacity-70 italic font-medium">Lengkapi dokumentasi ruangan laboratorium</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {step === 'masuk' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DROPDOWN RUANGAN */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Laboratorium</label>
                  <select 
                    required 
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 bg-slate-50 font-bold transition-all"
                    onChange={(e) => setFormData({...formData, laboratorium: e.target.value})}
                  >
                    <option value="">-- Pilih Ruangan --</option>
                    {RUANGAN_SPESIFIK.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tujuan Penggunaan</label>
                  <input type="text" className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 bg-slate-50 font-bold" placeholder="Misal: Praktikum Mikrokontroler" required onChange={(e) => setFormData({...formData, keperluan: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jam Mulai</label>
                  <input type="datetime-local" className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 bg-slate-50 font-bold text-xs" required onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jam Selesai</label>
                  <input type="datetime-local" className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 bg-slate-50 font-bold text-xs" required onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})} />
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Kondisi Ruangan ({step === 'masuk' ? 'Awal' : 'Akhir'})</label>
              <select 
                required 
                value={formData.kondisi}
                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 bg-slate-50 font-bold" 
                onChange={(e) => setFormData({...formData, kondisi: e.target.value})}
              >
                <option value="">-- Pilih Kondisi --</option>
                <option value="Bersih">✅ Bersih & Rapi</option>
                <option value="Kotor">⚠️ Kotor & Berantakan</option>
              </select>
            </div>

            {/* INTEGRASI WEBCAM */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Dokumentasi Foto Kamera</label>
              
              {showCamera ? (
                <div className="relative w-full h-52 rounded-3xl overflow-hidden bg-black shadow-inner border-2 border-indigo-500">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    <button type="button" onClick={() => setShowCamera(false)} className="bg-red-500 text-white p-2 px-4 rounded-full text-[10px] font-black uppercase">Batal</button>
                    <button type="button" onClick={capture} className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg border-b-2 border-slate-300">Jepret Foto</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setShowCamera(true)}
                  className="w-full h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all overflow-hidden relative shadow-inner"
                >
                  {formData.fotoPreview ? (
                    <img src={formData.fotoPreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm mb-3">
                        <i className="bi bi-camera-fill text-2xl"></i>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik Untuk Memotret</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-[2rem] font-black text-white shadow-xl transition-all active:scale-95 ${
              step === 'masuk' ? 'bg-slate-900' : 'bg-orange-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-indigo-200'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>MEMPROSES...</span>
              </div>
            ) : (
              <span>{step === 'masuk' ? 'SIMPAN DATA CHECK-IN' : 'SIMPAN DATA CHECK-OUT'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PenggunaanRuang;