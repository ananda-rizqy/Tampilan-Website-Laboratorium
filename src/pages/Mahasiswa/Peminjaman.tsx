import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import api from "../../api/axios";
import { SectionHeader } from "../../components/molecules/SectionHeader";
import { InventoryTable } from "../../components/organism/InventoryTable";
import React from "react";
import Webcam from "react-webcam";

// --- Interfaces ---
interface Alat {
  id: number;
  nama_alat: string;
  letak: string;
  jumlah: number;
  kode_tag_list?: string[];
  is_aset?: boolean;
}

interface CartItem extends Alat {
  selected_tags: string[];
  qty: number;
}

// 1. DAFTAR KATALOG (Tampilan Awal - Untuk Filter Pencarian)
const LAB_GROUPS = [
  { name: "Gedung Elektronika", icon: "bi-activity", color: "from-blue-600 to-blue-800" },
  { name: "Gedung Telekomunikasi", icon: "bi-hdd-network", color: "from-orange-600 to-orange-800" },
  { name: "Gedung UPT Bahasa", icon: "bi-cpu-fill", color: "from-purple-600 to-purple-800" },
  { name: "Gedung Magister Terapan", icon: "bi-camera-reels", color: "from-pink-600 to-pink-800" }
];

// 2. DAFTAR RUANGAN SPESIFIK (Lokasi Penggunaan - Bisa kamu tambah/kurang di sini)
const RUANGAN_SPESIFIK = [
  "Laboratorium Barat 1",
  "Laboratorium Barat 2",
  "Laboratorium Timur 1",
  "Laboratorium Timur 2",
  "Laboratorium Broadcast",
  "Laboratorium Jaringan Komputer"
];

