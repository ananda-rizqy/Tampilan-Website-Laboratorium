// import React, { useState, useEffect } from 'react';
// import api from '../../api/axios';

// const RandomizerKelompok = () => {
//     const [matakuliah, setMatakuliah] = useState<any[]>([]);
//     const [selectedMk, setSelectedMk] = useState('');
//     const [jumlahKelompok, setJumlahKelompok] = useState(6);
//     const [myGroup, setMyGroup] = useState<any>(null);
//     const [allGroups, setAllGroups] = useState<any>(null);
//     const [loading, setLoading] = useState(false);

//     const [showFormMk, setShowFormMk] = useState(false);
//     const [newMkName, setNewMkName] = useState('');
    
//     // Ambil data user untuk privilege
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     const isKetuaKelas = user.role === 'ketua_kelas';

//     useEffect(() => {
//         fetchMatakuliah();
//     }, []);

//     const fetchMatakuliah = async () => {
//         try {
//             const res = await api.get('/matakuliah');
//             if (res.data && res.data.data) {
//                 setMatakuliah(res.data.data);
//             } else {
//                 setMatakuliah(Array.isArray(res.data) ? res.data : []);
//             }
//         } catch (err) {
//             console.error("Gagal mengambil mata kuliah", err);
//             setMatakuliah([]);
//         }
//     };

//     const handleAddMk = async () => {
//         if (!newMkName) return alert("Nama Matkul tidak boleh kosong!");
//         try {
//             await api.post('/matakuliah', {
//                 nama_mk: newMkName,
//                 kelas_id: 1 
//             });
//             alert("Mata Kuliah Berhasil Ditambahkan!");
//             setNewMkName('');
//             setShowFormMk(false);
//             fetchMatakuliah();
//         } catch (err) {
//             alert("Gagal menambah Mata Kuliah");
//         }
//     };

//     const handleRandomize = async () => {
//         if (!selectedMk) return alert("Pilih Mata Kuliah terlebih dahulu!");
//         setLoading(true);
//         try {
//             await api.post('/kelompok/randomize', {
//                 matakuliah_id: selectedMk,
//                 jumlah_kelompok: jumlahKelompok
//             });
//             alert("Kelompok berhasil diacak!");
//             // Refresh data setelah acak
//             fetchMyGroup(); 
//             fetchAllGroups(); 
//         } catch (err) {
//             alert("Gagal mengacak kelompok");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchMyGroup = async () => {
//         if (!selectedMk) return;
//         try {
//             const res = await api.get(`/kelompok/my-group/${selectedMk}`);
//             setMyGroup(res.data);
//         } catch (err) {
//             setMyGroup(null);
//         }
//     };

//     const fetchAllGroups = async () => {
//         if (!selectedMk) return;
//         try {
//             const res = await api.get(`/kelompok/all/${selectedMk}`);
//             setAllGroups(res.data);
//         } catch (err) {
//             console.error("Gagal mengambil semua kelompok", err);
//             setAllGroups(null);
//         }
//     };

//     return (
//         <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-3xl border border-gray-100">
//             {/* HEADER */}
//             <div className="flex justify-between items-center mb-8">
//                 <div className="flex items-center gap-3">
//                     <span className="text-3xl">🎲</span>
//                     <h2 className="text-2xl font-black text-gray-800 tracking-tight">Randomizer Kelompok</h2>
//                 </div>
//                 {isKetuaKelas && (
//                     <button 
//                         onClick={() => setShowFormMk(!showFormMk)}
//                         className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${showFormMk ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
//                     >
//                         {showFormMk ? '✖ Batal' : '➕ Tambah Matkul'}
//                     </button>
//                 )}
//             </div>

