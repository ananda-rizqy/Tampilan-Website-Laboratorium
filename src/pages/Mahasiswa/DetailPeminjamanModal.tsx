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

                    {/* Daftar Alat (Updated for Multi-Tag) */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="bi bi-box-seam"></i> Item dalam Keranjang:
                        </p>
                        <div className="space-y-3">
                            {data.details?.map((det: any) => (
                                <div key={det.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-slate-800 uppercase italic text-xs leading-none">
                                                {det.alat?.nama_alat}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {/* Menangani multiple kode tag jika ada */}
                                                {det.kode_tag_list ? (
                                                    det.kode_tag_list.map((tag: string) => (
                                                        <span key={tag} className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-black tracking-tighter">
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[8px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">
                                                        {det.alat?.is_aset ? det.alat.kode_tag : 'Barang Konsumsi'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-white w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 font-black text-indigo-600 text-xs shadow-sm">
                                            {det.jumlah_pinjam}x
                                        </div>
                                    </div>
                                </div>
                            )) || <p className="text-xs italic text-slate-400 text-center py-4">Tidak ada data alat.</p>}
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
                                {data.waktu_pinjam ? new Date(data.waktu_pinjam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
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