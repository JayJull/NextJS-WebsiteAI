import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { createAi, getKategori } from "@/app/api/AiCard/route";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

interface Kategori {
  id: number;
  nama: string;
}

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newProduct: any) => void;
}

const AddDataModal: React.FC<AddDataModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    shortDesc: "",
    longDesc: "",
    url: "",
    shortLink: "",
    gambar: "",
    kategoriId: "",
  });
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorCharCount, setEditorCharCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getKategori();
        setCategories(data);
      } catch (error) {
        setError("Gagal mengambil data kategori");
      }
    };

    if (isOpen) {
      fetchCategories();
      setFormData({
        name: "",
        shortDesc: "",
        longDesc: "",
        url: "",
        shortLink: "",
        gambar: "",
        kategoriId: "",
      });
      setEditorCharCount(0);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    // Update shortLink when name changes
    if (formData.name) {
      const formatted = formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .substring(0, 50);
      setFormData((prev) => ({ ...prev, shortLink: formatted }));
    }
  }, [formData.name]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "shortDesc" && value.length > 500) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SunEditor options with responsive adjustments
  const editorOptions = {
    buttonList: [
      ["undo", "redo"],
      ["font", "fontSize", "formatBlock"],
      ["bold", "underline", "italic", "strike"],
      ["removeFormat"],
      ["fontColor", "hiliteColor"],
      ["align", "list"],
      ["table", "link", "image"],
      ["fullScreen", "codeView"],
    ],
    height: "auto",
    width: "100%",
    minHeight: "150px",
    maxHeight: "300px",
    placeholder: "Ketik deskripsi lengkap di sini...",
    resizingBar: false,
  };

  // Handle SunEditor content change
  const handleEditorChange = (content: string) => {
    // Strip HTML tags to count characters
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    setEditorCharCount(textContent.length);

    // Only update if within character limit
    setFormData((prev) => ({ ...prev, longDesc: content }));
  };

  // Handle submit logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const requiredFields = [
        "name",
        "shortDesc",
        "longDesc",
        "url",
        "shortLink",
        "gambar",
        "kategoriId",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof typeof formData]
      );

      if (missingFields.length > 0) {
        throw new Error("Semua field harus diisi");
      }

      // Ensure shortLink is sanitized correctly
      const sanitizedShortLink = formData.shortLink
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .substring(0, 50);

      const newProduct = await createAi({
        ...formData,
        shortLink: sanitizedShortLink,
        click: 0,
        kategoriId: parseInt(formData.kategoriId),
      });

      onSubmit(newProduct);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 sm:p-6 border-b dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Tambah AI
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Kolom Kiri pada layar lebih besar dari md */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    placeholder="Nama AI"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nama harus unik dan belum pernah digunakan sebelumnya.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL harus unik dan belum pernah digunakan sebelumnya.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi Singkat ({formData.shortDesc.length}/500)
                </label>
                <input
                  type="text"
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  maxLength={500}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="Deskripsi singkat"
                />
              </div>
            </div>

            {/* Kolom Kanan pada layar lebih besar dari md */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Gambar <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="gambar"
                  value={formData.gambar}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL Gambar harus unik dan belum pernah digunakan sebelumnya.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="kategoriId"
                  value={formData.kategoriId}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nama}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih kategori yang sesuai dengan AI.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Link
                </label>
                <input
                  type="text"
                  name="shortLink"
                  value={formData.shortLink}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Kolom Lebar untuk Deskripsi */}
            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="block text-sm md:text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi Lengkap
              </label>
              <div className="border rounded-lg overflow-hidden dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-600 focus-within:border-transparent">
                <SunEditor
                  setContents={formData.longDesc}
                  onChange={handleEditorChange}
                  setOptions={editorOptions}
                  setDefaultStyle="font-family: sans-serif; font-size: 14px;"
                  placeholder="Ketik Deskripsi Lengkap Disini"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                *Gunakan toolbar di atas untuk memformat teks
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
              disabled={loading}
            >
              {loading ? "Menambahkan..." : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDataModal;