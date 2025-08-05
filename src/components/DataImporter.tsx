import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, FileText, Database, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';

interface ImportStatus {
  status: 'idle' | 'parsing' | 'confirming' | 'importing' | 'success' | 'error';
  message: string;
  progress?: number;
}

interface ParsedData {
  tableName: string;
  data: any[];
  columns: string[];
  rowCount: number;
  preview: any[];
}

interface ImportSummary {
  tableName: string;
  totalRows: number;
  insertedRows: number;
  errors: string[];
  onImportComplete?: () => void;
}

const DataImporter: React.FC<DataImporterProps> = ({ onImportComplete }) => {
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    status: 'idle',
    message: ''
  });
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'upsert'>('replace');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTables = [
    { id: 'products', name: 'Products', primaryKey: 'id' },
    { id: 'categories', name: 'Categories', primaryKey: 'id' },
    { id: 'users', name: 'Users', primaryKey: 'id' }
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({
      status: 'parsing',
      message: 'Parsing file...',
      progress: 0
    });

    try {
      let data: any[] = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Parse Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // Use first sheet or let user select
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convert array of arrays to array of objects
        if (data.length > 0) {
          const headers = data[0] as string[];
          data = data.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || null;
            });
            return obj;
          });
        }
      } else if (fileName.endsWith('.csv')) {
        // Parse CSV file
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        });
        
        if (result.errors.length > 0) {
          throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
        }
        
        data = result.data;
      } else {
        throw new Error('Unsupported file format. Please use .xlsx, .xls, or .csv files.');
      }

      if (data.length === 0) {
        throw new Error('No data found in the file.');
      }

      // Auto-detect table name from filename or columns
      let detectedTable = '';
      const fileBaseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
      
      if (availableTables.some(t => fileBaseName.includes(t.id))) {
        detectedTable = availableTables.find(t => fileBaseName.includes(t.id))?.id || '';
      } else {
        // Try to detect from columns
        const columns = Object.keys(data[0]).map(k => k.toLowerCase());
        if (columns.includes('title') && columns.includes('image')) {
          detectedTable = 'products';
        } else if (columns.includes('label') && columns.includes('sort_order')) {
          detectedTable = 'categories';
        } else if (columns.includes('email') && columns.includes('role')) {
          detectedTable = 'users';
        }
      }

      const columns = Object.keys(data[0]);
      const preview = data.slice(0, 5); // First 5 rows for preview

      setParsedData({
        tableName: detectedTable,
        data,
        columns,
        rowCount: data.length,
        preview
      });

      setSelectedTable(detectedTable);
      
      setImportStatus({
        status: 'confirming',
        message: `Parsed ${data.length} rows with ${columns.length} columns. Please review and confirm import settings.`
      });

    } catch (error) {
      console.error('File parsing error:', error);
      setImportStatus({
        status: 'error',
        message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      // Reset after 10 seconds
      setTimeout(() => {
        setImportStatus({ status: 'idle', message: '' });
        setParsedData(null);
      }, 10000);
    }
  };

  const normalizeColumnName = (columnName: string): string => {
    return columnName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const transformDataForTable = (data: any[], tableName: string): any[] => {
    return data.map(row => {
      const transformedRow: any = {};
      
      Object.keys(row).forEach(key => {
        const normalizedKey = normalizeColumnName(key);
        let value = row[key];
        
        // Handle null/empty values
        if (value === null || value === undefined || value === '') {
          value = null;
        }
        
        // Transform based on table and column
        if (tableName === 'products') {
          switch (normalizedKey) {
            case 'featured':
            case 'active':
            case 'is_deleted':
              value = value === true || value === 'true' || value === 'Yes' || value === '1';
              break;
            case 'sort_order':
            case 'view_count':
              value = parseInt(value) || 0;
              break;
            case 'created_at':
            case 'updated_at':
            case 'last_activity':
              if (value && typeof value === 'string') {
                try {
                  value = new Date(value).toISOString();
                } catch (e) {
                  value = new Date().toISOString();
                }
              }
              break;
            case 'activity_log':
              if (typeof value === 'string') {
                try {
                  value = JSON.parse(value);
                } catch (e) {
                  value = [];
                }
              }
              break;
          }
        } else if (tableName === 'categories') {
          switch (normalizedKey) {
            case 'disabled':
              value = value === true || value === 'true' || value === 'Yes' || value === '1';
              break;
            case 'sort_order':
              value = parseInt(value) || 0;
              break;
          }
        } else if (tableName === 'users') {
          switch (normalizedKey) {
            case 'created_at':
            case 'updated_at':
              if (value && typeof value === 'string') {
                try {
                  value = new Date(value).toISOString();
                } catch (e) {
                  value = new Date().toISOString();
                }
              }
              break;
          }
        }
        
        transformedRow[normalizedKey] = value;
      });
      
      return transformedRow;
    });
  };

  const performImport = async () => {
    if (!parsedData || !selectedTable) return;

    setImportStatus({
      status: 'importing',
      message: 'Starting import...',
      progress: 0
    });

    try {
      const transformedData = transformDataForTable(parsedData.data, selectedTable);
      let insertedRows = 0;
      const errors: string[] = [];

      if (importMode === 'replace') {
        // Truncate table first
        setImportStatus({
          status: 'importing',
          message: `Clearing existing data from ${selectedTable} table...`,
          progress: 10
        });

        const { error: deleteError } = await supabase!
          .from(selectedTable)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep system records

        if (deleteError) {
          throw new Error(`Failed to clear table: ${deleteError.message}`);
        }
      }

      // Insert data in batches
      const batchSize = 100;
      const totalBatches = Math.ceil(transformedData.length / batchSize);

      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        setImportStatus({
          status: 'importing',
          message: `Importing batch ${batchNumber} of ${totalBatches}...`,
          progress: 10 + Math.round((batchNumber / totalBatches) * 80)
        });

        try {
          if (importMode === 'upsert') {
            const { error } = await supabase!
              .from(selectedTable)
              .upsert(batch, { onConflict: availableTables.find(t => t.id === selectedTable)?.primaryKey || 'id' });
            
            if (error) throw error;
          } else {
            const { error } = await supabase!
              .from(selectedTable)
              .insert(batch);
            
            if (error) throw error;
          }
          
          insertedRows += batch.length;
        } catch (error) {
          const errorMsg = `Batch ${batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('Batch import error:', error);
        }
      }

      const summary: ImportSummary = {
        tableName: selectedTable,
        totalRows: parsedData.rowCount,
        insertedRows,
        errors
      };

      setImportSummary(summary);

      setImportStatus({
        status: 'success',
        message: `Import completed! ${insertedRows} of ${parsedData.rowCount} rows imported successfully.`,
        progress: 100
      });

      // Reset form
      setParsedData(null);
      setSelectedTable('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call completion callback if provided
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({
        status: 'error',
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
    }
  };

  const resetImport = () => {
    setImportStatus({ status: 'idle', message: '' });
    setParsedData(null);
    setSelectedTable('');
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Import Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload Excel (.xlsx) or CSV files to replace or update table data.
        </p>
      </div>

      {/* File Upload */}
      {importStatus.status === 'idle' && (
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Choose file to import
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Supports Excel (.xlsx, .xls) and CSV (.csv) files
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Import Configuration */}
      {importStatus.status === 'confirming' && parsedData && (
        <div className="space-y-6">
          {/* Table Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Table
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select table...</option>
              {availableTables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          {/* Import Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Import Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) => setImportMode(e.target.value as 'replace' | 'upsert')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Replace (Clear table and insert all data)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upsert"
                  checked={importMode === 'upsert'}
                  onChange={(e) => setImportMode(e.target.value as 'replace' | 'upsert')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Upsert (Update existing, insert new)
                </span>
              </label>
            </div>
          </div>

          {/* Data Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Preview ({parsedData.rowCount} rows, {parsedData.columns.length} columns)
            </h4>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {parsedData.columns.map((column, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {parsedData.preview.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {parsedData.columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate"
                          >
                            {String(row[column] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Warning */}
          {importMode === 'replace' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Warning: This will permanently delete all existing data
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Replace mode will clear the entire {selectedTable} table before importing new data. 
                    This action cannot be undone. Consider exporting your current data first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={resetImport}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={performImport}
              disabled={!selectedTable}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                !selectedTable
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  : importMode === 'replace'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>
                {importMode === 'replace' ? 'Replace Data' : 'Upsert Data'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Import Status */}
      {(importStatus.status === 'parsing' || importStatus.status === 'importing') && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {importStatus.message}
              </p>
              {importStatus.progress !== undefined && (
                <div className="mt-2">
                  <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    {importStatus.progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Status */}
      {importStatus.status === 'success' && importSummary && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {importStatus.message}
                </p>
              </div>
            </div>
          </div>

          {/* Import Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Import Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Table:</span>
                <span className="font-medium text-gray-900 dark:text-white">{importSummary.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Rows:</span>
                <span className="font-medium text-gray-900 dark:text-white">{importSummary.totalRows}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Successfully Imported:</span>
                <span className="font-medium text-green-600">{importSummary.insertedRows}</span>
              </div>
              {importSummary.errors.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Errors:</span>
                  <span className="font-medium text-red-600">{importSummary.errors.length}</span>
                </div>
              )}
            </div>

            {importSummary.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-medium text-red-800 dark:text-red-200 mb-2">Error Details:</h5>
                <div className="max-h-32 overflow-y-auto">
                  {importSummary.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-700 dark:text-red-300 mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={resetImport}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Import Another File
          </button>
        </div>
      )}

      {/* Error Status */}
      {importStatus.status === 'error' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {importStatus.message}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={resetImport}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Import Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h5 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Import Guidelines:</h5>
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <li>• File formats: Excel (.xlsx, .xls) or CSV (.csv)</li>
          <li>• First row should contain column headers</li>
          <li>• Column names will be normalized (spaces → underscores, lowercase)</li>
          <li>• Boolean values: true/false, Yes/No, 1/0</li>
          <li>• Dates: ISO format (YYYY-MM-DD) or standard formats</li>
          <li>• Replace mode: Clears table completely before import</li>
          <li>• Upsert mode: Updates existing records, inserts new ones</li>
          <li>• Large files are processed in batches for better performance</li>
        </ul>
      </div>
    </div>
  );
};

export default DataImporter;