import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

interface ExportStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  progress?: number;
}

interface TableData {
  name: string;
  data: any[];
  rowCount: number;
}

const DataExporter: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    status: 'idle',
    message: ''
  });
  const [selectedTables, setSelectedTables] = useState<string[]>([
    'products',
    'categories',
    'users'
  ]);

  const availableTables = [
    { id: 'products', name: 'Products', description: 'All product data including images, categories, and metadata' },
    { id: 'categories', name: 'Categories', description: 'Product categories and their settings' },
    { id: 'users', name: 'Users', description: 'User accounts and profile information' },
    { id: 'product_analytics', name: 'Product Analytics', description: 'Product performance and activity data (view)' }
  ];

  const handleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const fetchTableData = async (tableName: string): Promise<TableData> => {
    try {
      let query = supabase.from(tableName).select('*');
      
      // Add specific ordering for better data organization
      switch (tableName) {
        case 'products':
          query = query.order('created_at', { ascending: false });
          break;
        case 'categories':
          query = query.order('sort_order', { ascending: true });
          break;
        case 'users':
          query = query.order('created_at', { ascending: false });
          break;
        case 'product_analytics':
          query = query.order('view_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
      }

      return {
        name: tableName,
        data: data || [],
        rowCount: data?.length || 0
      };
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  };

  const formatDataForExcel = (tableData: TableData): any[] => {
    if (tableData.data.length === 0) {
      return [{ Message: `No data available for ${tableData.name}` }];
    }

    return tableData.data.map(row => {
      const formattedRow: any = {};
      
      Object.keys(row).forEach(key => {
        let value = row[key];
        
        // Format different data types for Excel
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          // Convert objects/arrays to JSON strings
          value = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No';
        } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
          // Format timestamps
          try {
            const date = new Date(value);
            value = date.toLocaleString();
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }
        
        // Clean up column names for Excel
        const cleanKey = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        formattedRow[cleanKey] = value;
      });
      
      return formattedRow;
    });
  };

  const generateFileName = (): string => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    return `supabase_export_${dateStr}_${timeStr}.xlsx`;
  };

  const exportToExcel = async () => {
    if (selectedTables.length === 0) {
      setExportStatus({
        status: 'error',
        message: 'Please select at least one table to export.'
      });
      return;
    }

    setExportStatus({
      status: 'loading',
      message: 'Preparing export...',
      progress: 0
    });

    try {
      const workbook = XLSX.utils.book_new();
      const tableDataResults: TableData[] = [];
      
      // Fetch data from all selected tables
      for (let i = 0; i < selectedTables.length; i++) {
        const tableName = selectedTables[i];
        const progress = Math.round(((i + 1) / selectedTables.length) * 50); // First 50% for fetching
        
        setExportStatus({
          status: 'loading',
          message: `Fetching data from ${tableName}...`,
          progress
        });

        const tableData = await fetchTableData(tableName);
        tableDataResults.push(tableData);
      }

      // Create Excel sheets
      for (let i = 0; i < tableDataResults.length; i++) {
        const tableData = tableDataResults[i];
        const progress = 50 + Math.round(((i + 1) / tableDataResults.length) * 40); // Next 40% for processing
        
        setExportStatus({
          status: 'loading',
          message: `Creating Excel sheet for ${tableData.name}...`,
          progress
        });

        const formattedData = formatDataForExcel(tableData);
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Auto-size columns
        const colWidths: any[] = [];
        if (formattedData.length > 0) {
          Object.keys(formattedData[0]).forEach((key, index) => {
            const maxLength = Math.max(
              key.length,
              ...formattedData.map(row => String(row[key] || '').length)
            );
            colWidths[index] = { wch: Math.min(maxLength + 2, 50) }; // Max width of 50
          });
        }
        worksheet['!cols'] = colWidths;

        // Clean sheet name for Excel compatibility
        const sheetName = tableData.name
          .replace(/[^\w\s]/g, '')
          .substring(0, 31); // Excel sheet name limit

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Add summary sheet
      setExportStatus({
        status: 'loading',
        message: 'Creating summary sheet...',
        progress: 95
      });

      const summaryData = [
        { 'Export Information': 'Export Date', 'Value': new Date().toLocaleString() },
        { 'Export Information': 'Total Tables', 'Value': tableDataResults.length },
        { 'Export Information': 'Total Records', 'Value': tableDataResults.reduce((sum, table) => sum + table.rowCount, 0) },
        { 'Export Information': '', 'Value': '' },
        { 'Export Information': 'Table Details', 'Value': '' },
        ...tableDataResults.map(table => ({
          'Export Information': `${table.name} (rows)`,
          'Value': table.rowCount
        }))
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Export Summary');

      // Generate and download file
      setExportStatus({
        status: 'loading',
        message: 'Generating Excel file...',
        progress: 98
      });

      const fileName = generateFileName();
      XLSX.writeFile(workbook, fileName);

      setExportStatus({
        status: 'success',
        message: `Successfully exported ${tableDataResults.reduce((sum, table) => sum + table.rowCount, 0)} records from ${tableDataResults.length} tables to ${fileName}`,
        progress: 100
      });

      // Reset status after 5 seconds
      setTimeout(() => {
        setExportStatus({ status: 'idle', message: '' });
      }, 5000);

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        status: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });

      // Reset status after 10 seconds
      setTimeout(() => {
        setExportStatus({ status: 'idle', message: '' });
      }, 10000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Export Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Export your database tables to an Excel file (.xlsx) for backup or analysis.
        </p>
      </div>

      {/* Table Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Select Tables to Export</h4>
        <div className="space-y-3">
          {availableTables.map(table => (
            <label key={table.id} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTables.includes(table.id)}
                onChange={() => handleTableSelection(table.id)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {table.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {table.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Status */}
      {exportStatus.status !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          exportStatus.status === 'loading' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
          exportStatus.status === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
          'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {exportStatus.status === 'loading' && (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
            )}
            {exportStatus.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            )}
            {exportStatus.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                exportStatus.status === 'loading' ? 'text-blue-800 dark:text-blue-200' :
                exportStatus.status === 'success' ? 'text-green-800 dark:text-green-200' :
                'text-red-800 dark:text-red-200'
              }`}>
                {exportStatus.message}
              </p>
              {exportStatus.progress !== undefined && exportStatus.status === 'loading' && (
                <div className="mt-2">
                  <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    {exportStatus.progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} selected
        </div>
        <button
          onClick={exportToExcel}
          disabled={exportStatus.status === 'loading' || selectedTables.length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            exportStatus.status === 'loading' || selectedTables.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {exportStatus.status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>
            {exportStatus.status === 'loading' ? 'Exporting...' : 'Export Data'}
          </span>
        </button>
      </div>

      {/* Export Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h5 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Export Details:</h5>
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <li>• File format: Excel (.xlsx) with multiple sheets</li>
          <li>• Each table becomes a separate sheet</li>
          <li>• Includes summary sheet with export statistics</li>
          <li>• Timestamps are formatted for readability</li>
          <li>• JSON data is converted to text format</li>
          <li>• File name includes date and time: supabase_export_YYYYMMDD_HHMMSS.xlsx</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExporter;