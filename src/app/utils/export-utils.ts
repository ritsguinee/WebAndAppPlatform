import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Types pour les données d'exportation
export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  metadata?: Record<string, string>;
}

// Exporter en PDF
export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // En-tête du document
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Logo / Titre
  doc.setFontSize(18);
  doc.setTextColor(27, 58, 107); // Bleu marine #1B3A6B
  doc.text('SNRR-Mamou', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Commune Urbaine de Mamou · République de Guinée', pageWidth / 2, 21, { align: 'center' });
  
  // Titre du rapport
  if (options.title) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(options.title, pageWidth / 2, 30, { align: 'center' });
  }
  
  // Sous-titre
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(options.subtitle, pageWidth / 2, 36, { align: 'center' });
  }

  // Métadonnées
  let yPosition = options.subtitle ? 42 : (options.title ? 36 : 28);
  if (options.metadata) {
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    Object.entries(options.metadata).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, yPosition);
      yPosition += 4;
    });
    yPosition += 2;
  }

  // Préparer les données pour le tableau
  const tableData = data.map(row => 
    columns.map(col => row[col.key] ?? '')
  );

  // Générer le tableau
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: yPosition,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [27, 58, 107], // Bleu marine
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [254, 252, 248] // Crème parchemin
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as any),
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    didDrawPage: (data) => {
      // Pied de page
      const pageCount = doc.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${currentPage} / ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }
  });

  // Sauvegarder le fichier
  doc.save(`${options.filename}.pdf`);
}

// Exporter en Excel
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  // Préparer les données
  const worksheetData = [
    // En-tête avec titre
    options.title ? [options.title] : [],
    options.subtitle ? [options.subtitle] : [],
    [''], // Ligne vide
    // Métadonnées
    ...(options.metadata ? Object.entries(options.metadata).map(([key, value]) => [`${key}: ${value}`]) : []),
    [''], // Ligne vide
    // En-têtes de colonnes
    columns.map(col => col.header),
    // Données
    ...data.map(row => columns.map(col => row[col.key] ?? ''))
  ].filter(row => row.length > 0);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Styliser les en-têtes (largeur de colonnes)
  const columnWidths = columns.map(col => ({
    wch: col.width ? col.width / 2 : 15 // Conversion approximative mm -> caractères
  }));
  worksheet['!cols'] = columnWidths;

  // Créer le classeur
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');

  // Exporter
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

// Exporter en CSV
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  // Créer l'en-tête CSV
  const headers = columns.map(col => col.header).join(',');
  
  // Créer les lignes de données
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key] ?? '';
      // Échapper les guillemets et encapsuler si nécessaire
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  // Combiner tout
  const csv = [headers, ...rows].join('\n');

  // Créer un blob et télécharger
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM pour UTF-8
  saveAs(blob, `${options.filename}.csv`);
}

// Exporter en format Word (via HTML)
export function exportToWord(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  // Créer le contenu HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: 'Calibri', sans-serif; 
          margin: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1B3A6B;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 12px;
          margin: 2px 0;
        }
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
        }
        .subtitle {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }
        .metadata {
          font-size: 11px;
          color: #555;
          margin-bottom: 20px;
        }
        .metadata p {
          margin: 3px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #1B3A6B;
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #FEFCF8;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SNRR-Mamou</h1>
        <p>Commune Urbaine de Mamou · République de Guinée</p>
      </div>
      
      ${options.title ? `<div class="title">${options.title}</div>` : ''}
      ${options.subtitle ? `<div class="subtitle">${options.subtitle}</div>` : ''}
      
      ${options.metadata ? `
        <div class="metadata">
          ${Object.entries(options.metadata).map(([key, value]) => 
            `<p><strong>${key}:</strong> ${value}</p>`
          ).join('')}
        </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td>${row[col.key] ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
      </div>
    </body>
    </html>
  `;

  // Créer un blob avec le contenu HTML (format Word)
  const blob = new Blob(['\ufeff', htmlContent], { 
    type: 'application/msword;charset=utf-8' 
  });
  saveAs(blob, `${options.filename}.doc`);
}

// Fonction d'export générique
export function exportData(
  format: 'pdf' | 'excel' | 'csv' | 'word',
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  switch (format) {
    case 'pdf':
      exportToPDF(data, columns, options);
      break;
    case 'excel':
      exportToExcel(data, columns, options);
      break;
    case 'csv':
      exportToCSV(data, columns, options);
      break;
    case 'word':
      exportToWord(data, columns, options);
      break;
    default:
      console.error('Format d\'export non supporté:', format);
  }
}
