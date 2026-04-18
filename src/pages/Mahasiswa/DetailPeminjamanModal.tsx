import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const DetailPeminjamanModal: React.FC<ModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const getImageUrl = (path: string | null): string => {
        if (!path) return 'https://placehold.co/400x300?text=No+Image';
        if (path.startsWith('http')) return path;
        
        let cleanPath = path.replace(/^public\//, '').replace(/^storage\//, '').replace(/^\//, '');
        return `http://localhost:8000/storage/${cleanPath}`;
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        }).replace(',', ', ');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                            <i className="bi bi-clock-history text-white text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                Log Peminjaman
                            </h2>
                            <p className="text-sm text-slate-300 font-semibold mt-0.5">
                                ID #{data.id}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-300 hover:text-white transition-colors"
                    >
                        <i className="bi bi-x-lg text-2xl"></i>
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-slate-50">
                    
                    {/* FOTO & WAKTU SECTION */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Bukti Check-In */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                Bukti Check-In
                            </p>
                            <div className="bg-slate-200 rounded-2xl overflow-hidden border-2 border-slate-200">
                                <img 
                                    src={getImageUrl(data.foto_before)} 
                                    alt="Check-in" 
                                    className="w-full h-40 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Waktu & Status */}
                        <div className="space-y-3">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                                    Waktu Ambil Alat
                                </p>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <i className="bi bi-calendar-event text-lg"></i>
                                    <p className="text-sm font-black">
                                        {formatDateTime(data.created_at || data.waktu_pinjam)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Status
                                </p>
                                <div className="bg-slate-800 rounded-xl p-3 border-2 border-slate-800">
                                    <p className="text-base font-black text-white uppercase italic text-center">
                                        {data.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RINCIAN ITEM */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Rincian Item
                            </p>
                            <p className="text-sm font-black text-blue-600 uppercase italic">
                                {data.ruangan_lab}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            {data.details && data.details.length > 0 ? (
                                data.details.map((det: any) => (
                                    <div 
                                        key={det.id} 
                                        className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
                                    >
                                        <p className="text-sm font-semibold text-slate-900">
                                            {det.alat?.nama_alat || 'Unknown Item'}
                                        </p>
                                        <div className="bg-blue-500 text-white px-3 py-1 rounded-lg font-black text-sm">
                                            ×{det.jumlah_pinjam}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center py-4">
                                    Tidak ada data alat
                                </p>
                            )}
                        </div>
                    </div>

                    {/* TUJUAN PENGGUNAAN */}
                    <div className="bg-slate-800 rounded-2xl p-5 border-2 border-slate-800">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
                            Tujuan Penggunaan
                        </p>
                        <p className="text-sm text-white font-medium italic">
                            "{data.tujuan_penggunaan || '-'}"
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-white border-t-2 border-slate-200">
                    <button 
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase py-4 rounded-2xl transition-all text-sm tracking-wider shadow-lg"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailPeminjamanModal;