import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import { getBookById, updateBook } from "../../services/book.api";
import { getCategories } from "../../services/category.api";
import { getRacks, createRack } from "../../services/rack.api";
import { useToast } from "../../components/ui/Toast";

export default function EditBuku() {
  const { id } = useParams();
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
    bahasa: "",
    jumlahHalaman: "",
    deskripsi: "",
    coverUrl: "",
    stokTotal: "",
    stokTersedia: "",
    stokMinimum: "",
    categoryId: "",
    rackId: "",
    jenisKoleksi: "FISIK",
    isDigital: false,
    fileUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showRackModal, setShowRackModal] = useState(false);
  const [rackSaving, setRackSaving] = useState(false);

  const [rackForm, setRackForm] = useState({
    kodeRak: "",
    lokasi: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [bookRes, categoryRes, rackRes] = await Promise.all([
        getBookById(id),
        getCategories(),
        getRacks(),
      ]);

      const book = bookRes.data.data;

      setForm({
        isbn: book.isbn || "",
        judul: book.judul || "",
        pengarang: book.pengarang || "",
        penerbit: book.penerbit || "",
        tahunTerbit: book.tahunTerbit || "",
        bahasa: book.bahasa || "",
        jumlahHalaman: book.jumlahHalaman || "",
        deskripsi: book.deskripsi || "",
        coverUrl: book.coverUrl || "",
        stokTotal: book.stokTotal || "",
        stokTersedia: book.stokTersedia || "",
        stokMinimum: book.stokMinimum || "",
        categoryId: book.categoryId || "",
        rackId: book.rackId || "",
        jenisKoleksi: book.jenisKoleksi || "FISIK",
        isDigital: book.isDigital || false,
        fileUrl: book.fileUrl || "",
      });

      setCategories(categoryRes.data.data || []);
      setRacks(rackRes.data.data || []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengambil data buku",
        "error"
      );
      navigate("/pustakawan/inventaris");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
      setSaving(true);

      await updateBook(id, form);

      showToast("Buku berhasil diperbarui", "success");
      navigate("/pustakawan/inventaris");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal memperbarui buku",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const isAvailable = Number(form.stokTersedia || 0) > 0;

  if (loading) {
    return (
      <StaffLayout>
        <p>Memuat data buku...</p>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Edit Buku</h1>
        <p className="mt-1 text-gray-500">Perbarui data buku inventaris</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-8 shadow-sm xl:grid-cols-[1fr_1fr_260px]"
      >
        <div className="space-y-4">
          <Input
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
          />

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

          <Select
            label="Kategori"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nama}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-bold">Lokasi Rak</label>

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
              className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-yellow-400"
            >
              <option value="">Pilih Rak</option>
              {racks.map((rack) => (
                <option key={rack.id} value={rack.id}>
                  {rack.kodeRak} {rack.lokasi ? `- ${rack.lokasi}` : ""}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Stok"
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

          <div>
            <label className="mb-2 block text-sm font-bold">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows="5"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-yellow-400"
            />
          </div>

          <Select
            label="Jenis Koleksi"
            name="jenisKoleksi"
            value={form.jenisKoleksi}
            onChange={handleChange}
          >
            <option value="FISIK">Buku Fisik</option>
            <option value="EBOOK">E-Book</option>
            <option value="JURNAL">Jurnal</option>
            <option value="E_JOURNAL">E-Journal</option>
          </Select>

          <Select
            label="Koleksi Digital?"
            name="isDigital"
            value={String(form.isDigital)}
            onChange={handleChange}
          >
            <option value="false">Tidak</option>
            <option value="true">Ya</option>
          </Select>

          <Input
            label="URL File Digital"
            name="fileUrl"
            value={form.fileUrl}
            onChange={handleChange}
            placeholder="Link PDF / e-book / jurnal"
          />
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-300 p-5">
            <h2 className="mb-4 font-bold">Sampul Buku</h2>

            <div className="mx-auto flex h-40 w-28 items-center justify-center overflow-hidden bg-gray-100">
              {form.coverUrl ? (
                <img
                  src={form.coverUrl}
                  alt={form.judul}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No Cover</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("coverUrlInput")?.focus()}
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-yellow-100 text-sm font-bold text-black"
            >
              <Upload size={16} />
              Ganti Sampul
            </button>

            <p className="mt-2 text-center text-[11px] text-gray-500">
              Format: JPG, PNG. Maks 2MB
            </p>

            <input
              id="coverUrlInput"
              name="coverUrl"
              value={form.coverUrl}
              onChange={handleChange}
              placeholder="URL Cover"
              className="mt-4 h-10 w-full rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-yellow-400"
            />
          </div>

          <div className="rounded-xl border border-gray-300 p-5">
            <h2 className="mb-4 font-bold">Status Buku</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    isAvailable ? "bg-yellow-400" : "border border-red-300"
                  }`}
                />
                <span>Tersedia</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    !isAvailable ? "bg-red-400" : "border border-red-300"
                  }`}
                />
                <span>Tidak Tersedia</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/pustakawan/inventaris")}
              className="h-12 flex-1 rounded-lg border border-gray-400 font-bold"
            >
              Batal
            </button>

            <button
              disabled={saving}
              className="h-12 flex-1 rounded-lg bg-yellow-400 font-bold text-white"
            >
              {saving ? "Menyimpan..." : "Perbarui"}
            </button>
          </div>
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
                <label className="mb-2 block text-sm font-bold">Lokasi</label>

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
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-yellow-400"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-yellow-400"
      >
        {children}
      </select>
    </div>
  );
}