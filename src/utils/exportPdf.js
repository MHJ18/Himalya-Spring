import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export function exportCustomerHistoryPdf(customer) {
  const doc = new jsPDF();
  const history = customer.purchaseHistory || [];
  doc.setFontSize(18);
  doc.text('Purchase History', 14, 20);
  doc.setFontSize(11);
  doc.text(`Customer: ${customer.name}`, 14, 30);
  doc.text(`Phone: ${customer.phone}`, 14, 37);
  doc.autoTable({
    startY: 45,
    head: [['Date', 'Bottle Type', 'Qty', 'Price', 'Total']],
    body: history.length
      ? history.map((t) => [
          formatDate(t.date),
          t.bottleType,
          String(t.quantity),
          formatCurrency(t.pricePerBottle),
          formatCurrency(t.totalAmount),
        ])
      : [['No transactions', '', '', '', '']],
  });
  doc.save(`history-${customer.name.replace(/\s+/g, '-')}.pdf`);
}
