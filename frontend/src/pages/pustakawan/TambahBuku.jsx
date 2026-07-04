import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import { createBook } from "../../services/book.api";
import { getCategories } from "../../services/category.api";
import { getRacks, createRack } from "../../services/rack.api";
import { useToast } from "../../components/ui/Toast";

export default function TambahBuku() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [racks, setRacks] = useState([]);

  const [form, setForm] = useState({
    isbn: "",
    judul: "",
    pengarang: "",
    penerbit: "",
    tahunTerbit: "",
    bahasa: "Indonesia",
    jumlahHalaman: "",
    deskripsi: "",
    coverUrl: "",
    stokTotal: "",
    stokTersedia: "",
    stokMinimum: "1",
    categoryId: "",
    rackId: "",
    jenisKoleksi: "FISIK",
    isDigital: false,
    fileUrl: "",
  });

  const [showRackModal, setShowRackModal] = useState(false);
  const [rackSaving, setRackSaving] = useState(false);

  const [rackForm, setRackForm] = useState({
    kodeRak: "",
    lokasi: "",
  });

  const fetchOptionData = async () => {
    try {
      const [categoryRes, rackRes] = await Promise.all([
        getCategories(),
        getRacks(),
      ]);

      setCategories(categoryRes.data.data || []);
      setRacks(rackRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOptionData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "isDigital" ? value === "true" : value,
    });
  };

  const handleRackChange = (e) => {
    setRackForm({
      ...rackForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateRack = async (e) => {
    e.preventDefault();

    if (!rackForm.kodeRak.trim()) {
      showToast("Kode rak wajib diisi", "error");
      return;
    }

    try {
      setRackSaving(true);

      const response = await createRack({
        kodeRak: rackForm.kodeRak.trim(),
        lokasi: rackForm.lokasi.trim() || undefined,
      });

      showToast("Rak berhasil ditambahkan", "success");

      const rackRes = await getRacks();
      setRacks(rackRes.data.data || []);

      const newRack = response.data.data;

      if (newRack?.id) {
        setForm((prev) => ({
          ...prev,
          rackId: String(newRack.id),
        }));
      }

      setRackForm({
        kodeRak: "",
        lokasi: "",
      });

      setShowRackModal(false);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menambahkan rak",
        "error"
      );
    } finally {
      setRackSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createBook(form);

      showToast("Buku berhasil ditambahkan", "success");
      navigate("/pustakawan/inventaris");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menambahkan buku",
        "error"
      );
    }
  };

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Tambah Buku Baru</h1>
        <p className="mt-1 text-gray-500">
          Masukkan data buku ke inventaris
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Input
            label="Judul Buku"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            required
          />

          <Input
            label="Pengarang"
            name="pengarang"
            value={form.pengarang}
            onChange={handleChange}
            required
          />

          <Input
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
          />

          <Input
            label="Penerbit"
            name="penerbit"
            value={form.penerbit}
            onChange={handleChange}
          />

          <Input
            label="Tahun Terbit"
            name="tahunTerbit"
            type="number"
            value={form.tahunTerbit}
            onChange={handleChange}
          />

          <Input
            label="Bahasa"
            name="bahasa"
            value={form.bahasa}
            onChange={handleChange}
          />

          <Input
            label="Jumlah Halaman"
            name="jumlahHalaman"
            type="number"
            value={form.jumlahHalaman}
            onChange={handleChange}
          />

          <Input
            label="URL Cover"
            name="coverUrl"
            value={form.coverUrl}
            onChange={handleChange}
          />

          <Input
            label="Stok Total"
            name="stokTotal"
            type="number"
            value={form.stokTotal}
            onChange={handleChange}
            required
          />

          <Input
            label="Stok Tersedia"
            name="stokTersedia"
            type="number"
            value={form.stokTersedia}
            onChange={handleChange}
          />

          <Input
            label="Stok Minimum"
            name="stokMinimum"
            type="number"
            value={form.stokMinimum}
            onChange={handleChange}
          />

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kategori
            </label>

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border px-4 outline-none focus:border-yellow-400"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold">Rak</label>

              <button
                type="button"
                onClick={() => setShowRackModal(true)}
                className="flex items-center gap-1 rounded-lg bg-yellow-100 px-3 py-1 text-xs font-bold text-black hover:bg-yellow-200"
              >
                <Plus size={14} />
                Tambah Rak
              </button>
            </div>

            <select
              name="rackId"
              value={form.rackId}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border px-4 outline-none focus:border-yellow-400"
            >
              <option value="">Pilih rak</option>
              {racks.map((rack) => (
                <option key={rack.id} value={rack.id}>
                  {rack.kodeRak} {rack.lokasi ? `- ${rack.lokasi}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Jenis Koleksi
            </label>

            <select
              name="jenisKoleksi"
              value={form.jenisKoleksi}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border px-4 outline-none focus:border-yellow-400"
            >
              <option value="FISIK">Buku Fisik</option>
              <option value="EBOOK">E-Book</option>
              <option value="JURNAL">Jurnal</option>
              <option value="E_JOURNAL">E-Journal</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Koleksi Digital?
            </label>

            <select
              name="isDigital"
              value={String(form.isDigital)}
              onChange={handleChange}
              className="h-12 w-full rounded-xl border px-4 outline-none focus:border-yellow-400"
            >
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </select>
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-semibold">
              URL File Digital
            </label>

            <input
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="Contoh: link PDF e-book / jurnal"
              className="h-12 w-full rounded-xl border px-4 outline-none focus:border-yellow-400"
            />
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-semibold">
              Deskripsi
            </label>

            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows="5"
              className="w-full rounded-xl border p-4 outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/pustakawan/inventaris")}
            className="rounded-xl border px-6 py-3 font-semibold"
          >
            Batal
          </button>

          <button className="rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black">
            Simpan Buku
          </button>
        </div>
      </form>

      {showRackModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-black">Tambah Rak</h2>

            <p className="mt-1 text-sm text-gray-500">
              Tambahkan lokasi rak buku baru
            </p>

            <form onSubmit={handleCreateRack} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Kode Rak
                </label>

                <input
                  name="kodeRak"
                  value={rackForm.kodeRak}
                  onChange={handleRackChange}
                  placeholder="Contoh: A03-A05"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Lokasi
                </label>

                <input
                  name="lokasi"
                  value={rackForm.lokasi}
                  onChange={handleRackChange}
                  placeholder="Contoh: Rak Komputer"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRackModal(false)}
                  className="h-12 rounded-xl border border-gray-300 font-bold text-black"
                >
                  Batal
                </button>

                <button
                  disabled={rackSaving}
                  className="h-12 rounded-xl bg-yellow-400 font-bold text-black"
                >
                  {rackSaving ? "Menyimpan..." : "Simpan Rak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full rounded-xl border px-4 outline-none focus:border-yellow-400"
      />
    </div>
  );
}