//             {/* FORM TAMBAH MATKUL */}
//             {showFormMk && isKetuaKelas && (
//                 <div className="mb-8 p-6 bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-2xl">
//                     <h3 className="text-indigo-900 font-bold mb-3">Mata Kuliah Baru</h3>
//                     <div className="flex gap-3">
//                         <input 
//                             type="text"
//                             placeholder="Contoh: Sistem Komunikasi Satelit"
//                             className="flex-1 p-3 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             value={newMkName}
//                             onChange={(e) => setNewMkName(e.target.value)}
//                         />
//                         <button onClick={handleAddMk} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
//                             Simpan
//                         </button>
//                     </div>
//                 </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//                 {/* KONTROL */}
//                 <div className="space-y-6 bg-gray-50/80 p-7 rounded-3xl border border-gray-100">
//                     <h3 className="font-bold text-gray-400 uppercase text-[11px] tracking-[0.2em]">Pengaturan Acak</h3>
//                     <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Mata Kuliah</label>
//                         <select 
//                             className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-white"
//                             value={selectedMk}
//                             onChange={(e) => {
//                                 setSelectedMk(e.target.value);
//                                 setMyGroup(null);
//                                 setAllGroups(null); 
//                             }}
//                         >
//                             <option value="">-- Pilih Mata Kuliah --</option>
//                             {matakuliah.map((mk: any) => (
//                                 <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Target Jumlah Kelompok</label>
//                         <input 
//                             type="number" 
//                             min="2"
//                             className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
//                             value={jumlahKelompok}
//                             onChange={(e) => setJumlahKelompok(parseInt(e.target.value) || 0)}
//                         />
//                     </div>

//                     <div className="flex gap-3 pt-2">
//                         <button 
//                             onClick={handleRandomize}
//                             disabled={loading}
//                             className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
//                         >
//                             {loading ? 'Mengacak...' : '⚡ Acak Sekarang'}
//                         </button>
//                         <button 
//                             onClick={() => { fetchMyGroup(); fetchAllGroups(); }}
//                             className="px-6 py-4 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors"
//                         >
//                             Tampilkan
//                         </button>
//                     </div>
//                 </div>

//                 {/* MY GROUP HIGHLIGHT */}
//                 <div className="h-full">
//                     {myGroup ? (
//                         <div className="p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-2xl h-full flex flex-col">
//                             <h3 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] mb-2">Posisi Anda</h3>
//                             <div className="text-4xl font-black mb-8 border-b border-white/10 pb-4">{myGroup.nama_kelompok}</div>
//                             <ul className="space-y-3 flex-1">
//                                 {myGroup.anggota?.map((item: any) => (
//                                     <li key={item.id} className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
//                                         <span className="font-semibold text-sm">{item.user?.name}</span>
//                                         <span className="text-indigo-300 font-mono text-[10px] bg-indigo-500/20 px-2 py-1 rounded-md">{item.user?.nim}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ) : (
//                         <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 bg-gray-50/50 p-10">
//                             <span className="text-6xl mb-4">📋</span>
//                             <p className="text-sm font-semibold tracking-wide">Pilih MK & Klik Tampilkan</p>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <hr className="my-12 border-gray-100" />

//             {/* DAFTAR SEMUA KELOMPOK (Daftar Kolektif) */}
//             {allGroups && (
//                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
//                     <div className="flex items-center gap-4">
//                         <div className="h-10 w-1.5 bg-indigo-600 rounded-full"></div>
//                         <h3 className="text-2xl font-black text-gray-800 tracking-tight">Daftar Kolektif Mahasiswa</h3>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {Object.entries(allGroups).map(([groupName, members]: [string, any]) => (
//                             <div key={groupName} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
//                                 <div className="bg-indigo-600 p-4 flex justify-between items-center">
//                                     <h4 className="font-bold text-white tracking-wide">{groupName}</h4>
//                                     <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-lg font-bold backdrop-blur-sm">
//                                         {members.length} MHS
//                                     </span>
//                                 </div>
//                                 <div className="p-5">
//                                     <ul className="space-y-4">
//                                         {members.map((item: any) => (
//                                             <li key={item.id} className="flex flex-col border-l-2 border-gray-50 pl-3 hover:border-indigo-400 transition-colors">
//                                                 <span className="text-sm font-bold text-gray-700 truncate">{item.user?.name}</span>
//                                                 <span className="text-[10px] text-gray-400 font-mono mt-0.5">{item.user?.nim || item.user?.nim_nip || 'NIM Kosong'}</span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RandomizerKelompok;