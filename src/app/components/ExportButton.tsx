import { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, File } from 'lucide-react';
import { exportData, ExportColumn, ExportOptions } from '../utils/export-utils';

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
  subtitle?: string;
  metadata?: Record<string, string>;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
}

export function ExportButton({
  data,
  columns,
  filename,
  title,
  subtitle,
  metadata,
  variant = 'default',
  className = ''
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'word') => {
    setIsExporting(true);
    setShowMenu(false);

    const options: ExportOptions = {
      filename,
      title,
      subtitle,
      metadata,
      orientation: 'landscape'
    };

    try {
      // Petit délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 300));
      exportData(format, data, columns, options);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'exportation. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportFormats = [
    { 
      id: 'pdf' as const, 
      label: 'PDF', 
      icon: FileText,
      description: 'Document portable'
    },
    { 
      id: 'excel' as const, 
      label: 'Excel', 
      icon: FileSpreadsheet,
      description: 'Tableur Excel'
    },
    { 
      id: 'csv' as const, 
      label: 'CSV', 
      icon: Table,
      description: 'Données CSV'
    },
    { 
      id: 'word' as const, 
      label: 'Word', 
      icon: File,
      description: 'Document Word'
    }
  ];

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting || data.length === 0}
          className={`p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          title="Exporter les données"
        >
          <Download size={16} className={isExporting ? 'animate-pulse' : ''} />
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-sm shadow-lg z-50 overflow-hidden">
              {exportFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
                >
                  <format.icon size={16} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{format.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{format.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting || data.length === 0}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <Download size={12} className={isExporting ? 'animate-pulse' : ''} />
          <span>Exporter</span>
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-sm shadow-lg z-50 overflow-hidden">
              {exportFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
                >
                  <format.icon size={16} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{format.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{format.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Variant par défaut
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || data.length === 0}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-mono bg-[#1B3A6B] text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Download size={16} className={isExporting ? 'animate-pulse' : ''} />
        <span>{isExporting ? 'Export en cours...' : 'Exporter'}</span>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-sm shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-2 bg-secondary/50 border-b border-border">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Format d'export
              </p>
            </div>
            {exportFormats.map(format => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                  <format.icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{format.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{format.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
