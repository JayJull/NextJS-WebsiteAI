"use client";
import React, { useState } from "react";
import { FaFileCsv, FaFileExcel, FaFileAlt, FaSpinner } from "react-icons/fa";

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

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AI[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "json">("csv");
  const [includeFields, setIncludeFields] = useState({
    id: true,
    name: true,
    shortDesc: true,
    longDesc: true,
    url: true,
    shortLink: true,
    click: true,
    gambar: true,
    kategori: true,
  });
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleFieldToggle = (field: keyof typeof includeFields) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const filteredData = data.map((item) => {
        const filteredItem: Partial<AI> = {};
        
        if (includeFields.id) filteredItem.id = item.id;
        if (includeFields.name) filteredItem.name = item.name;
        if (includeFields.shortDesc) filteredItem.shortDesc = item.shortDesc;
        if (includeFields.longDesc) filteredItem.longDesc = item.longDesc;
        if (includeFields.url) filteredItem.url = item.url;
        if (includeFields.shortLink) filteredItem.shortLink = item.shortLink;
        if (includeFields.click) filteredItem.click = item.click;
        if (includeFields.gambar) filteredItem.gambar = item.gambar;
        if (includeFields.kategori) filteredItem.kategori = item.kategori;
        
        return filteredItem;
      });

      let fileContent = "";
      let filename = `ai_data_export_${new Date().toISOString().slice(0, 10)}`;
      let mimeType = "";

      switch (exportFormat) {
        case "csv":
          fileContent = convertToCSV(filteredData);
          filename += ".csv";
          mimeType = "text/csv";
          break;
        case "excel":
          fileContent = convertToCSV(filteredData);
          filename += ".xls";
          mimeType = "application/vnd.ms-excel";
          break;
        case "json":
          fileContent = JSON.stringify(filteredData, null, 2);
          filename += ".json";
          mimeType = "application/json";
          break;
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (items: Partial<AI>[]) => {
    if (items.length === 0) return "";
    const headers = Object.keys(items[0]);
    let csv = headers.join(",") + "\n";
    
    items.forEach(item => {
      const values = headers.map(header => {
        const value = item[header as keyof typeof item];

        if (header === "kategori" && value) {
          return `"${(value as Kategori).nama}"`;
        }
        
        // Handle strings that might contain commas
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        
        return value !== undefined && value !== null ? String(value) : "";
      });
      
      csv += values.join(",") + "\n";
    });
    
    return csv;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Export Data
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Format Export:</p>
          <div className="flex space-x-4">
            <button
              className={`flex items-center gap-2 p-3 rounded-lg ${
                exportFormat === "csv"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setExportFormat("csv")}
            >
              <FaFileCsv className="text-lg" />
              <span>CSV</span>
            </button>
            <button
              className={`flex items-center gap-2 p-3 rounded-lg ${
                exportFormat === "excel"
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setExportFormat("excel")}
            >
              <FaFileExcel className="text-lg" />
              <span>Excel</span>
            </button>
            <button
              className={`flex items-center gap-2 p-3 rounded-lg ${
                exportFormat === "json"
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setExportFormat("json")}
            >
              <FaFileAlt className="text-lg" />
              <span>JSON</span>
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Field yang akan diexport:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(includeFields).map(([field, included]) => (
              <div key={field} className="flex items-center">
                <input
                  type="checkbox"
                  id={`field-${field}`}
                  checked={included}
                  onChange={() => handleFieldToggle(field as keyof typeof includeFields)}
                  className="mr-2"
                />
                <label
                  htmlFor={`field-${field}`}
                  className="text-gray-700 dark:text-gray-300"
                >
                  {field === "kategori" ? "Kategori" : field}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`px-4 py-2 rounded-lg text-white ${
              exportSuccess
                ? "bg-green-500"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {exportSuccess ? (
              "Berhasil Diexport!"
            ) : exporting ? (
              <>
                <FaSpinner className="animate-spin inline mr-2" />
                Exporting...
              </>
            ) : (
              "Export"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;