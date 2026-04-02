import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Button } from "../ui/Button";

// 1. Update Interface agar sinkron dengan Migration & DaftarAlat
export interface AlatFormData {
  id?: number;
  nama_alat: string;
  letak: string;
  kode_tag?: string;
  jumlah: number;    
  kondisi: string;
}

interface AlatFormProps {
  initialData?: AlatFormData;
  onSuccess: () => void;
}

export function AlatForm({ initialData, onSuccess }: AlatFormProps) {
  // 2. Inisialisasi state dengan kolom yang baru
  const [formData, setFormData] = useState<AlatFormData>({
    nama_alat: "",
    letak: "",
    kode_tag: "", 
    jumlah: 1, // Default 1
    kondisi: "baik", 
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        kode_tag: initialData.kode_tag || "",
        jumlah: initialData.jumlah || 1,
        kondisi: initialData.kondisi?.toLowerCase() || "baik"
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Jika kode_tag kosong (Konsumsi), paksa kondisi ke 'baik' sebelum kirim
      const payload = {
        ...formData,
        kondisi: formData.kode_tag ? formData.kondisi.toLowerCase() : "baik",
      };

      if (initialData?.id) {
        await api.put(`/alat/${initialData.id}`, payload);
      } else {
        await api.post("/alat", payload);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Submit error:", error.response?.data || error);
      const serverMessage = error.response?.data?.message || "Gagal menyimpan data";
      alert(serverMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* NAMA ALAT */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nama Alat / Komponen</label>
        <input
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Contoh: Resistor 10k"
          value={formData.nama_alat}
          onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
          required
        />
      </div>

      {/* LETAK */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Letak (Ruangan/Lemari)</label>
        <input
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Contoh: Lab Barat 01"
          value={formData.letak}
          onChange={(e) => setFormData({ ...formData, letak: e.target.value })}
          required
        />
      </div>

      {/* KODE TAG (Optional) */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kode Tag (Kosongkan jika Konsumsi)</label>
        <input
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          placeholder="Contoh: INV-001"
          value={formData.kode_tag}
          onChange={(e) => setFormData({ ...formData, kode_tag: e.target.value })}
        />
      </div>

      {/* JUMLAH */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Jumlah Stok</label>
        <input
          type="number"
          min="1"
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.jumlah}
          onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 0 })}
          required
        />
      </div>

      {/* KONDISI (Hanya bisa diubah jika itu ASET/ada Kode Tag) */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kondisi</label>
        <select
          className={`p-3 border rounded-xl outline-none transition-all ${!formData.kode_tag ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 focus:ring-2 focus:ring-indigo-500'}`}
          value={formData.kode_tag ? formData.kondisi : "baik"}
          disabled={!formData.kode_tag}
          onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
        >
          <option value="baik">Baik (Normal)</option>
          <option value="rusak">Rusak (Butuh Perbaikan)</option>
        </select>
        {!formData.kode_tag && (
          <span className="text-[9px] text-indigo-500 mt-1">* Barang konsumsi otomatis dianggap dalam kondisi baik.</span>
        )}
      </div>

      <Button type="submit" className="md:col-span-2 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
        {initialData?.id ? "Update Data Inventori" : "Simpan ke Database"}
      </Button>
    </form>
  );
}