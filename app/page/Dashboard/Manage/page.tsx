"use client";
import { Layout } from "@/app/components/dashboard/Layout";
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaFileImport, FaFileExport } from "react-icons/fa";
import { deleteAi, getAi } from "@/app/api/AiCard/route";
import AddDataModal from "./components/modalAdd";
import UpdateDataModal from "./components/modalUpdate";
import ImportModal from "./components/modalImport";
import DeleteConfirmationModal from "./components/modaDelete";
import dynamic from "next/dynamic";

const ExportModal = dynamic(() => import("./components/modalExport"), {
  ssr: false,
});

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

const ProductTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [ais, setAis] = useState<AI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<AI | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, name: string} | null>(null);

  const fetchData = async () => {
    try {
      const data = await getAi();
      setAis(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = (newProduct: AI) => {
    setAis((prevAis) => [...prevAis, newProduct]);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsAddModalOpen(true);
  };

  const filteredData = ais.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleEdit = (id: number) => {
    const itemToEdit = ais.find((item) => item.id === id);
    if (itemToEdit) {
      setCurrentEditItem(itemToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (updatedProduct: AI) => {
    setAis((prevAis) =>
      prevAis.map((ai) => (ai.id === updatedProduct.id ? updatedProduct : ai))
    );
    setIsEditModalOpen(false);
    setCurrentEditItem(null);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteAi(itemToDelete.id);
      setAis((prevAis) => prevAis.filter((item) => item.id !== itemToDelete.id));
      console.log("Item dengan id", itemToDelete.id, "berhasil dihapus.");
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus item:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Tambah
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileImport className="text-sm" />
              Import
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExport className="text-sm" />
              Export
            </button>
          </div>

          <AddDataModal
            isOpen={isAddModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleAddProduct}
          />

          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImportSuccess={fetchData}
          />

          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            data={ais}
          />

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
              <span className="text-gray-600 dark:text-gray-300">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                placeholder="Cari..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">No</th>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">Nama</th>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">Url</th>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">ShortLink</th>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">Click</th>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">Kategori</th>
                <th className="px-6 py-3 text-gray-600 dark:text-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {paginatedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{item.name}</td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{item.url}</td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{item.shortLink}</td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{item.click}</td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{item.kategori.nama}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <FaEdit className="text-sm" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id, item.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <FaTrash className="text-sm" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-600 dark:text-gray-300">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              {currentPage}
            </button>
            <button
              onClick={handleNextPage}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <UpdateDataModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentEditItem(null);
          }}
          onSubmit={handleEditSubmit}
          currentData={currentEditItem}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
      />
    </Layout>
  );
};

export default ProductTable;