export default function PeminjamanPage() {
  const webcamRef = useRef<Webcam>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [alatList, setAlatList] = useState<Alat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFormStep, setIsFormStep] = useState(false);
  
  const [targetRoom, setTargetRoom] = useState(""); 
  const [tujuan, setTujuan] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const fetchData = useCallback(async (labName: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/alat?role=mahasiswa&lab=${labName}`);
      setAlatList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data lab:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleSelectGroup = (lab: string) => {
    setSelectedGroup(lab);
    fetchData(lab);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImagePreview(imageSrc); 
      
      const byteString = atob(imageSrc.split(',')[1]);
      const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      
      // Jadikan File asli
      const file = new File([blob], "foto_alat.jpg", { type: "image/jpeg" });
      setImageFile(file); // Simpan ke state imageFile
      setShowCamera(false);
    }
}, [webcamRef]);

  const addToCart = (alat: Alat) => {
    if (cart.find((item) => item.nama_alat === alat.nama_alat)) {
      return alert("Alat ini sudah ada di keranjang!");
    }
    setCart([...cart, { ...alat, qty: 1, selected_tags: [""] 
  } as CartItem]);
  };

  const addTagRow = (alatId: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === alatId) {
        if (item.selected_tags.length >= item.jumlah) {
          alert("Stok unit tidak mencukupi!");
          return item;
        }
        return { ...item, qty: item.qty + 1, selected_tags: [...item.selected_tags, ""] };
      }
      return item;
    }));
  };

  const removeTagRow = (alatId: number, index: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === alatId && item.selected_tags.length > 1) {
        const newTags = [...item.selected_tags];
        newTags.splice(index, 1);
        return { ...item, qty: item.qty - 1, selected_tags: newTags };
      }
      return item;
    }));
  };

  const updateCartItem = (nama: string, field: string, value: any) => {
    setCart(prev => prev.map(item => 
      item.nama_alat === nama ? { ...item, [field]: value } : item
    ));
  };

  const handleCheckout = async () => {
    if (!targetRoom) return alert("Harap pilih ruangan laboratorium tujuan!");
    if (!tujuan.trim()) return alert("Harap isi tujuan penggunaan alat!");
    if (!imageFile) return alert("Harap ambil foto kondisi alat!");
    
    const invalidItem = cart.find(
    item => item.is_aset && item.selected_tags.some(tag => !tag)
    );
    if (invalidItem) return alert(`Harap pilih Kode Tag untuk ${invalidItem.nama_alat}`);

    const formData = new FormData();
    formData.append("ruangan_lab", targetRoom); 
    formData.append("tujuan", tujuan);
    formData.append("foto_before", imageFile);
   const itemsPayload = cart.map(item => ({ 
    id: item.id, 
    qty: item.is_aset ? item.selected_tags.length : item.qty,
    kode_tag_list: item.is_aset ? item.selected_tags : []
}));
formData.append("items", JSON.stringify(itemsPayload));

    try {
      setLoading(true);
      await api.post("/peminjaman/ajukan", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("✅ Pengajuan berhasil dikirim!");
      setCart([]); setTujuan(""); setTargetRoom(""); setImagePreview(null); setImageFile(null);
      setIsCartOpen(false);
    } catch (err) {
      alert("❌ Gagal memproses peminjaman.");
      } finally {
      setLoading(false);
    }
  };

  // --- Table Columns ---
  const columns = useMemo<ColumnDef<Alat>[]>(() => [
    { 
      header: "NO", 
      cell: (info) => <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{info.row.index + 1}</div>
    },
    { 
      header: "NAMA ALAT", 
      accessorKey: "nama_alat", 
      cell: ({ row }) => (
        <div>
          <div className="font-black text-slate-900 uppercase italic text-xs leading-tight">{row.original.nama_alat}</div>
          <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
            <i className="bi bi-geo-alt-fill text-indigo-500"></i> {row.original.letak}
          </div>
        </div>
      )
    },
    { 
      header: "STOK", 
      accessorKey: "tersedia", 
      cell: ({ row }) => <div className="px-3 py-1 rounded-lg font-black text-[10px] border w-fit bg-emerald-50 text-emerald-600 border-emerald-100 uppercase">{row.original.jumlah} unit</div>
    },
    {
      header: "AKSI",
      id: "actions",
      cell: ({ row }) => {
        const isAdded = cart.some(item => item.nama_alat === row.original.nama_alat);
        return (
          <button
            disabled={row.original.jumlah <= 0 || isAdded}
            onClick={() => addToCart(row.original)}
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${
              isAdded ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-slate-900'
            }`}
          >
            {isAdded ? "Added" : "Pinjam"}
          </button>
        );
      },
    },
  ], [cart, alatList]);

  const table = useReactTable({
    data: alatList,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* 1. VIEW PEMILIHAN KATALOG */}
      {!selectedGroup ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <SectionHeader title="Sistem Peminjaman" description="Pilih kategori laboratorium untuk melihat daftar alat" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LAB_GROUPS.map((lab) => (
              <button key={lab.name} onClick={() => handleSelectGroup(lab.name)} className={`group relative h-48 rounded-[2rem] overflow-hidden transition-all hover:-translate-y-2 shadow-xl bg-gradient-to-br ${lab.color}`}>
                <div className="flex flex-col items-center justify-center text-white h-full p-6 text-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 group-hover:rotate-12 transition-transform">
                    <i className={`bi ${lab.icon} text-3xl`}></i>
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-tighter">{lab.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* 2. VIEW KATALOG ALAT */
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex flex-col">
                <button onClick={() => setSelectedGroup(null)} className="text-[10px] font-black uppercase text-indigo-500 mb-1 hover:text-slate-900 flex items-center gap-2">
                    <i className="bi bi-arrow-left"></i> Kembali ke Katalog
                </button>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                    List <span className="text-indigo-600">{selectedGroup}</span>
                </h2>
             </div>
             <input type="text" value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} className="w-full max-w-xs pl-6 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 shadow-inner" placeholder="Cari alat..." />
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <InventoryTable table={table} loading={loading} header="Daftar Peralatan Tersedia" />
          </div>
        </div>
      )}

      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <button onClick={() => { setIsCartOpen(true); setIsFormStep(false); }} className="fixed bottom-8 right-8 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl font-black uppercase italic tracking-widest flex gap-4 items-center hover:scale-105 transition-all z-40 border-b-4 border-indigo-600 animate-in bounce-in">
          <div className="relative">
            <i className="bi bi-cart-check-fill text-2xl text-indigo-400"></i>
            <span className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-slate-900 font-black">{cart.length}</span>
          </div>
          <span>{cart.length} Alat Dipilih</span>
        </button>
      )}

      {/* MODAL KERANJANG & FORM */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500" onClick={e => e.stopPropagation()}>
             
             <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{isFormStep ? "Data Tujuan" : "Isi Keranjang"}</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest italic">Konfirmasi peminjaman alat</p>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 transition-transform active:scale-90"><i className="bi bi-x-lg text-xl"></i></button>
             </div>

            {!isFormStep ? (
                /* STEP 1: REVIEW KERANJANG */
                <>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-white">
                    {cart.map((item) => (
                      <div key={item.id} className="p-5 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-xs text-slate-800 uppercase italic leading-none">{item.nama_alat}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase italic flex items-center gap-1">
                              <i className="bi bi-geo-alt"></i> Asal: {item.letak}
                            </p>
                          </div>
                          <button 
                            onClick={() => setCart(cart.filter(c => c.id !== item.id))} 
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <i className="bi bi-trash3-fill text-lg"></i>
                          </button>
                        </div>

                        {item.is_aset ? (
                          /* MULTI-SELECT KODE TAG UNTUK ALAT BESAR */
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                              <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                                Pilih Unit / Kode Tag:
                              </label>
                              <button 
                                type="button"
                                onClick={() => addTagRow(item.id)}
                                className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full hover:bg-slate-900 transition-all flex items-center gap-1 shadow-md"
                              >
                                <i className="bi bi-plus-lg"></i> TAMBAH UNIT
                              </button>
                            </div>

                            <div className="space-y-3">
                              {item.selected_tags.map((tag, idx) => (
                                <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                                  <div className="relative flex-1">
                                    <select 
                                      required
                                      value={tag} 
                                      onChange={(e) => {
                                        const newTags = [...item.selected_tags];
                                        newTags[idx] = e.target.value;
                                        updateCartItem(item.nama_alat, 'selected_tags', newTags);
                                      }}
                                      className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-500 appearance-none shadow-sm"
                                    >
                                      <option value="">-- Pilih Unit --</option>
                                      {item.kode_tag_list && item.kode_tag_list.length > 0 ? (
                                        item.kode_tag_list.map((t) => (
                                          <option 
                                            key={t} 
                                            value={t}
                                            disabled={item.selected_tags.includes(t) && t !== tag}
                                          >
                                            {t} {item.selected_tags.includes(t) && t !== tag ? '(Terpilih)' : ''}
                                          </option>
                                        ))
                                      ) : (
                                        <option disabled>Tidak ada unit tersedia</option>
                                      )}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                                      <i className="bi bi-chevron-down"></i>
                                    </div>
                                  </div>

                                  {/* Tombol Hapus Baris Unit (Jika lebih dari 1) */}
                                  {item.selected_tags.length > 1 && (
                                    <button 
                                      type="button"
                                      onClick={() => removeTagRow(item.id, idx)}
                                      className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-[8px] text-slate-400 italic">Maksimal unit tersedia: {item.jumlah}</p>
                          </div>
                        ) : (
                          /* INPUT QUANTITY UNTUK BARANG KONSUMSI */
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase italic">Jumlah Pinjam:</span>
                            <input 
                              type="number" 
                              min="1" 
                              max={item.jumlah} 
                              className="w-20 p-2 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-xs outline-none focus:border-indigo-500 shadow-inner" 
                              value={item.qty} 
                              onChange={(e) => updateCartItem(item.nama_alat, 'qty', parseInt(e.target.value))} 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-8 bg-slate-50 border-t-2 border-slate-100">
                    <button 
                      onClick={() => setIsFormStep(true)} 
                      className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <span>Lanjut Isi Form</span> <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </>
            ) : (

               /* STEP 2: FORM SPESIFIK & KAMERA */
               <div className="flex-1 p-8 space-y-6 bg-white flex flex-col overflow-y-auto">
                  <button onClick={() => setIsFormStep(false)} className="text-indigo-600 text-[10px] font-black uppercase flex items-center gap-2 mb-2"><i className="bi bi-arrow-left"></i> Edit Daftar Alat</button>
                  
                  {/* RUANGAN SPESIFIK TUJUAN */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block italic leading-none">Ruangan Lab Penggunaan:</label>
                      <select value={targetRoom} onChange={(e) => setTargetRoom(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-indigo-500 outline-none shadow-inner appearance-none">
                          <option value="">-- Pilih Ruangan Spesifik --</option>
                          {RUANGAN_SPESIFIK.map(room => <option key={room} value={room}>{room}</option>)}
                      </select>
                  </div>

                  {/* TUJUAN PENGGUNAAN */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block italic leading-none">Tujuan Peminjaman:</label>
                      <textarea value={tujuan} onChange={e => setTujuan(e.target.value)} placeholder="Contoh: Praktikum Antena - Kelompok 4" className="w-full p-5 bg-slate-50 rounded-[2rem] border-2 border-slate-100 text-sm font-bold focus:border-indigo-500 outline-none resize-none shadow-inner" rows={3} />
                  </div>

                  
{/* FITUR KAMERA LANGSUNG */}
                <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block italic">
        Foto Kondisi Alat:
    </label>

    {!showCamera ? (
        // Tampilan Preview atau Tombol Buka Kamera
        <div 
            onClick={() => setShowCamera(true)}
            className="w-full h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center cursor-pointer"
        >
            {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
                <div className="text-center">
                    <i className="bi bi-camera-fill text-3xl text-indigo-500"></i>
                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase">Klik untuk Aktifkan Kamera</p>
                </div>
            )}
        </div>
    ) : (
        // Tampilan Live Kamera
        <div className="relative w-full h-64 rounded-[2rem] overflow-hidden border-2 border-indigo-500 shadow-xl bg-black">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }} // Gunakan kamera belakang
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button 
                    onClick={() => setShowCamera(false)}
                    className="bg-red-500 text-white p-3 rounded-full shadow-lg"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
                <button 
                    onClick={capture}
                    className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg border-b-4 border-slate-300"
                >
                    Jepret Foto
                </button>
            </div>
        </div>
    )}
</div>

                  <button 
                    onClick={handleCheckout} 
                    disabled={loading} 
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:bg-slate-300 mt-auto"
                  >
                    {loading ? "MEMPROSES..." : "Kirim Pengajuan"} <i className="bi bi-send-fill ml-2"></i>
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}