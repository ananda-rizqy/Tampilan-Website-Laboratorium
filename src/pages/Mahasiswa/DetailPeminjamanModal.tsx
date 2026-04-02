import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const DetailPeminjamanModal: React.FC<ModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden transform transition-all border border-slate-100">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">Detail Pinjam</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: #{data.id}</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className="bg-indigo-100 text-indigo-600 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                            {data.status}
                        </span>
                    </div>

                    {/* Daftar Alat (Sistem Keranjang) */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alat yang digunakan:</p>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                            {data.details?.map((det: any) => (
                                <div key={det.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="font-black text-slate-800 uppercase italic text-xs leading-none">
                                            {det.alat?.nama_alat}
                                        </p>
                                        <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase">
                                            {det.alat?.kode_tag || 'KONSUMSI'}
                                        </p>
                                    </div>
                                    <div className="bg-white px-3 py-1 rounded-lg border font-black text-indigo-600 text-xs">
                                        x{det.jumlah_pinjam}
                                    </div>
                                </div>
                            )) || <p className="text-xs italic text-slate-400 text-center">Data alat tidak tersedia</p>}
                        </div>
                    </div>

                    {/* Foto Bukti Before */}
                    <div className="pt-4 border-t border-dashed">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Kondisi Awal (Before):</p>
                        <div className="relative group">
                            <img 
                                src={`http://127.0.0.1:8000/storage/${data.foto_before}`} 
                                alt="Bukti Sebelum" 
                                className="w-full h-44 object-cover rounded-3xl shadow-md border-4 border-white grayscale-[20%] group-hover:grayscale-0 transition-all"
                            />
                        </div>
                    </div>

                    {/* Info Waktu */}
                    <div className="grid grid-cols-2 gap-4 text-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu Ambil</p>
                            <p className="font-black text-slate-800 italic uppercase text-sm leading-none mt-1">
                                {data.tanggal_diambil ? new Date(data.tanggal_diambil).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ruangan</p>
                            <p className="font-black text-indigo-600 italic uppercase text-sm leading-none mt-1">
                                {data.ruangan_lab}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                    >
                        Tutup Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailPeminjamanModal;