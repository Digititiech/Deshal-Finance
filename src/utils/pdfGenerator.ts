import { jsPDF } from 'jspdf';
import { Invoice, Receipt, Expense, Income, PettyCashVoucher, FinancialAdjustment, InventoryMovement, Customer, SystemSettings } from '../types';

let amiriFontCache: string | null = null;

// Dynamic fetch helper for Amiri font to support Arabic text
async function getAmiriFontBase64(): Promise<string | null> {
  if (amiriFontCache) return amiriFontCache;
  try {
    const url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    amiriFontCache = base64;
    return base64;
  } catch (err) {
    console.error('Failed to load Amiri font for PDF generation:', err);
    return null;
  }
}

// Simple Arabic text shaper/reverser for basic RTL compatibility in standard PDF canvas
function shapeArabic(text: string): string {
  if (!text) return '';
  // Only process if it contains Arabic characters
  if (!/[\u0600-\u06FF]/.test(text)) return text;

  // Simple glyph mapping table for Arabic characters connection forms (basic approximation)
  // To avoid standard isolated printing, we map primary characters to their linked shapes.
  const charMap: { [key: string]: { isolated: string; initial: string; medial: string; final: string } } = {
    'ا': { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' },
    'ب': { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
    'ت': { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
    'ث': { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
    'ج': { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' },
    'ح': { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
    'خ': { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
    'د': { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' },
    'ذ': { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' },
    'ر': { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' },
    'ز': { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' },
    'س': { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' },
    'ش': { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' },
    'ص': { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
    'ض': { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' },
    'ط': { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' },
    'ظ': { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' },
    'ع': { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
    'غ': { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' },
    'ف': { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' },
    'ق': { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' },
    'ك': { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' },
    'ل': { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' },
    'م': { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' },
    'ن': { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' },
    'ه': { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' },
    'و': { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' },
    'ي': { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' },
    'ى': { isolated: 'ى', initial: 'ىـ', medial: 'ـىـ', final: 'ـى' },
    'ة': { isolated: 'ة', initial: 'ة', medial: 'ـة', final: 'ـة' },
    'أ': { isolated: 'أ', initial: 'أ', medial: 'ـأ', final: 'ـأ' },
    'إ': { isolated: 'إ', initial: 'إ', medial: 'ـإ', final: 'ـإ' },
    'آ': { isolated: 'آ', initial: 'آ', medial: 'ـآ', final: 'ـآ' },
    'ؤ': { isolated: 'ؤ', initial: 'ؤ', medial: 'ـؤ', final: 'ـؤ' },
    'ئ': { isolated: 'ئ', initial: 'ئـ', medial: 'ـئـ', final: 'ـئ' },
    'ء': { isolated: 'ء', initial: 'ء', medial: 'ء', final: 'ء' }
  };

  // Reconnective character checks
  const nonConnectingLeft = ['ا', 'د', 'ذ', 'ر', 'ز', 'و', 'أ', 'إ', 'آ', 'ؤ', 'ة', 'ء'];

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prev = text[i - 1];
    const next = text[i + 1];

    if (charMap[char]) {
      const isPrevConnected = prev && charMap[prev] && !nonConnectingLeft.includes(prev);
      const isNextConnected = next && charMap[next];

      if (isPrevConnected && isNextConnected) {
        result += charMap[char].medial;
      } else if (isPrevConnected) {
        result += charMap[char].final;
      } else if (isNextConnected) {
        result += charMap[char].initial;
      } else {
        result += charMap[char].isolated;
      }
    } else {
      result += char;
    }
  }

  // Reverse words containing Arabic letters for RTL directionality
  return result.split(' ').map(word => {
    if (/[\u0600-\u06FF]/.test(word)) {
      return word.split('').reverse().join('');
    }
    return word;
  }).reverse().join(' ');
}

// Configures standard PDF layout settings (Colors, Font)
async function initPdfDoc(settings: SystemSettings): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const fontBase64 = await getAmiriFontBase64();
  if (fontBase64) {
    doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
  } else {
    doc.setFont('Helvetica');
  }
  return doc;
}

function drawHeader(doc: jsPDF, title: string, titleAr: string, settings: SystemSettings) {
  // Primary color palette
  const primaryColor = settings.themePrimaryColor === 'emerald' ? [16, 185, 129] :
                      settings.themePrimaryColor === 'blue' ? [59, 130, 246] :
                      settings.themePrimaryColor === 'indigo' ? [99, 102, 241] :
                      settings.themePrimaryColor === 'violet' ? [139, 92, 246] : [71, 85, 105];

  // Header band
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');

  // Title English & Arabic
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title, 15, 15);
  doc.setFontSize(14);
  doc.text(shapeArabic(titleAr), 195, 15, { align: 'right' });

  doc.setFontSize(9);
  doc.text(settings.companyName + ' | ' + shapeArabic(settings.companyNameAr), 15, 25);
  doc.text('CR No: ' + (settings.registrationNo || 'N/A'), 15, 30);

  // Address
  const addrText = settings.companyAddress + ' | ' + shapeArabic(settings.companyAddressAr);
  doc.text(addrText, 195, 25, { align: 'right' });
  doc.text(settings.companyEmail + ' | ' + settings.companyPhone, 195, 30, { align: 'right' });

  // Reset text color to slate
  doc.setTextColor(51, 65, 85);
}

function drawFooter(doc: jsPDF, y: number, settings: SystemSettings) {
  doc.setLineWidth(0.2);
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Secured by Deshal Finance Audit System v3.1.0', 15, y + 5);
  
  if (settings.companySealName) {
    doc.text(shapeArabic(settings.companySealNameAr || settings.companySealName), 195, y + 5, { align: 'right' });
  }
}

// 1. Invoice PDF
export async function generateInvoicePdf(invoice: Invoice, customer: Customer, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  drawHeader(doc, 'Commercial Invoice', 'فاتورة تجارية', settings);

  // Invoice Meta Box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Invoice No / رقم الفاتورة: ${invoice.invoiceNumber}`, 20, 49);
  doc.text(`Issue Date / تاريخ الإصدار: ${invoice.issueDate}`, 20, 56);
  doc.text(`Due Date / تاريخ الاستحقاق: ${invoice.dueDate}`, 20, 63);

  const customerName = lang === 'ar' ? customer.nameAr || customer.name : customer.name;
  const customerAddr = lang === 'ar' ? customer.addressAr || customer.address : customer.address;
  doc.text(`Customer / العميل: ${shapeArabic(customerName)}`, 110, 49);
  doc.text(`Email / البريد الإلكتروني: ${customer.contactEmail}`, 110, 56);
  doc.text(`Address / العنوان: ${shapeArabic(customerAddr)}`, 110, 63);

  // Itemized Table
  let currentY = 82;
  
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 8, 'F');
  doc.setFontSize(9);
  doc.text('Description / البيان', 20, currentY + 5.5);
  doc.text('Qty / الكمية', 105, currentY + 5.5, { align: 'center' });
  doc.text('Price / السعر', 140, currentY + 5.5, { align: 'right' });
  doc.text('Total / الإجمالي', 185, currentY + 5.5, { align: 'right' });

  currentY += 8;

  invoice.items.forEach((item) => {
    doc.line(15, currentY, 195, currentY);
    const desc = lang === 'ar' ? item.descriptionAr || item.description : item.description;
    doc.text(shapeArabic(desc), 20, currentY + 6);
    doc.text(String(item.quantity), 105, currentY + 6, { align: 'center' });
    doc.text(`${item.price.toFixed(2)}`, 140, currentY + 6, { align: 'right' });
    doc.text(`${(item.price * item.quantity).toFixed(2)}`, 185, currentY + 6, { align: 'right' });
    currentY += 9;
  });

  doc.line(15, currentY, 195, currentY);
  currentY += 8;

  // Calculation Totals
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = settings.vatCompliance ? subtotal * (settings.vatRatePct / 100) : 0;
  
  doc.text('Subtotal / المجموع الفرعي:', 130, currentY);
  doc.text(`${subtotal.toFixed(2)} ${settings.primaryCurrency}`, 185, currentY, { align: 'right' });
  
  currentY += 6;
  doc.text(`VAT / الضريبة (${settings.vatRatePct}%):`, 130, currentY);
  doc.text(`${vat.toFixed(2)} ${settings.primaryCurrency}`, 185, currentY, { align: 'right' });
  
  currentY += 6;
  doc.setFontSize(10);
  doc.text('Total Owed / المبلغ المستحق:', 130, currentY);
  doc.text(`${invoice.totalAmount.toFixed(2)} ${settings.primaryCurrency}`, 185, currentY, { align: 'right' });

  currentY += 6;
  doc.setFontSize(9);
  doc.text('Paid Amount / المبلغ المدفوع:', 130, currentY);
  doc.text(`${invoice.paidAmount.toFixed(2)} ${settings.primaryCurrency}`, 185, currentY, { align: 'right' });

  currentY += 6;
  doc.text('Balance Due / الرصيد المستحق:', 130, currentY);
  doc.text(`${(invoice.totalAmount - invoice.paidAmount).toFixed(2)} ${settings.primaryCurrency}`, 185, currentY, { align: 'right' });

  // Terms & Footer
  if (settings.invoiceFooterTerms) {
    currentY += 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Terms / الشروط:', 15, currentY);
    const terms = lang === 'ar' ? settings.invoiceFooterTermsAr : settings.invoiceFooterTerms;
    doc.text(shapeArabic(terms), 15, currentY + 4, { maxWidth: 180 });
  }

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}

// 2. Receipt PDF
export async function generateReceiptPdf(receipt: Receipt, invoice: Invoice, customer: Customer, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  drawHeader(doc, 'Payment Receipt', 'سند قبض إلكتروني', settings);

  // Content block
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Receipt No / رقم السند: ${receipt.receiptNumber}`, 20, 49);
  doc.text(`Payment Date / تاريخ السداد: ${receipt.date}`, 20, 56);
  doc.text(`Method / طريقة الدفع: ${receipt.paymentMethod}`, 20, 63);

  const customerName = lang === 'ar' ? customer.nameAr || customer.name : customer.name;
  doc.text(`Customer / العميل: ${shapeArabic(customerName)}`, 110, 49);
  doc.text(`Linked Invoice / الفاتورة المرتبطة: ${invoice.invoiceNumber}`, 110, 56);
  doc.text(`Invoice Status / حالة الفاتورة: ${invoice.status}`, 110, 63);

  // Statement box
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 25, 'F');
  doc.setFontSize(12);
  doc.text('Received Amount / المبلغ المستلم', 20, 90);
  doc.text(`${receipt.amount.toFixed(2)} ${settings.primaryCurrency}`, 185, 90, { align: 'right' });
  
  doc.setFontSize(9);
  const notesText = receipt.notes || `Receipt log for ${invoice.invoiceNumber}`;
  doc.text(`Notes / ملاحظات: ${shapeArabic(notesText)}`, 20, 100);

  // Footer terms
  if (settings.receiptFooterTerms) {
    const terms = lang === 'ar' ? settings.receiptFooterTermsAr : settings.receiptFooterTerms;
    doc.text('Footer Terms / شروط السند:', 15, 120);
    doc.text(shapeArabic(terms), 15, 125, { maxWidth: 180 });
  }

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}

// 3. Expense PDF
export async function generateExpensePdf(expense: Expense, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  drawHeader(doc, 'Expense Voucher', 'سند صرف مصروفات', settings);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Voucher ID / رقم السند: ${expense.id}`, 20, 49);
  doc.text(`Date / تاريخ الصرف: ${expense.date}`, 20, 56);
  doc.text(`Category / الفئة: ${expense.category}`, 20, 63);

  const entityName = lang === 'ar' ? expense.entityAr || expense.entity : expense.entity;
  doc.text(`Recipient / المستفيد: ${shapeArabic(entityName)}`, 110, 49);
  doc.text(`Branch / الفرع: ${expense.branchId}`, 110, 56);
  doc.text(`Status / الحالة: ${expense.status}`, 110, 63);

  // Amount block
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 20, 'F');
  doc.setFontSize(12);
  doc.text('Expense Amount / قيمة المصروف', 20, 92);
  doc.text(`${expense.amount.toFixed(2)} ${settings.primaryCurrency}`, 185, 92, { align: 'right' });

  // Description
  doc.setFontSize(9);
  const desc = lang === 'ar' ? expense.descriptionAr || expense.description : expense.description;
  doc.text(`Description / التفاصيل: ${shapeArabic(desc || 'N/A')}`, 15, 115, { maxWidth: 180 });

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}

// 4. Income PDF
export async function generateIncomePdf(income: Income, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  drawHeader(doc, 'Income Receipt Voucher', 'سند قبض إيرادات', settings);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Receipt ID / رقم السند: ${income.id}`, 20, 49);
  doc.text(`Date / التاريخ: ${income.date}`, 20, 56);
  doc.text(`Method / طريقة القبض: ${income.paymentMethod}`, 20, 63);

  const sourceName = lang === 'ar' ? income.sourceAr || income.source : income.source;
  doc.text(`Source / المصدر: ${shapeArabic(sourceName)}`, 110, 49);
  doc.text(`Branch / الفرع: ${income.branchId}`, 110, 56);
  if (income.invoiceId) {
    doc.text(`Invoice Ref / الفاتورة: ${income.invoiceId}`, 110, 63);
  }

  // Amount block
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 20, 'F');
  doc.setFontSize(12);
  doc.text('Received Amount / قيمة المقبوضات', 20, 92);
  doc.text(`${income.amount.toFixed(2)} ${settings.primaryCurrency}`, 185, 92, { align: 'right' });

  // Description
  doc.setFontSize(9);
  const desc = lang === 'ar' ? income.descriptionAr || income.description : income.description;
  doc.text(`Description / التفاصيل: ${shapeArabic(desc || 'N/A')}`, 15, 115, { maxWidth: 180 });

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}

// 5. Petty Cash PDF
export async function generatePettyCashPdf(voucher: PettyCashVoucher, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  drawHeader(doc, 'Petty Cash Voucher', 'سند عهدة نقدية', settings);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Voucher ID / رقم السند: ${voucher.id}`, 20, 49);
  doc.text(`Date / التاريخ: ${voucher.date}`, 20, 56);
  doc.text(`Category / الفئة: ${voucher.category}`, 20, 63);

  const reqName = voucher.requestedBy;
  doc.text(`Claimant / مقدم الطلب: ${shapeArabic(reqName)}`, 110, 49);
  doc.text(`Branch / الفرع: ${voucher.branchId}`, 110, 56);
  doc.text(`Status / الحالة: ${voucher.status}`, 110, 63);

  // Amount block
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 20, 'F');
  doc.setFontSize(12);
  doc.text('Disbursement Amount / مبلغ الصرف المعتمد', 20, 92);
  doc.text(`${voucher.amount.toFixed(2)} ${settings.primaryCurrency}`, 185, 92, { align: 'right' });

  // Description
  doc.setFontSize(9);
  const desc = lang === 'ar' ? voucher.descriptionAr || voucher.description : voucher.description;
  doc.text(`Description / التفاصيل: ${shapeArabic(desc || 'N/A')}`, 15, 115, { maxWidth: 180 });

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}

// 6. Adjustment PDF
export async function generateAdjustmentPdf(adjustment: FinancialAdjustment, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  const title = adjustment.type === 'Credit Note' ? 'Credit Note' : 'Debit Note';
  const titleAr = adjustment.type === 'Credit Note' ? 'إشعار دائن' : 'إشعار مدين';
  drawHeader(doc, title, titleAr, settings);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Note No / رقم الإشعار: ${adjustment.noteNumber}`, 20, 49);
  doc.text(`Date / تاريخ التحرير: ${adjustment.date}`, 20, 56);
  doc.text(`Adjustment Type / نوع التسوية: ${adjustment.type}`, 20, 63);

  doc.text(`Branch / الفرع: ${adjustment.branchId}`, 110, 49);
  if (adjustment.invoiceId) {
    doc.text(`Invoice Ref / الفاتورة المرتبطة: ${adjustment.invoiceId}`, 110, 56);
  }
  doc.text(`Created By / حرر بواسطة: ${adjustment.createdBy}`, 110, 63);

  // Amount block
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 20, 'F');
  doc.setFontSize(12);
  doc.text('Adjusted Value / قيمة التسوية الإجمالية', 20, 92);
  doc.text(`${adjustment.amount.toFixed(2)} ${settings.primaryCurrency}`, 185, 92, { align: 'right' });

  // Description
  doc.setFontSize(9);
  const reason = lang === 'ar' ? adjustment.reasonAr || adjustment.reason : adjustment.reason;
  doc.text(`Adjustment Reason / سبب إدخال التسوية: ${shapeArabic(reason || 'N/A')}`, 15, 115, { maxWidth: 180 });

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}

// 7. Inventory Movement PDF
export async function generateInventoryMovementPdf(movement: InventoryMovement, settings: SystemSettings, lang: 'en' | 'ar'): Promise<string> {
  const doc = await initPdfDoc(settings);
  drawHeader(doc, 'Stock Transfer Note', 'سند تحويل بضائع ومخزون', settings);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 28, 'F');
  
  doc.setFontSize(9);
  doc.text(`Movement ID / رقم الحركة: ${movement.id}`, 20, 49);
  doc.text(`Date / تاريخ الحركة: ${movement.date}`, 20, 56);
  doc.text(`Product SKU / رمز المنتج: ${movement.productId}`, 20, 63);

  doc.text(`Branch / الفرع: ${movement.branchId}`, 110, 49);
  doc.text(`Type / نوع الحركة: ${movement.type === 'In' ? (lang === 'ar' ? 'توريد مخزن' : 'Stock In') : (lang === 'ar' ? 'صرف مخزن' : 'Stock Out')}`, 110, 56);
  doc.text(`Reference / رقم المرجع: ${shapeArabic(movement.reference)}`, 110, 63);

  // Details block
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 20, 'F');
  doc.setFontSize(11);
  doc.text(`Quantity: ${movement.quantity} Units / الكمية: ${movement.quantity} وحدة`, 20, 92);

  // Description
  doc.setFontSize(9);
  const desc = lang === 'ar' ? movement.notesAr || movement.notes : movement.notes;
  doc.text(`Description / البيان والتفاصيل: ${shapeArabic(desc || 'N/A')}`, 15, 115, { maxWidth: 180 });

  drawFooter(doc, 270, settings);
  return doc.output('datauristring').split(',')[1];
}
