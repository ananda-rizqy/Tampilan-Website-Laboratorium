import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Button } from "../ui/Button";

export interface AlatFormData {
  id?: number;
  nama_alat: string;
  letak: string;
  kode_tag?: string;
  jumlah: number | "";    
  kondisi: string;
}

interface AlatFormProps {
  initialData?: AlatFormData;
  onSuccess: () => void;
}

export function AlatForm({ initialData, onSuccess }: AlatFormProps) {
  const [rooms, setRooms] = useState<string[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [formData, setFormData] = useState<AlatFormData>({
    nama_alat: "",
    letak: "",
    kode_tag: "", 
    jumlah: "",
    kondisi: "baik", 
  });

  // 1. Ambil daftar ruangan
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/ruangan-list");
        setRooms(res.data);
      } catch (err) {
        console.error("Gagal mengambil daftar ruangan:", err);
        setRooms(["Lab Elektronika Dasar", "Lab Digital", "Gudang"]);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // 2. Load Initial Data untuk Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        kode_tag: initialData.kode_tag || "",
        jumlah: initialData.jumlah ?? "",
        kondisi: initialData.kondisi?.toLowerCase() || "baik"
      });
    }
  }, [initialData]);

  // --- LOGIKA PERBAIKAN: KUNCI JUMLAH JIKA ADA KODE TAG ---
  useEffect(() => {
    if (formData.kode_tag && formData.kode_tag.trim() !== "") {
      setFormData((prev) => ({ ...prev, jumlah: 1 }));
    }
  }, [formData.kode_tag]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
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

  // Helper untuk cek apakah input jumlah harus dimatikan
  const isQuantityDisabled = !!(formData.kode_tag && formData.kode_tag.trim() !== "");

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* NAMA ALAT */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nama Alat / Komponen</label>
        <input
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
          placeholder="Contoh: Resistor 10k"
          value={formData.nama_alat}
          onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
          required
        />
      </div>

      {/* LETAK */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Letak (Ruangan/Lemari)</label>
        <select
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold cursor-pointer"
          value={formData.letak}
          onChange={(e) => setFormData({ ...formData, letak: e.target.value })}
          required
        >
          <option value="" disabled>-- Pilih Lokasi Lab --</option>
          {loadingRooms ? (
            <option>Loading...</option>
          ) : (
            rooms.map((room) => (
              <option key={room} value={room}>{room}</option>
            ))
          )}
        </select>
      </div>

      {/* KODE TAG */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kode Tag (Kosongkan jika Konsumsi)</label>
        <input
          className="p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          placeholder="Contoh: INV-001"
          value={formData.kode_tag}
          onChange={(e) => setFormData({ ...formData, kode_tag: e.target.value })}
        />
      </div>

      {/* JUMLAH STOK (DIPERBAIKI) */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
          Jumlah Stok {isQuantityDisabled && "(Terkunci 1)"}
        </label>
        <input
          type="number"
          min="1"
          className={`p-3 border rounded-xl transition-all outline-none text-sm font-semibold ${
            isQuantityDisabled 
              ? 'bg-slate-200 cursor-not-allowed text-slate-500 shadow-inner' 
              : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500'
          }`}
          value={formData.jumlah}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({ 
        ...formData, 
        jumlah: value === "" ? "" : parseInt(value)
        });
}}
        />
      </div>

      {/* KONDISI */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kondisi Alat</label>
        <select
          className={`p-3 border rounded-xl outline-none transition-all text-sm font-semibold ${
            !formData.kode_tag 
              ? 'bg-slate-100 cursor-not-allowed text-slate-400' 
              : 'bg-slate-50 focus:ring-2 focus:ring-indigo-500'
          }`}
          value={formData.kode_tag ? formData.kondisi : "baik"}
          disabled={!formData.kode_tag}
          onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
        >
          <option value="baik">BAIK (NORMAL)</option>
          <option value="rusak">RUSAK (BUTUH PERBAIKAN)</option>
        </select>
        {!formData.kode_tag && (
          <span className="text-[9px] text-indigo-500 mt-1 font-bold italic uppercase tracking-tighter">
             * Item konsumsi (tanpa kode tag) otomatis dianggap Baik.
          </span>
        )}
      </div>

      <Button 
        type="submit" 
        className="md:col-span-2 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 mt-2"
      >
        {initialData?.id ? "Update Data Inventori" : "Simpan ke Database"}
      </Button>
    </form>
  );
}