import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import api from "../../api/axios";
import { Badge } from "../../components/atoms/Badge";
import { Button } from "../../components/ui/Button";
import { SectionHeader } from "../../components/molecules/SectionHeader";
import { InventoryTable } from "../../components/organism/InventoryTable";

interface Alat {
  id: number;
  nama_alat: string;
  letak: string;
  jumlah: number;
  kode_tag?: string;
}

interface CartItem extends Alat {
  qty: number;
}

const LAB_OPTIONS = [
  { name: "Laboratorium Barat", icon: "bi-activity", color: "from-blue-500 to-blue-700" },
  { name: "Laboratorium Timur", icon: "bi-hdd-network", color: "from-orange-500 to-orange-700" },
  { name: "Laboratorium MST", icon: "bi-cpu-fill", color: "from-purple-500 to-purple-700" },
  { name: "Laboratorium Broadcast", icon: "bi-camera-reels", color: "from-pink-500 to-pink-700" }
];

export default function PeminjamanPage() {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [alatList, setAlatList] = useState<Alat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tujuan, setTujuan] = useState("");

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

  const handleSelectLab = (lab: string) => {
    setSelectedLab(lab);
    fetchData(lab);
  };

  const addToCart = (alat: Alat) => {
    if (!alat.id) return alert("Error: Alat tidak memiliki ID.");
    const isExist = cart.find((item) => item.id === alat.id);
    if (isExist) return alert("Alat sudah ada di keranjang!");
    
    setCart([...cart, { ...alat, qty: 1 }]);
    setIsCartOpen(true);
  };

  const updateQty = (id: number, newQty: number, max: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, Math.min(newQty, max)) } : item
    ));
  };

  const handleCheckout = async () => {
    if (!tujuan.trim()) return alert("Harap isi tujuan penggunaan alat!");
    try {
      const payload = {
        ruangan_lab: selectedLab,
        tujuan: tujuan,
        items: cart.map(item => ({ id: Number(item.id), qty: Number(item.qty) }))
      };
      
      await api.post("/peminjaman/ajukan", payload);
      alert("✅ Berhasil mengajukan peminjaman!");
      setCart([]);
      setTujuan("");
      setIsCartOpen(false);
    } catch (err) {
      alert("❌ Gagal memproses peminjaman.");
    }
  };

  const columns = useMemo<ColumnDef<Alat>[]>(() => [
    { 
      header: "NO", 
      cell: (info) => (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
          {info.row.index + 1}
        </div>
      )
    },
    { 
      header: "NAMA ALAT", 
      accessorKey: "nama_alat", 
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900">{row.original.nama_alat}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            <i className="bi bi-geo-alt text-slate-400"></i> {row.original.letak}
          </div>
        </div>
      )
    },
    { 
      header: "KODE TAG", 
      accessorKey: "kode_tag", 
      cell: ({ row }) => (
        row.original.kode_tag ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
            <i className="bi bi-tag-fill text-indigo-600 text-xs"></i>
            <code className="text-sm font-bold text-indigo-700">
              {row.original.kode_tag}
            </code>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Konsumsi</span>
        )
      )
    },
    { 
      header: "STOK TERSEDIA", 
      accessorKey: "jumlah", 
      cell: ({ row }) => {
        const jumlah = row.original.jumlah;
        const isLow = jumlah <= 5;
        
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold ${
            isLow 
              ? 'bg-orange-50 text-orange-700 border border-orange-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <i className={`bi ${isLow ? 'bi-exclamation-triangle-fill' : 'bi-box-seam'} text-sm`}></i>
            <span>{jumlah} Unit</span>
          </div>
        );
      }
    },
    {
      header: "AKSI",
      id: "actions",
      cell: ({ row }) => (
        <button
          disabled={row.original.jumlah <= 0}
          onClick={() => addToCart(row.original)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            row.original.jumlah <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-lg'
          }`}
        >
          <i className="bi bi-cart-plus"></i>
          <span>Tambah</span>
        </button>
      ),
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
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  // Statistik
  const stats = useMemo(() => {
    const total = alatList.length;
    const tersedia = alatList.filter(a => a.jumlah > 0).length;
    const lowStock = alatList.filter(a => a.jumlah > 0 && a.jumlah <= 5).length;
    
    return { total, tersedia, lowStock };
  }, [alatList]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* KONDISI 1: PILIH LAB */}
      {!selectedLab ? (
        <div className="space-y-8">
          <SectionHeader 
            title="Pilih Laboratorium" 
            description="Tentukan ruangan laboratorium untuk melihat alat yang tersedia" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LAB_OPTIONS.map((lab) => (
              <button 
                key={lab.name} 
                onClick={() => handleSelectLab(lab.name)} 
                className="group relative h-56 rounded-3xl overflow-hidden transition-all hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i className={`bi ${lab.icon} text-3xl`}></i>
                  </div>
                  <h3 className="font-black text-lg text-center uppercase tracking-tight">{lab.name}</h3>
                  <p className="text-xs mt-2 text-white/80">Klik untuk melihat alat</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* KONDISI 2: DAFTAR ALAT */
        <div className="space-y-6">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button 
                onClick={() => setSelectedLab(null)} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-3 transition-colors"
              >
                <i className="bi bi-arrow-left"></i>
                <span>Ganti Ruangan</span>
              </button>
              <h2 className="text-3xl font-black text-slate-900">
                Alat di <span className="text-indigo-600">{selectedLab}</span>
              </h2>
            </div>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Alat</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-box-seam text-white text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tersedia</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{stats.tersedia}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-check-circle-fill text-white text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Stok Terbatas</p>
                  <p className="text-2xl font-black text-orange-900 mt-1">{stats.lowStock}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-exclamation-triangle-fill text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
               <i className="bi bi-search text-slate-400 text-lg"></i>
            </span>
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="block w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Cari alat atau kode tag..."
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-100">
            <InventoryTable table={table} loading={loading} header={`Ketersediaan Alat`} />
            
            {/* PAGINATION */}
            <div className="flex items-center justify-between py-5 px-6 bg-gradient-to-r from-slate-50 to-white border-t-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <div className="text-sm font-semibold text-slate-600">
                  Menampilkan <span className="text-indigo-600 font-bold">{table.getRowModel().rows.length}</span> dari <span className="text-indigo-600 font-bold">{stats.total}</span> alat
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-5 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <i className="bi bi-chevron-left mr-1"></i>
                  Prev
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                  <i className="bi bi-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOMBOL MELAYANG KERANJANG */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="fixed bottom-10 right-10 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-full shadow-2xl font-bold flex gap-3 items-center hover:scale-110 transition-all z-50 border-2 border-indigo-400"
        >
          <div className="relative">
            <i className="bi bi-cart-fill text-2xl"></i>
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {cart.length}
            </span>
          </div>
          <span>{cart.length} Alat Dipilih</span>
        </button>
      )}

      {/* MODAL SIDEBAR KERANJANG */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end" onClick={() => setIsCartOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
             {/* HEADER */}
             <div className="flex justify-between items-center p-6 border-b-2 border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
               <div>
                 <h3 className="text-2xl font-black text-slate-900">Keranjang Pinjam</h3>
                 <p className="text-xs text-slate-500 mt-1">{cart.length} item dipilih</p>
               </div>
               <button 
                 onClick={() => setIsCartOpen(false)}
                 className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
               >
                 <i className="bi bi-x-lg text-xl text-slate-600"></i>
               </button>
             </div>

             {/* LIST ITEMS */}
             <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50">
               {cart.map((item) => (
                 <div key={item.id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{item.nama_alat}</p>
                        <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                          <i className="bi bi-tag-fill"></i>
                          {item.kode_tag || "KONSUMSI"}
                        </p>
                      </div>
                      <button 
                        onClick={() => setCart(cart.filter(c => c.id !== item.id))} 
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-600 transition-colors"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Jumlah Pinjam:</span>
                      {!item.kode_tag ? (
                         <input 
                           type="number" 
                           value={item.qty} 
                           onChange={(e) => updateQty(item.id, parseInt(e.target.value), item.jumlah)} 
                           className="w-16 border-2 border-slate-200 rounded-lg text-center font-bold py-1 text-sm focus:border-indigo-500 focus:outline-none" 
                         />
                      ) : (
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold">
                          1 Unit
                        </div>
                      )}
                    </div>
                 </div>
               ))}
             </div>

             {/* FOOTER CHECKOUT */}
             <div className="p-6 border-t-2 border-slate-100 space-y-4 bg-white">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Tujuan Peminjaman</label>
                 <textarea 
                   value={tujuan} 
                   onChange={(e) => setTujuan(e.target.value)} 
                   placeholder="Contoh: Praktikum Sistem Embedded - Kelompok 4" 
                   className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-sm focus:border-indigo-500 focus:outline-none resize-none" 
                   rows={3}
                 />
               </div>
               <button 
                 className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
                 onClick={handleCheckout}
               >
                 <i className="bi bi-send-fill mr-2"></i>
                 Ajukan Peminjaman
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}