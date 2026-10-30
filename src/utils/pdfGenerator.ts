import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessSettings, Product, Quotation } from '../types';
import { formatINRNumber } from './storage';

export interface WholesalePdfOptions {
  products: Product[];
  settings: BusinessSettings;
  includeImages?: boolean;
  filterTitle?: string;
}

export function generateWholesalePDF(options: WholesalePdfOptions): void {
  const { products, settings, includeImages = false, filterTitle } = options;

  // Create A4 portrait document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toISOString().split('T')[0];

  // Header Background bar
  doc.setFillColor(15, 33, 71); // Deep Navy Blue (#0f2147)
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Business Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.businessName, pageWidth / 2, 11, { align: 'center' });

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Light slate
  doc.text(settings.subtitle || 'RO PLANT, WATER PURIFIERS & SPARE PARTS', pageWidth / 2, 17, { align: 'center' });

  // Address & Contact info in header
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const contactText = `${settings.address}  |  Tel: ${settings.phone}  |  WhatsApp: ${settings.whatsapp}`;
  doc.text(contactText, pageWidth / 2, 24, { align: 'center' });

  // Document Title Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 36, pageWidth - 28, 12, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 36, pageWidth - 28, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 33, 71);
  doc.text('WHOLESALE PRICE LIST (BULK TRADE RATES)', 18, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const dateStr = `Date: ${today}${filterTitle ? ` | Filter: ${filterTitle}` : ''}`;
  doc.text(dateStr, pageWidth - 18, 44, { align: 'right' });

  // Prepare table data (SKU and Category removed per user request)
  const tableHead = [
    [
      '#',
      'Product Name',
      'Min Order (MOQ)',
      'Wholesale Rate (Rs.)',
      'Unit',
    ],
  ];

  const tableBody = products.map((prod, index) => {
    return [
      (index + 1).toString(),
      prod.name,
      `Min ${prod.moq} ${prod.unit}s`,
      `Rs. ${formatINRNumber(prod.wholesalePrice, settings.decimalPlaces)}`,
      prod.unit,
    ];
  });

  autoTable(doc, {
    startY: 52,
    head: tableHead,
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 33, 71],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 38, halign: 'center' },
      3: { cellWidth: 42, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);

      // Business note
      const footerNote = settings.pdfFooterNote || `For orders and trade inquiries, call / WhatsApp: ${settings.phone}`;
      doc.text(footerNote, 14, pageHeight - 9);

      // Page numbering
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - 14,
        pageHeight - 9,
        { align: 'right' }
      );
    },
    margin: { top: 52, left: 14, right: 14, bottom: 18 },
  });

  const filename = `NEW_ASHIQUE_ENTERPRISE_WHOLESALE_${today}.pdf`;
  doc.save(filename);
}

export function generateQuotationPDF(quotation: Quotation, settings: BusinessSettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(15, 33, 71);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.businessName, pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(settings.subtitle || 'RO PLANT, WATER PURIFIERS & SPARE PARTS', pageWidth / 2, 18, { align: 'center' });
  doc.text(`${settings.address} | Ph: ${settings.phone}`, pageWidth / 2, 24, { align: 'center' });

  // Quotation header boxes
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 36, pageWidth - 28, 26, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 36, pageWidth - 28, 26, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 33, 71);
  doc.text('PRICE ESTIMATE / QUOTATION', 18, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Quote Ref: ${quotation.quotationNumber}`, 18, 50);
  doc.text(`Date: ${quotation.date}`, 18, 56);

  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details:', pageWidth / 2, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${quotation.customerName || 'Valued Customer'}`, pageWidth / 2, 49);
  doc.text(`Phone: ${quotation.customerPhone || 'N/A'}`, pageWidth / 2, 54);
  if (quotation.deliveryDate) {
    doc.text(`Delivery Date: ${quotation.deliveryDate}`, pageWidth / 2, 59);
  }
  if (quotation.customerAddress) {
    doc.text(`Address: ${quotation.customerAddress}`, pageWidth / 2, quotation.deliveryDate ? 64 : 59);
  }

  // Items table
  const tableHead = [['#', 'Item / Product Description', 'Unit', 'Qty', 'Unit Rate (Rs.)', 'Total (Rs.)']];
  const tableBody = quotation.items.map((it, idx) => [
    (idx + 1).toString(),
    `${it.name} (${it.code})`,
    it.unit,
    it.quantity.toString(),
    `Rs. ${formatINRNumber(it.unitPrice, 2)}`,
    `Rs. ${formatINRNumber(it.lineTotal, 2)}`,
  ]);

  autoTable(doc, {
    startY: 66,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 33, 71],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14, bottom: 40 },
  });

  // Totals section
  const lastY = (doc as any).lastAutoTable.finalY || 100;
  let finalY = lastY + 6;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(pageWidth - 85, finalY, 71, 26, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Subtotal:', pageWidth - 80, finalY + 6);
  doc.text(`Rs. ${formatINRNumber(quotation.subtotal, 2)}`, pageWidth - 18, finalY + 6, { align: 'right' });

  doc.text('Discount:', pageWidth - 80, finalY + 12);
  doc.text(`- Rs. ${formatINRNumber(quotation.discount, 2)}`, pageWidth - 18, finalY + 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 33, 71);
  doc.text('Grand Total:', pageWidth - 80, finalY + 20);
  doc.text(`Rs. ${formatINRNumber(quotation.grandTotal, 2)}`, pageWidth - 18, finalY + 20, { align: 'right' });

  // Notes and disclaimer
  if (quotation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Notes / Terms:', 14, finalY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(quotation.notes, 100);
    doc.text(splitNotes, 14, finalY + 12);
  }

  // Mandatory tax disclaimer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('* Note: This document is an estimate / quotation and does not constitute a legal tax invoice.', 14, pageHeight - 16);
  doc.text(`Generated by NEW ASHIQUE ENTERPRISE System on ${quotation.date}`, 14, pageHeight - 11);

  doc.save(`Quotation_${quotation.quotationNumber}_${quotation.customerName.replace(/\s+/g, '_')}.pdf`);
}
