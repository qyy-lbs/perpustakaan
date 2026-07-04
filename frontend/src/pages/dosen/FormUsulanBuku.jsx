import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { createSuggestion } from "../../services/suggestion.api";
import { useToast } from "../../components/ui/Toast";

export default function FormUsulanBuku() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    judul: "",
    penulis: "",
    penerbit: "",
    tahunTerbit: "",
    kategori: "",
    mataKuliah: "",
    alasan: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createSuggestion(form);

      showToast("Usulan buku berhasil dikirim", "success");
      navigate("/dosen/usulan");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengirim usulan buku",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout role="dosen">
      <div className="min-h-screen bg-white px-7 pt-10">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-base font-bold">Form Usulan Buku</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5 pb-28">
          <Input
            label="Judul Buku"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            required
          />

          <Input
            label="Penulis"
            name="penulis"
            value={form.penulis}
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

          <Input
            label="Kategori"
            name="kategori"
            value={form.kategori}
            onChange={handleChange}
          />

          <Input
            label="Mata Kuliah"
            name="mataKuliah"
            value={form.mataKuliah}
            onChange={handleChange}
          />

          <div>
            <label className="mb-2 block text-sm font-bold">
              Alasan Usulan
            </label>

            <textarea
              name="alasan"
              value={form.alasan}
              onChange={handleChange}
              rows="6"
              className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:border-yellow-400"
              placeholder="Tuliskan alasan kebutuhan buku ini"
            />
          </div>

          <button
            disabled={loading}
            className="h-14 w-full rounded-xl bg-yellow-400 font-bold text-black"
          >
            {loading ? "Mengirim..." : "Kirim Usulan"}
          </button>
        </form>
      </div>
    </MobileLayout>
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
      <label className="mb-2 block text-sm font-bold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-yellow-400"
      />
    </div>
  );
}