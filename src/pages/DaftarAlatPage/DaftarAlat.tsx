import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";

import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { SectionHeader } from "../../components/molecules/SectionHeader";
import { InventoryTable } from "../../components/organism/InventoryTable";
import { AlatForm } from "../../components/molecules/AlatForm";
import { InventoryTemplate } from "../../components/layouts/InventoryTemplate";

interface Alat {
  id: number;
  nama_alat: string;
  letak: string;
  kode_tag?: string;
  kondisi: string;
  jumlah: number;
}

export default function DaftarAlat() {
  const [alatList, setAlatList] = useState<Alat[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<Alat | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toLowerCase();
  const isStaff = userRole === "staff";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/alat?role=${userRole}&t=${Date.now()}`);
      setAlatList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus unit ini?")) {
      try {
        await api.delete(`/alat/${id}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditData(null);
    fetchData();
  };

  const columns = useMemo<ColumnDef<Alat>[]>(() => [
    {
      header: "NO",
      cell: (info) => (
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
          {info.row.index + 1}
        </div>
      ),
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
      ),
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
      ),
    },
    {
      header: "STOK",
      accessorKey: "jumlah",
      cell: ({ row }) => {
        const jumlah = row.original.jumlah;
        const isLow = jumlah <= 5;
        
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold ${
            isLow 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <i className={`bi ${isLow ? 'bi-exclamation-triangle-fill' : 'bi-box-seam'} text-sm`}></i>
            <span>{jumlah} Unit</span>
          </div>
        );
      },
    },
    {
      header: "KONDISI",
      accessorKey: "kondisi",
      cell: ({ row }) => {
        const isConsumable = !row.original.kode_tag;
        const currentCondition = isConsumable ? "Baik" : row.original.kondisi;
        const isBaik = currentCondition.toLowerCase() === "baik";

        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${
            isBaik 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isBaik ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span>{currentCondition}</span>
          </div>
        );
      },
    },
    ...(isStaff
      ? [
          {
            header: "AKSI",
            id: "actions",
            cell: ({ row }: { row: any }) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditData(row.original);
                    setIsFormOpen(true);
                  }}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                  title="Edit"
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  onClick={() => handleDelete(row.original.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                  title="Hapus"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ),
          },
        ]
      : []),
  ], [isStaff]);

  const table = useReactTable({
    data: alatList,
    columns,
    state: { 
        sorting,
        globalFilter, 
    },
    onGlobalFilterChange: setGlobalFilter, 
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(), 
    initialState: {
      pagination: { pageSize: 10 }, 
    },
  });

  // Hitung statistik
  const stats = useMemo(() => {
    const total = alatList.length;
    const baik = alatList.filter(a => (!a.kode_tag || a.kondisi.toLowerCase() === "baik")).length;
    const rusak = alatList.filter(a => a.kode_tag && a.kondisi.toLowerCase() === "rusak").length;
    const totalUnit = alatList.reduce((sum, a) => sum + (Number(a.jumlah) || 0), 0);
    
    return { total, baik, rusak, totalUnit };
  }, [alatList]);

  return (
    <InventoryTemplate
      header={
        <div className="space-y-6">
          <SectionHeader
            title="Inventory Peralatan Laboratorium"
            description="Kelola dan pantau aset peralatan laboratorium secara terpusat"
            rightElement={
              isStaff && (
                <Button
                  onClick={() => {
                    setEditData(null);
                    setIsFormOpen(!isFormOpen);
                  }}
                  className="shadow-lg shadow-blue-200"
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  {isFormOpen ? "Tutup Form" : "Tambah Item"}
                </Button>
              )
            }
          />

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Item</p>
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
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kondisi Baik</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{stats.baik}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-check-circle-fill text-white text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Kondisi Rusak</p>
                  <p className="text-2xl font-black text-red-900 mt-1">{stats.rusak}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-tools text-white text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Total Unit</p>
                  <p className="text-2xl font-black text-purple-900 mt-1">{stats.totalUnit}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <i className="bi bi-stack text-white text-xl"></i>
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
              className="block w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Cari alat, lokasi, atau kode tag..."
            />
          </div>
        </div>
      }
      form={
        isFormOpen && isStaff && (
          <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-xl border-2 border-blue-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <i className={`bi ${editData ? 'bi-pencil-square' : 'bi-plus-circle'} text-white text-lg`}></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {editData ? "Update Data Inventori" : "Registrasi Item Baru"}
              </h3>
            </div>
            <AlatForm
                initialData={
                  editData
                    ? { ...editData, kode_tag: editData.kode_tag ?? "" }
                    : undefined
                }
                onSuccess={handleSuccess}
            />
          </div>
        )
      }
      table={
        <div className="space-y-4">
          <InventoryTable
            table={table}
            loading={loading}
            header="Data Inventory"
          />

          <div className="flex items-center justify-between py-5 px-6 bg-gradient-to-r from-slate-50 to-white border-t-2 border-slate-100 rounded-b-3xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="text-sm font-semibold text-slate-600">
                Menampilkan <span className="text-blue-600 font-bold">{table.getRowModel().rows.length}</span> dari <span className="text-blue-600 font-bold">{stats.total}</span> data
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
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <i className="bi bi-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}