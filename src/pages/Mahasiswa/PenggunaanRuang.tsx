import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import api from '../../api/axios'; 
import Swal from 'sweetalert2'; 
import { SectionHeader } from '../../components/molecules/SectionHeader';

interface FormState {
  laboratorium: string;
  kondisi: string;
  keperluan: string;
  jam_mulai: string;   
  jam_selesai: string; 
  foto: File | null;
}

const PenggunaanRuang: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'masuk' | 'keluar'>('masuk');
  const [idLaporan, setIdLaporan] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormState>({
    laboratorium: '',
    kondisi: '',
    keperluan: '',
    jam_mulai: '',
    jam_selesai: '',
    foto: null
  });

  useEffect(() => {
    const savedId = localStorage.getItem('active_session_id');
    const savedLab = localStorage.getItem('active_lab_name');
    if (savedId && savedLab) {
      setIdLaporan(parseInt(savedId));
      setStep('keluar');
      setFormData(prev => ({ ...prev, laboratorium: savedLab }));
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, foto: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    try {
      if (step === 'masuk') {
        data.append('laboratorium', formData.laboratorium);
        data.append('kondisi_masuk', formData.kondisi);
        data.append('keperluan', formData.keperluan);
        data.append('jam_mulai', formData.jam_mulai);      
        data.append('jam_selesai', formData.jam_selesai);  
        if (formData.foto) data.append('foto_before', formData.foto);

        const res = await api.post('/ruang/masuk', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const newId = res.data.data.id;
        setIdLaporan(newId);
        localStorage.setItem('active_session_id', newId.toString());
        localStorage.setItem('active_lab_name', formData.laboratorium);
        
        setStep('keluar');
        setFormData({ ...formData, foto: null, kondisi: '', jam_mulai: '', jam_selesai: '' }); 
        Swal.fire('Berhasil!', '✅ Check-in berhasil disimpan.', 'success');
      } else {
        data.append('kondisi_keluar', formData.kondisi);
        if (formData.foto) data.append('foto_after', formData.foto);

        await api.post(`/ruang/keluar/${idLaporan}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        localStorage.removeItem('active_session_id');
        localStorage.removeItem('active_lab_name');
        
        Swal.fire('Berhasil!', '✅ Check-out berhasil. Terima kasih telah menjaga kebersihan.', 'success')
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
      
      {/* HEADER */}
      <SectionHeader
        title={step === 'masuk' ? 'Check-In Laboratorium' : 'Check-Out Laboratorium'}
        description={step === 'masuk' ? 'Catat penggunaan ruangan dan kondisi awal laboratorium' : 'Selesaikan sesi dan dokumentasikan kondisi akhir ruangan'}
      />

      {/* STATUS CARD */}
      {step === 'keluar' && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="bi bi-door-open text-white text-xl"></i>
            </div>
            <div>
              <h3 className="font-black text-orange-900 text-lg mb-1">Sesi Aktif</h3>
              <p className="text-sm text-orange-700 mb-3">
                Anda sedang menggunakan <span className="font-bold">{formData.laboratorium}</span>
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-200 rounded-lg">
                <i className="bi bi-clock text-orange-800"></i>
                <span className="text-xs font-bold text-orange-800">ID Sesi: #{idLaporan}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden">
        
        {/* HEADER */}
        <div className={`p-6 text-white flex justify-between items-center transition-all ${
          step === 'masuk' 
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        }`}>
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className={`bi ${step === 'masuk' ? 'bi-box-arrow-in-right' : 'bi-box-arrow-left'} text-lg`}></i>
              </div>
              <h2 className="text-2xl font-black">
                {step === 'masuk' ? 'FORM CHECK-IN' : 'FORM CHECK-OUT'}
              </h2>
            </div>
            <p className="text-sm opacity-90">
              {step === 'masuk' ? 'Lengkapi data penggunaan ruangan' : 'Dokumentasikan kondisi akhir ruangan'}
            </p>
          </div>
          <div className="text-6xl opacity-10 font-black hidden md:block">
            {step === 'masuk' ? 'IN' : 'OUT'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* STEP 1: Info Lab & Keperluan (Hanya Check-In) */}
          {step === 'masuk' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
                    <span>Nama Laboratorium</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition-all" 
                    placeholder="Contoh: Lab Komputer Barat" 
                    required
                    onChange={(e) => setFormData({...formData, laboratorium: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
                    <span>Tujuan Penggunaan</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition-all" 
                    placeholder="Contoh: Praktikum Jaringan" 
                    required
                    onChange={(e) => setFormData({...formData, keperluan: e.target.value})} 
                  />
                </div>
              </div>

              {/* Waktu Penggunaan */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black">3</div>
                  <h3 className="text-sm font-bold text-indigo-900">Jadwal Penggunaan</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Waktu Mulai</label>
                    <input 
                      type="datetime-local" 
                      className="w-full border-2 border-white p-3 rounded-xl bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" 
                      required
                      onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Waktu Selesai</label>
                    <input 
                      type="datetime-local" 
                      className="w-full border-2 border-white p-3 rounded-xl bg-white shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" 
                      required
                      min={formData.jam_mulai}
                      onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Kondisi & Foto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-black ${
                  step === 'masuk' ? 'bg-indigo-600' : 'bg-orange-500'
                }`}>
                  {step === 'masuk' ? '4' : '1'}
                </div>
                <span>Kondisi Ruangan {step === 'masuk' ? '(Awal)' : '(Akhir)'}</span>
              </label>
              <select 
                required 
                value={formData.kondisi}
                className={`w-full border-2 p-3 rounded-xl outline-none transition-all font-semibold ${
                  formData.kondisi === 'Bersih' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' 
                    : formData.kondisi === 'Kotor' 
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200' 
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
                onChange={(e) => setFormData({...formData, kondisi: e.target.value})}
              >
                <option value="">-- Pilih Kondisi --</option>
                <option value="Bersih">✅ Bersih & Rapi</option>
                <option value="Kotor">⚠️ Kotor & Berantakan</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-black ${
                  step === 'masuk' ? 'bg-indigo-600' : 'bg-orange-500'
                }`}>
                  {step === 'masuk' ? '5' : '2'}
                </div>
                <span>Foto Dokumentasi</span>
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*" 
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange} 
                />
                <div className="text-center pointer-events-none">
                  {formData.foto ? (
                    <>
                      <i className="bi bi-check-circle-fill text-3xl text-emerald-500 mb-2 block"></i>
                      <p className="text-sm font-bold text-emerald-600">{formData.foto.name}</p>
                      <p className="text-xs text-slate-400 mt-1">Klik untuk ganti foto</p>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-camera text-3xl text-slate-400 group-hover:text-indigo-500 mb-2 block transition-colors"></i>
                      <p className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                        Klik untuk upload foto
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 2MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning jika kondisi kotor */}
          {formData.kondisi === 'Kotor' && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <i className="bi bi-exclamation-triangle-fill text-red-600 text-xl mt-0.5"></i>
                <div>
                  <p className="text-sm font-bold text-red-900 mb-1">Perhatian!</p>
                  <p className="text-xs text-red-700">
                    {step === 'masuk' 
                      ? 'Anda melaporkan kondisi awal kotor. Harap bersihkan sebelum menggunakan ruangan.'
                      : 'Mohon bersihkan ruangan sebelum meninggalkan laboratorium. Terima kasih atas kerjasamanya.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transform transition-all active:scale-[0.98] flex justify-center items-center gap-3 ${
              step === 'masuk' 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200'
            } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <i className={`bi ${step === 'masuk' ? 'bi-check-circle-fill' : 'bi-door-open'} text-xl`}></i>
                <span>{step === 'masuk' ? 'SIMPAN CHECK-IN' : 'SIMPAN CHECK-OUT'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PenggunaanRuang;