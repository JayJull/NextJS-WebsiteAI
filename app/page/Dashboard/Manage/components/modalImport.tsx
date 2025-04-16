import { useState } from 'react';
import { read, utils } from 'xlsx';
import { toast } from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportModal = ({ isOpen, onClose, onImportSuccess }: ImportModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    imported: number;
    skipped: number;
    skippedItems: string[];
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      setImportResults(null);
      const file = event.target.files?.[0];
      
      if (!file) {
        toast.error('Please select a file');
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        throw new Error('File is empty');
      }

      const rawHeaders = jsonData[0] as string[];
      const headers = rawHeaders.map(header => 
        header?.toString().toLowerCase().trim()
      );
      
      console.log("Detected headers:", headers);

      const headerMappings = {
        name: ['name', 'nama', 'title', 'judul'],
        shortDesc: ['shortdesc', 'short desc', 'short_desc', 'shortdescription', 'short description', 'description', 'desc', 'deskripsi', 'deskripsi singkat'],
        url: ['url', 'link', 'website', 'alamat', 'address'],
        gambar: ['gambar', 'image', 'img', 'picture', 'foto', 'photo']
      };

      const headerMap = new Map();
      headers.forEach((header, index) => {
        if (!header) return;
        
        for (const [standardName, variations] of Object.entries(headerMappings)) {
          if (variations.includes(header)) {
            headerMap.set(index, standardName);
            break;
          }
        }

        if (!headerMap.has(index)) {
          headerMap.set(index, header);
        }
      });


      const requiredColumns = ['name', 'shortDesc', 'url', 'gambar'];
      const foundColumns = Array.from(headerMap.values());
      const missingColumns = requiredColumns.filter(col => 
        !foundColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        console.log("Found columns:", foundColumns);
        console.log("Missing columns:", missingColumns);
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      const rows = jsonData.slice(1) as any[];
      const transformedData = rows
        .filter(row => row.some((cell: any) => cell != null && cell !== ''))
        .map((row: any) => {
          const item: any = {};
          
          // Map data using the standardized header names
          headerMap.forEach((standardHeader, index) => {
            if (standardHeader === 'kategoriId') {
              const kategoriValue = row[index];
              item[standardHeader] = kategoriValue ? Number(kategoriValue) : 1;
              if (isNaN(item[standardHeader])) {
                item[standardHeader] = 1;
              }
            } else if (standardHeader === 'click') {
              const clickValue = row[index];
              item[standardHeader] = clickValue ? parseInt(clickValue) : 0;
              if (isNaN(item[standardHeader])) {
                item[standardHeader] = 0;
              }
            } else {
              item[standardHeader] = row[index] || '';
            }
          });

          
          if (!item.kategoriId) {
            item.kategoriId = 1;
          }

          return item;
        });

      if (transformedData.length === 0) {
        throw new Error('No valid data found in the import file');
      }

      console.log("Transformed data:", transformedData);

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: transformedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import data');
      }

      const result = await response.json();
      setImportResults({
        imported: result.imported,
        skipped: result.skipped,
        skippedItems: result.skippedItems || []
      });

      toast.success(`Import completed: ${result.imported} items imported, ${result.skipped} items skipped (duplicates)`);
      
      if (result.imported > 0) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Import Data
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload CSV or Excel File
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500 dark:text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Required columns: name, shortDesc, url, gambar
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Common column variations are also recognized (e.g., "nama", "description", "link", "image")
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Duplicate entries will be skipped (based on name or shortLink)
          </p>
        </div>

        {importResults && (
          <div className="mt-4 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Import Results:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ✅ {importResults.imported} items imported successfully
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ⚠️ {importResults.skipped} duplicate items skipped
            </p>
            
            {importResults.skipped > 0 && importResults.skippedItems.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Skipped items:</p>
                <div className="mt-1 max-h-32 overflow-y-auto text-xs text-gray-500 dark:text-gray-400">
                  {importResults.skippedItems.map((item, index) => (
                    <div key={index} className="mb-1">• {item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            {importResults ? 'Close' : 'Cancel'}
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Importing data...
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;