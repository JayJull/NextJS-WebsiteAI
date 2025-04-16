import React, { useState, useEffect } from "react";
import { getKategori, updateAi, getAi } from "@/app/api/AiCard/route";
import { X, AlertCircle } from "lucide-react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

interface Kategori {
  id: number;
  nama: string;
}

interface AI {
  id: number;
  name: string;
  shortDesc: string;
  longDesc: string;
  url: string;
  shortLink: string | null;
  click: number;
  gambar: string;
  kategori: Kategori;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedProduct: AI) => void;
  currentData: AI | null;
}

const EditDataModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    shortDesc: "",
    longDesc: "",
    url: "",
    shortLink: "",
    click: 0,
    gambar: "",
    kategoriId: 0,
  });
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allAiData, setAllAiData] = useState<AI[]>([]);
  const [editorCharCount, setEditorCharCount] = useState(0);

  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name,
        shortDesc: currentData.shortDesc,
        longDesc: currentData.longDesc,
        url: currentData.url,
        shortLink: currentData.shortLink || "",
        click: currentData.click,
        gambar: currentData.gambar,
        kategoriId: currentData.kategori.id,
      });
    }
  }, [currentData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, aiData] = await Promise.all([
          getKategori(),
          getAi(),
        ]);
        setCategories(categoriesData);
        setAllAiData(aiData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

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

  const handleEditorChange = (content: string) => {
    // Strip HTML tags to count characters
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    setEditorCharCount(textContent.length);
    
    setFormData((prev) => ({ ...prev, longDesc: content }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "shortDesc" && value.length > 500) return;

    if (name === "kategoriId" && value !== "") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else if (name === "shortLink") {
      const formattedValue = value.replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const checkDuplicateShortLink = (): boolean => {
    if (!formData.shortLink || formData.shortLink.trim() === "") return false;

    const duplicate = allAiData.find(
      (ai) => ai.shortLink === formData.shortLink && ai.id !== currentData?.id
    );

    return !!duplicate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check for duplicate shortLink
    if (checkDuplicateShortLink()) {
      setError(
        "Short link ini sudah digunakan. Mohon gunakan short link yang lain."
      );
      return;
    }

    setLoading(true);

    try {
      if (!currentData) return;

      const updatedData = await updateAi({
        id: currentData.id,
        ...formData,
      });

      onSubmit(updatedData);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Gagal mengupdate data"
      );
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
              Edit AI
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="Nama AI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://example.com"
                />
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Gambar
                </label>
                <input
                  type="url"
                  name="gambar"
                  value={formData.gambar}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Link
                </label>
                <input
                  type="text"
                  name="shortLink"
                  value={formData.shortLink}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  placeholder="Short link (spasi akan otomatis menjadi tanda -)"
                />
                {formData.shortLink && checkDuplicateShortLink() && (
                  <p className="mt-1 text-sm text-red-600">
                    Short link ini sudah digunakan. Mohon gunakan short link
                    yang lain.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <label className="block text-sm md:text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi Lengkap
            </label>
            <div className="border rounded-lg overflow-hidden dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-600 focus-within:border-transparent">
              <SunEditor
                setContents={formData.longDesc}
                onChange={handleEditorChange}
                setOptions={editorOptions}
                setDefaultStyle="font-family: sans-serif; font-size: 14px;"
                placeholder="Tulis deskripsi lengkap di sini..."
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Gunakan Toolbar Diatas | Maksimal 1500 karakter
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
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDataModal;