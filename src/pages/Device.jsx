import { useEffect, useState } from 'react';
import api from '../api/axios';

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [formData, setFormData] = useState({
        device_names: '',
        mac_devices: '',
        tipe_device: '', // Contoh: BEACON atau SCANNER
        status: 1,
        rssi: 0
    });

    // 1. READ: Ambil data saat halaman dimuat
    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await api.get('/device'); // Memanggil index() di Laravel
            setDevices(res.data.data);
        } catch (err) {
            console.error("Gagal mengambil data", err);
        }
    };

    // 2. CREATE: Kirim data ke Laravel
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/device', formData); // Memanggil store() di Laravel
            alert("Device Berhasil Ditambahkan");
            setFormData({ device_names: '', mac_devices: '', tipe_device: '', status: 1, rssi: 0 });
            fetchDevices(); // Refresh list
        } catch (err) {
            alert("Gagal menambahkan device: " + err.response.data.message);
        }
    };

    // 3. DELETE: Hapus data
    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus device ini?")) {
            try {
                await api.delete(`/device/${id}`); // Memanggil destroy() di Laravel
                fetchDevices();
            } catch (err) {
                console.error("Gagal menghapus", err);
            }
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <h1 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Manage <span className="text-blue-600">Devices</span></h1>

            {/* Form Tambah Device */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-200 mb-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        className="p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Device Name (min 5 char)"
                        value={formData.device_names}
                        onChange={(e) => setFormData({...formData, device_names: e.target.value})}
                    />
                    <input 
                        className="p-4 bg-slate-100 rounded-2xl outline-none"
                        placeholder="MAC Address"
                        value={formData.mac_devices}
                        onChange={(e) => setFormData({...formData, mac_devices: e.target.value})}
                    />
                    <input 
                        className="p-4 bg-slate-100 rounded-2xl outline-none"
                        placeholder="Tipe Device (5-6 char)"
                        value={formData.tipe_device}
                        onChange={(e) => setFormData({...formData, tipe_device: e.target.value})}
                    />
                    <input 
                        type="number"
                        className="p-4 bg-slate-100 rounded-2xl outline-none"
                        placeholder="RSSI"
                        value={formData.rssi}
                        onChange={(e) => setFormData({...formData, rssi: e.target.value})}
                    />
                </div>
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all">
                    SIMPAN DEVICE BARU
                </button>
            </form>

            {/* Tabel Daftar Device */}
            <div className="bg-white rounded-[30px] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="p-4">Nama</th>
                            <th className="p-4">MAC</th>
                            <th className="p-4">Tipe</th>
                            <th className="p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((dev) => (
                            <tr key={dev.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-semibold">{dev.device_names}</td>
                                <td className="p-4 text-slate-500">{dev.mac_devices}</td>
                                <td className="p-4 uppercase text-xs font-bold">{dev.tipe_device}</td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleDelete(dev.id)}
                                        className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Devices;