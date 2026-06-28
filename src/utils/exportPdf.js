import { jsPDF } from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';
import { DEFAULT_SETTINGS } from '../data/constants';
import { formatCurrency, formatDate } from './formatters';

const autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;

function safeText(value, fallback = '—') {
  const text = value === null || value === undefined ? '' : String(value).trim();
  return text || fallback;
}

function buildLocalInvoice(customer, historyItems = [], company = DEFAULT_SETTINGS) {
  const totalAmount = historyItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const totalQty = historyItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const invoiceNumber = `HSW-${String(customer.id || customer.phone || customer.name || Date.now()).slice(-6).toUpperCase()}`;

  return {
    invoiceNumber,
    invoiceDate: new Date().toISOString(),
    payload: {
      company: {
        name: company.businessName || DEFAULT_SETTINGS.businessName,
        phone: company.businessPhone || DEFAULT_SETTINGS.businessPhone,
        address: company.businessAddress || DEFAULT_SETTINGS.businessAddress,
      },
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
      },
      preparedBy: {
        name: company.ownerName || 'Himaliya Owner',
        email: company.ownerEmail || 'admin@himaliya.com',
        role: company.ownerRole || 'Owner',
      },
      history: historyItems.map((item) => ({
        date: item.date,
        bottleType: item.bottleType,
        quantity: Number(item.quantity) || 0,
        pricePerBottle: Number(item.pricePerBottle) || 0,
        totalAmount: Number(item.totalAmount) || 0,
      })),
      summary: {
        entryCount: historyItems.length,
        totalAmount,
        totalQty,
      },
    },
    totalAmount,
    totalQty,
  };
}

function getVerifyUrl(invoiceNumber) {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/invoice/${encodeURIComponent(invoiceNumber)}`;
  }
  return `/invoice/${invoiceNumber}`;
}

export function exportInvoicePdf(invoice) {
  const payload = invoice.payload || {};
  const company = payload.company || {};
  const customer = payload.customer || {};
  const preparedBy = payload.preparedBy || {};
  const history = Array.isArray(payload.history) ? payload.history : [];
  const summary = payload.summary || {};
  const invoiceNumber = invoice.invoiceNumber || invoice.invoice_number || '—';
  const billDate = new Date(invoice.invoiceDate || invoice.invoice_date || Date.now());
  const visibleHistory = history.slice(0, 10);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const accent = [37, 99, 235];
  const muted = [100, 116, 139];
  const ink = [15, 23, 42];

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 18, 196, 18);

  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(safeText(company.name, 'Himaliya Spring Water'), 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(safeText(company.address, 'Karachi, Pakistan'), 14, 28);
  doc.text(safeText(company.phone, ''), 14, 33);

  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INVOICE', 196, 12, { align: 'right' });
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFontSize(12);
  doc.text(invoiceNumber, 196, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(billDate.toLocaleDateString('en-PK'), 196, 26, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(14, 38, 196, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('BILL TO', 14, 46);
  doc.text('PREPARED BY', 110, 46);

  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFontSize(11);
  doc.text(safeText(customer.name, 'Customer'), 14, 53);
  doc.text(safeText(preparedBy.name, 'Admin'), 110, 53);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(`Phone: ${safeText(customer.phone)}`, 14, 59);
  doc.text(`Address: ${safeText(customer.address)}`, 14, 64);
  doc.text(`Role: ${safeText(preparedBy.role, 'Owner')}`, 110, 59);
  doc.text(`Email: ${safeText(preparedBy.email)}`, 110, 64);

  const summaryY = 72;
  [
    { label: 'Entries', value: String(summary.entryCount || history.length) },
    { label: 'Quantity', value: String(summary.totalQty || 0) },
    { label: 'Total', value: formatCurrency(summary.totalAmount || 0) },
  ].forEach((item, index) => {
    const x = 14 + (index * 61);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, summaryY, 57, 14, 2, 2, 'FD');
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.setFontSize(7);
    doc.text(item.label.toUpperCase(), x + 4, summaryY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(ink[0], ink[1], ink[2]);
    doc.setFontSize(10);
    doc.text(item.value, x + 4, summaryY + 11);
    doc.setFont('helvetica', 'normal');
  });

  autoTable(doc, {
    startY: 92,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    head: [['Date', 'Bottle Type', 'Qty', 'Unit Price', 'Total']],
    body: visibleHistory.length
      ? visibleHistory.map((item) => [
          formatDate(item.date),
          safeText(item.bottleType, '—'),
          String(item.quantity || 0),
          formatCurrency(item.pricePerBottle),
          formatCurrency(item.totalAmount),
        ])
      : [['No transactions recorded', '', '', '', '']],
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: ink,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: ink,
      fontStyle: 'bold',
      lineWidth: { bottom: 0.4 },
      lineColor: accent,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 54 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
    },
  });

  const tableEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 140;
  let cursorY = tableEndY + 8;

  if (history.length > visibleHistory.length) {
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.setFontSize(8);
    doc.text(`Showing ${visibleHistory.length} of ${history.length} line items.`, 14, cursorY);
    cursorY += 6;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, cursorY, 196, cursorY);
  cursorY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.text('Amount due', 14, cursorY);
  doc.text(formatCurrency(summary.totalAmount || 0), 196, cursorY, { align: 'right' });

  cursorY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('Payment: cash on delivery or monthly account.', 14, cursorY);
  cursorY += 5;
  doc.text('Policies: sanitized bottles, sealed delivery, and routine water quality checks.', 14, cursorY);
  cursorY += 5;
  doc.text('Returns: empty bottles should be returned on the next delivery.', 14, cursorY);

  const verifyUrl = getVerifyUrl(invoiceNumber);
  cursorY += 10;
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Verify this invoice online:', 14, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(verifyUrl, 14, cursorY + 5);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 278, 196, 278);
  doc.setFontSize(8);
  doc.text('Thank you for choosing Himaliya Spring Water.', 14, 284);
  doc.text('Authorized company record', 196, 284, { align: 'right' });

  doc.save(`invoice-${String(invoiceNumber).toLowerCase()}.pdf`);
}

export async function exportCustomerHistoryPdf(customer, historyItems, createInvoice) {
  let invoice = null;
  if (typeof createInvoice === 'function') {
    try {
      invoice = await createInvoice(customer, historyItems);
    } catch (error) {
      invoice = null;
    }
  }

  if (!invoice) {
    invoice = buildLocalInvoice(customer, historyItems);
  }

  exportInvoicePdf(invoice);
  return invoice;
}
