import { useState } from 'react';
import { read, utils } from 'xlsx';
import { toast } from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface PreviewData {
  valid: any[];
  invalid: any[];
  headers: string[];
}

const ImportModal = ({ isOpen, onClose, onImportSuccess }: ImportModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    imported: number;
    skipped: number;
    skippedItems: string[];
  } | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [transformedData, setTransformedData] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      setImportResults(null);
      setPreviewData(null);
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
      const transformed = rows
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

      if (transformed.length === 0) {
        throw new Error('No valid data found in the import file');
      }

      // Validate data
      const valid = [];
      const invalid = [];
      
      for (const item of transformed) {
        if (!item.name || !item.shortDesc || !item.url || !item.gambar) {
          invalid.push({...item, validationError: 'Missing required fields'});
        } else {
          valid.push(item);
        }
      }

      setTransformedData(valid);
      setPreviewData({
        valid,
        invalid,
        headers: requiredColumns.concat(
          Array.from(headerMap.values()).filter(h => !requiredColumns.includes(h as string))
        )
      });

      console.log("Preview data:", {valid, invalid});
      
    } catch (error) {
      console.error('Import validation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to validate import data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
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
      
      // Reset preview data
      setPreviewData(null);
      
      if (result.imported > 0) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setPreviewData(null);
    setImportResults(null);
    onClose();
  };

  const renderPreviewTable = () => {
    if (!previewData) return null;
    
    return (
      <div className="mt-4 overflow-hidden">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Data Preview ({previewData.valid.length} valid items)</h3>
        <div className="max-h-64 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {previewData.headers.map((header, index) => (
                  <th 
                    key={index}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {previewData.valid.slice(0, 5).map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {previewData.headers.map((header, colIndex) => (
                    <td 
                      key={`${rowIndex}-${colIndex}`}
                      className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400"
                    >
                      {item[header] !== undefined ? String(item[header]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
              {previewData.valid.length > 5 && (
                <tr>
                  <td 
                    colSpan={previewData.headers.length}
                    className="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400"
                  >
                    ... and {previewData.valid.length - 5} more items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {previewData.invalid.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">
              Invalid Items ({previewData.invalid.length})
            </h3>
            <div className="max-h-32 overflow-y-auto bg-red-50 dark:bg-red-900/20 p-2 rounded">
              <ul className="text-xs text-red-600 dark:text-red-400">
                {previewData.invalid.map((item, index) => (
                  <li key={index} className="mb-1">
                    • {item.name || 'Unnamed item'}: {item.validationError}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Invalid items will be skipped during import
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {previewData ? 'Validate Import Data' : 'Import Data'}
        </h2>
        
        {!previewData && !importResults && (
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
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {previewData && renderPreviewTable()}

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

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading || isImporting}
          >
            {importResults ? 'Close' : 'Cancel'}
          </button>
          
          {previewData && !importResults && (
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isImporting || previewData.valid.length === 0}
            >
              {isImporting ? 'Importing...' : `Import ${previewData.valid.length} Items`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;