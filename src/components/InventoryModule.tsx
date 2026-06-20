import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Boxes, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  History, 
  Layers, 
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  X,
  FileCheck2,
  RefreshCw,
  Printer,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { ProductItem, InventoryMovement, Branch, UserRole, SystemSettings } from '../types';
import { supabase } from '../supabase';
import { generateInventoryMovementPdf } from '../utils/pdfGenerator';


interface InventoryModuleProps {
  products: ProductItem[];
  movements: InventoryMovement[];
  filteredMovements: InventoryMovement[];
  branches: Branch[];
  addProduct: (item: Omit<ProductItem, 'id'>) => ProductItem;
  editProduct: (item: ProductItem) => void;
  deleteProduct: (id: string) => void;
  addMovement: (item: Omit<InventoryMovement, 'id'>) => InventoryMovement;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  currentBranchId: string;
  systemSettings: SystemSettings;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  movements,
  filteredMovements,
  branches,
  addProduct,
  editProduct,
  deleteProduct,
  addMovement,
  lang,
  userRole,
  currentBranchId,
  systemSettings
}) => {
  const [viewingMovementVoucher, setViewingMovementVoucher] = useState<InventoryMovement | null>(null);

  // --- Email Send State ---
  const [emailTarget, setEmailTarget] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    if (viewingMovementVoucher) {
      setEmailTarget('');
      setShowEmailInput(false);
      setEmailError('');
      setEmailSuccess('');
    }
  }, [viewingMovementVoucher]);

  const handleSendEmail = async () => {
    if (!emailTarget.trim() || !emailTarget.includes('@')) {
      setEmailError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const matchedProd = products.find(p => p.id === viewingMovementVoucher!.productId);
      const productName = matchedProd ? (lang === 'ar' ? matchedProd.nameAr : matchedProd.name) : 'Unknown Stock Item';
      const voucherNo = `ST-${viewingMovementVoucher!.id.slice(-6).toUpperCase()}`;

      const mailSubject = lang === 'ar' 
        ? `سند حركة مخزنية معتمد: ${voucherNo}` 
        : `Official Stock Movement Voucher: ${voucherNo}`;

      const sourceBranchName = viewingMovementVoucher!.sourceBranchId ? getBranchName(viewingMovementVoucher!.sourceBranchId) : '-';
      const destBranchName = viewingMovementVoucher!.destinationBranchId ? getBranchName(viewingMovementVoucher!.destinationBranchId) : '-';
      const activeBranchName = getBranchName(viewingMovementVoucher!.branchId);

      const mailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: #0d9488; padding: 24px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">${lang === 'ar' ? 'سند تحويل حركة مخزنية' : 'Official Stock Voucher'}</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-family: monospace; font-size: 14px;">${voucherNo}</p>
          </div>
          
          <div style="padding: 24px; background: #fafafa;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'منشأة الصرف:' : 'Corporation:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;"><b>${lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}</b></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'اسم الصنف المخزني:' : 'Stock Item Name:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;"><b>${productName}</b></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'تاريخ الحركة:' : 'Movement Date:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b; font-family: monospace;">${viewingMovementVoucher!.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'الفرع المستودعي:' : 'Branch Inventory:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;">${activeBranchName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'نوع الحركة:' : 'Movement Type:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b; font-weight: bold; text-transform: uppercase;">${viewingMovementVoucher!.type}</td>
              </tr>
              ${viewingMovementVoucher!.type === 'TRANSFER' ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'من فرع:' : 'From Branch:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;">${sourceBranchName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'إلى فرع:' : 'To Branch:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;">${destBranchName}</td>
              </tr>
              ` : ''}
            </table>

            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: right;">
              <div>
                <span style="font-size: 10px; color: #94a3b8; font-weight: bold; display: block; text-transform: uppercase;">${lang === 'ar' ? 'بيان وملاحظات الحركة' : 'MOVEMENT ANNOTATION'}</span>
                <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0; font-style: italic;">
                  ${(lang === 'ar' ? viewingMovementVoucher!.notesAr : viewingMovementVoucher!.notes) || (lang === 'ar' ? 'تم قيد وتسجيل حركة المخزون بنجاح' : 'Inventory stock movement recorded.')}
                </p>
               </div>
               <div style="text-align: right; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                 <span style="font-size: 10px; color: #94a3b8; font-weight: bold; display: block;">${lang === 'ar' ? 'الكمية المحولة' : 'Movement Quantity'}</span>
                 <span style="font-size: 16px; font-weight: bold; color: #0d9488; font-family: monospace; display: block; margin-top: 4px;">${viewingMovementVoucher!.type === 'OUT' ? '-' : '+'}${viewingMovementVoucher!.quantity} Units</span>
               </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9px; color: #94a3b8; font-style: italic;">
              <span style="font-weight: bold; display: block; margin-bottom: 2px; color: #64748b; not-italic;">${lang === 'ar' ? 'إقرار ومطابقة:' : 'Compliance Note:'}</span>
              ${lang === 'ar' 
                ? 'تم مطابقة هذا التحويل دفترياً والتحقق من أرصدة المخازن طبقاً لجرد البوابة.' 
                : 'Stock movement voucher verified and adjusted inside warehouse catalog.'}
            </div>
          </div>

          <div style="background: #e2e8f0; padding: 12px; text-align: center; font-size: 10px; color: #64748b; font-family: monospace;">
            Secured by Deshal Finance Audit System v3.1.0
          </div>
        </div>
      `;

      const base64Pdf = await generateInventoryMovementPdf(viewingMovementVoucher!, systemSettings, lang);

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailTarget,
          subject: mailSubject,
          text: `Stock movement voucher ${voucherNo} for product ID ${viewingMovementVoucher!.productId}. Quantity: ${viewingMovementVoucher!.quantity}. Date: ${viewingMovementVoucher!.date}.`,
          html: mailHtml,
          attachments: [
            {
              filename: `StockMovement-${viewingMovementVoucher!.id}.pdf`,
              content: base64Pdf,
              encoding: 'base64',
              contentType: 'application/pdf'
            }
          ]
        }
      });

      if (error) throw error;

      setEmailSuccess(lang === 'ar' ? 'تم إرسال السند بنجاح إلى البريد الإلكتروني!' : 'Stock voucher dispatched successfully via email!');
      setTimeout(() => {
        setShowEmailInput(false);
        setEmailSuccess('');
      }, 3000);
    } catch (err: any) {
      setEmailError(lang === 'ar' ? 'فشل الإرسال: ' + (err.message || 'خطأ غير معروف') : 'Failed to send: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSendingEmail(false);
    }
  };
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'movements' | 'alerts'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'Product' | 'Service'>('All');
  
  // Adding / Editing product states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states for Product Add/Edit
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [type, setType] = useState<'Product' | 'Service'>('Product');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('0');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [categoryAr, setCategoryAr] = useState('أجهزة ومعدات');
  const [formError, setFormError] = useState('');

  // Stock update adjustment state
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<ProductItem | null>(null);
  const [movementType, setMovementType] = useState<'In' | 'Out'>('In');
  const [movementQty, setMovementQty] = useState('');
  const [movementReference, setMovementReference] = useState('');
  const [movementNotes, setMovementNotes] = useState('');
  const [movementNotesAr, setMovementNotesAr] = useState('');
  const [movementBranchId, setMovementBranchId] = useState('');
  const [stockError, setStockError] = useState('');

  const isEditable = userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager';

  // Categories translation table
  const categoriesList = [
    { en: 'Hardware', ar: 'أجهزة ومعدات' },
    { en: 'Software Licensing', ar: 'تراخيص البرمجيات' },
    { en: 'Consulting', ar: 'خدمات استشارية' },
    { en: 'Professional Services', ar: 'خدمات احترافية' },
    { en: 'General Support', ar: 'الدعم العام المباشر' }
  ];

  // List of Products under alert levels
  const lowStockProducts = products.filter(p => p.type === 'Product' && p.stock <= p.minStockAlert);

  // Filtered Products Catalog
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedTypeFilter === 'All' || p.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const getBranchName = (id: string) => {
    const br = branches.find(b => b.id === id);
    if (!br) return lang === 'ar' ? 'عام' : 'Global';
    return lang === 'ar' ? br.nameAr : br.name;
  };

  const getProductDetail = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return { name: 'Unknown Item', nameAr: 'صنف غير معرف', sku: 'N/A' };
    return prod;
  };

  // Submit product create/edit
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !nameAr) {
      setFormError(lang === 'ar' ? 'يرجى تعبئة حقول الرمز والاسم باللغتين' : 'Please specify SKU and item name in both languages');
      return;
    }
    if (!price || parseFloat(price) < 0) {
      setFormError(lang === 'ar' ? 'يرجى إدخال سعر بيع صحيح' : 'Please specify a valid sale price');
      return;
    }

    const payload = {
      sku,
      name,
      nameAr,
      type,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : 0,
      stock: type === 'Service' ? 0 : parseInt(stock) || 0,
      minStockAlert: type === 'Service' ? 0 : parseInt(minStockAlert) || 0,
      description,
      descriptionAr,
      category,
      categoryAr
    };

    if (editingProduct) {
      editProduct({ ...payload, id: editingProduct.id });
    } else {
      addProduct(payload);
    }

    // Reset Form
    setIsAddingProduct(false);
    setEditingProduct(null);
    setSku('');
    setName('');
    setNameAr('');
    setType('Product');
    setPrice('');
    setCost('');
    setStock('0');
    setMinStockAlert('5');
    setDescription('');
    setDescriptionAr('');
    setFormError('');
  };

  // Open edit modal
  const handleEditClick = (p: ProductItem) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setNameAr(p.nameAr);
    setType(p.type);
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setStock(p.stock.toString());
    setMinStockAlert(p.minStockAlert.toString());
    setDescription(p.description);
    setDescriptionAr(p.descriptionAr);
    setCategory(p.category);
    setCategoryAr(p.categoryAr);
    setIsAddingProduct(true);
  };

  // Submit Inventory stock movement correction
  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;
    if (!movementQty || parseInt(movementQty) <= 0) {
      setStockError(lang === 'ar' ? 'يرجى إدخال كمية صحيحة' : 'Please input a valid count');
      return;
    }
    if (!movementBranchId) {
      setStockError(lang === 'ar' ? 'يرجى تحديد فرع المستودع' : 'Please select storage location branch');
      return;
    }

    addMovement({
      productId: selectedProductForStock.id,
      type: movementType,
      quantity: parseInt(movementQty),
      date: new Date().toISOString().split('T')[0],
      reference: movementReference || 'STOCK-ADJ',
      notes: movementNotes || 'Manual logistics balancing adjustment',
      notesAr: movementNotesAr || 'تعديل مخزني وتدقيق يدوي لوجيستي',
      branchId: movementBranchId
    });

    // Reset Form
    setIsUpdatingStock(false);
    setSelectedProductForStock(null);
    setMovementQty('');
    setMovementReference('');
    setMovementNotes('');
    setMovementNotesAr('');
    setStockError('');
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Inventory Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-left">
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'ar' ? 'المنتجات، الخدمات وإدارة المخزون' : 'Catalog & Inventory Control'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar' 
              ? 'تتبع المنتجات والخدمات الاستشارية والمبيعات المؤسسية وتحديث مستويات المخزون اللوجيستي بشكل فوري' 
              : 'Construct consulting catalogs, software license packages, hardware stock counts, and execute log movements.'}
          </p>
        </div>

        {isEditable && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddingProduct(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl cursor-pointer duration-150 text-xs border-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة صنف للكتالوج' : 'Add Catalog Item'}</span>
          </button>
        )}
      </div>

      {/* Critical Stock Alert banners if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-800">
                {lang === 'ar' ? `تنبيه: انخفاض المخزون لـ (${lowStockProducts.length}) من المنتجات` : `Low Stock Alert (${lowStockProducts.length} items)`}
              </h4>
              <p className="text-[10px] text-amber-600 mt-0.5 font-semibold">
                {lang === 'ar' 
                  ? 'هناك أصناف برمجية أو أجهزة تقل كمياتها المتوفرة عن الحد الأدنى المحدد للمبيعات والتوريد' 
                  : 'Items have dropped below minimum warehouse warning threshold.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setActiveSubTab('alerts');
            }}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 font-bold text-white text-[10px] rounded-lg cursor-pointer border-0 duration-150"
          >
            {lang === 'ar' ? 'بدء تدقيق النقصان' : 'Perform Stock Upkeep'}
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs bar inside module */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-4 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`pb-3 px-1 transition relative cursor-pointer border-0 bg-transparent ${
            activeSubTab === 'catalog' ? 'text-emerald-600 border-b-2 border-emerald-650' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          {lang === 'ar' ? 'دليل الأصناف والخدمات' : 'Service & Product Catalog'}
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`pb-3 px-1 transition relative cursor-pointer border-0 bg-transparent ${
            activeSubTab === 'movements' ? 'text-emerald-600 border-b-2 border-emerald-650' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          {lang === 'ar' ? 'حركة وسجل تحديثات المخازن' : 'Warehouse Stock Ledger'}
        </button>
        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`pb-3 px-1 transition relative cursor-pointer border-0 bg-transparent flex items-center gap-1.5 ${
            activeSubTab === 'alerts' ? 'text-emerald-600 border-b-2 border-emerald-650' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>{lang === 'ar' ? 'أصناف ناقصة لتوريدها' : 'Supply Alert List'}</span>
          {lowStockProducts.length > 0 && (
            <span className="w-4 h-4 bg-rose-600 rounded-full text-white font-bold text-[8px] flex items-center justify-center">
              {lowStockProducts.length}
            </span>
          )}
        </button>
      </div>

      {/* Add / Edit product catalog modal */}
      {isAddingProduct && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-start space-y-4 shadow-sm animate-fade-in relative">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {editingProduct 
                ? (lang === 'ar' ? `تعديل صنف: ${editingProduct.sku}` : `Modify Item: ${editingProduct.sku}`) 
                : (lang === 'ar' ? 'إضافة صنف جديد للدليل' : 'Create New Product or Service Item')}
            </h3>
            <button 
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProduct(null);
              }}
              className="p-1 bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg border-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-sans">
            {formError && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Product SKU */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'رمز الصنف الترقيمي (SKU / Part No.)' : 'Catalog SKU (Code)'}</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. PROD-MACBOOK3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans uppercase font-bold"
                />
              </div>

              {/* Type Category */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'طبيعة الصنف' : 'Standard Item Type'}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'Product' | 'Service')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                >
                  <option value="Product">{lang === 'ar' ? 'منتج مادي (بالمخازن)' : 'Product (Warehousing)'}</option>
                  <option value="Service">{lang === 'ar' ? 'خدمة أو استشارات (معنوية)' : 'Service (Consulting/Virtual)'}</option>
                </select>
              </div>

              {/* Category Grouping */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'التصنيف الرئيسي' : 'Direct Category Group'}</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const matched = categoriesList.find(c => c.en === e.target.value);
                    if (matched) {
                      setCategory(matched.en);
                      setCategoryAr(matched.ar);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                >
                  {categoriesList.map(cat => (
                    <option key={cat.en} value={cat.en}>{lang === 'ar' ? cat.ar : cat.en}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* English Name */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'الاسم باللغة الإنجليزية' : 'Catalog Item Name (English)'}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dell Thin Client Computer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'الاسم باللغة العربية' : 'Catalog Item Name (Arabic)'}</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: حاسوب ديل المنفصل الرقيق"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans text-start"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Sales price */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'سعر البيع (مبيعات)' : 'Sales Price (SAR)'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              {/* Average cost */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'تكلفة التوريد (تكلفة متوسطة)' : 'Average Capital Cost'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              {/* Current units - Only if physical */}
              {type === 'Product' && (
                <>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'الكمية المتوفرة حالياً' : 'Warehouse Inventory Count'}</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                      disabled={!!editingProduct} // Cannot edit directly during product edit catalog, must use standard Stock Ledger adjustment type
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'حد تنبيه نقص المخزون' : 'Min Alert Level Value'}</label>
                    <input
                      type="number"
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(e.target.value)}
                      placeholder="5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                    />
                  </div>
                </>
              )}

            </div>

            {/* Descriptions block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'تفاصيل / توصيف بالإنجليزية' : 'Vivid Technical Description (English)'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insert any detailed dimensions, licenses terms..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans h-20"
                />
              </div>
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'تفاصيل / توصيف بالعربية' : 'Detailed Technical Description (Arabic)'}</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="أي معلومات إضافية عن شروط الدعم أو عتاد الأجهزة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans text-start h-20"
                />
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                }}
                className="py-2.5 px-6 rounded-xl hover:bg-slate-100 font-bold text-slate-500 cursor-pointer text-xs transition border border-slate-200 bg-white"
              >
                {lang === 'ar' ? 'إلغاء' : 'Discard'}
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white cursor-pointer text-xs transition border-0 shadow-sm"
              >
                {lang === 'ar' ? 'حفظ الصنف بالكتالوج' : 'Save Catalog Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Catalog list representation */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filtering row */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث بالاسم، SKU أو التصنيف...' : 'Search brand catalog...'}
                className="w-full bg-slate-100 border-0 text-slate-800 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedTypeFilter('All')}
                className={`px-3 py-1.2 rounded-md font-bold text-[10px] cursor-pointer border-0 ${selectedTypeFilter === 'All' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {lang === 'ar' ? 'عرض الكل' : 'All Types'}
              </button>
              <button
                onClick={() => setSelectedTypeFilter('Product')}
                className={`px-3 py-1.2 rounded-md font-bold text-[10px] cursor-pointer border-0 ${selectedTypeFilter === 'Product' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {lang === 'ar' ? 'أجهزة ومعدات مادية' : 'Physical Products'}
              </button>
              <button
                onClick={() => setSelectedTypeFilter('Service')}
                className={`px-3 py-1.2 rounded-md font-bold text-[10px] cursor-pointer border-0 ${selectedTypeFilter === 'Service' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              >
                {lang === 'ar' ? 'خدمات استشارية' : 'Services'}
              </button>
            </div>
          </div>

          {/* Catalog grid cards block */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(p => {
              const isLowStock = p.type === 'Product' && p.stock <= p.minStockAlert;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-205 border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs">
                  
                  {/* Top segment: badges & catalog details */}
                  <div className="p-5 text-start space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] bg-slate-100 font-bold px-2 py-0.5 rounded-lg text-slate-450 uppercase font-mono tracking-wider">
                        {p.sku}
                      </span>
                      <span className={`inline-flex items-center rounded-lg text-[9px] font-bold px-2 py-0.5 ${
                        p.type === 'Product' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {lang === 'ar' ? (p.type === 'Product' ? 'منتج مادي' : 'خدمة') : p.type}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        {lang === 'ar' ? p.nameAr : p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {lang === 'ar' ? p.descriptionAr : p.description}
                      </p>
                    </div>

                    {/* Cost ledger specifics split */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-semibold">{lang === 'ar' ? 'سعر البيع المقترح:' : 'Sales Retail Price:'}</span>
                        <span className="font-mono font-black text-slate-800">{p.price.toLocaleString()} SAR</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">{lang === 'ar' ? 'متوسط تكلفة التوريد:' : 'Average Unit Cost:'}</span>
                        <span className="font-mono text-slate-500">{p.cost ? p.cost.toLocaleString() + ' SAR' : 'N/A (Virtual)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock counter logic at bottom */}
                  <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {p.type === 'Product' ? (
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] text-slate-400 block tracking-wider font-bold">
                            {lang === 'ar' ? 'المخزون المتوفر بالشركة:' : 'PHYSICAL STOCK COUNT:'}
                          </span>
                          <span className={`font-mono text-sm font-black ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                            {p.stock} <span className="text-[8px] font-sans font-normal text-slate-400">units</span>
                          </span>
                          {isLowStock && (
                            <span className="text-[8px] bg-rose-50 text-rose-600 rounded px-1.5 block font-bold mt-0.5 uppercase">
                              {lang === 'ar' ? 'مستوى المخزون حرج!' : 'Low levels warning'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic">
                          {lang === 'ar' ? 'صنف خدمة (لا حصر لمخزونه مادي)' : 'Virtual / Consultation service'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      
                      {/* Adjust current stocks button (logistics movement) */}
                      {p.type === 'Product' && isEditable && (
                        <button
                          onClick={() => {
                            setSelectedProductForStock(p);
                            setMovementBranchId(currentBranchId !== 'all' ? currentBranchId : '');
                            setIsUpdatingStock(true);
                          }}
                          className="p-2 hover:bg-slate-200 text-slate-550 rounded-lg cursor-pointer duration-100 border-0 bg-transparent tooltip"
                          title={lang === 'ar' ? 'تسوية وتحديث كميات المخزن' : 'Post logistic inventory adjustments'}
                        >
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}

                      {/* Edit product properties button */}
                      {isEditable && (
                        <>
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-2 hover:bg-slate-200 text-slate-550 rounded-lg cursor-pointer duration-105 border-0 bg-transparent"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الصنف بالكامل؟' : 'Are you sure you want to delete this catalog item?')) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-550 rounded-lg cursor-pointer duration-105 border-0 bg-transparent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab: Warehouse Movements list representation */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-3">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 text-start">
              <History className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ar' ? 'سجل الحركات والتعديلات المخزنية المؤكدة' : 'Warehouse Inventory Activity Log'}</span>
            </h3>
            
            <div className="text-[10px] text-slate-400 font-mono">
              {lang === 'ar' ? `المعروض: ${filteredMovements.length} حركة` : `Showing: ${filteredMovements.length} movements`}
            </div>
          </div>

          <div className="overflow-x-auto text-xxs sm:text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-start">
                  <th className="p-4">{lang === 'ar' ? 'تاريخ الحركة' : 'Adjustment Date'}</th>
                  <th className="p-4">{lang === 'ar' ? 'الصنف المتأثر' : 'Catalog SKU & Name'}</th>
                  <th className="p-4 text-center">{lang === 'ar' ? 'الفرع / المستودع' : 'Storage Branch'}</th>
                  <th className="p-4">{lang === 'ar' ? 'الكمية' : 'Quantity Adjusted'}</th>
                  <th className="p-4">{lang === 'ar' ? 'المرجع اللوجستي' : 'Reference Suffix'}</th>
                  <th className="p-4 text-start">{lang === 'ar' ? 'توصيف الحركة الفعلي' : 'Ledger Notes / Reason'}</th>
                  <th className="p-4 text-center">{lang === 'ar' ? 'مستند إثبات رسمي' : 'Official Slip'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold italic">
                      {lang === 'ar' ? 'لا يوجد حركات مسجلة حالياً بهذا الفرع' : 'No logistics movements registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(mov => {
                    const prodInfo = getProductDetail(mov.productId);
                    return (
                      <tr key={mov.id} className="border-b border-slate-100 hover:bg-slate-50/70 text-start align-middle">
                        <td className="p-4 font-mono font-semibold text-slate-500 whitespace-nowrap">{mov.date}</td>
                        <td className="p-4 font-sans text-slate-700">
                          <div className="font-mono font-bold text-slate-900 leading-none mb-0.5">{prodInfo.sku}</div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[200px]" title={lang === 'ar' ? prodInfo.nameAr : prodInfo.name}>
                            {lang === 'ar' ? prodInfo.nameAr : prodInfo.name}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-650 font-bold font-sans">
                          {getBranchName(mov.branchId)}
                        </td>
                        <td className="p-4 font-mono font-black text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-bold gap-1 ${
                            mov.type === 'In' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {mov.type === 'In' ? '+' : '-'}{mov.quantity}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-500 text-[11px] whitespace-nowrap">{mov.reference}</td>
                        <td className="p-4 text-slate-450 italic max-w-[220px] truncate">
                          {lang === 'ar' ? mov.notesAr : mov.notes}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setViewingMovementVoucher(mov)}
                            className="text-slate-500 hover:text-emerald-605 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg duration-150 cursor-pointer inline-flex items-center justify-center gap-1 text-[10px] font-bold border border-slate-200 hover:border-emerald-250 bg-white shadow-sm font-sans"
                            title={lang === 'ar' ? 'عرض السند المخزني' : 'View official Warehouse Slip'}
                          >
                            <Printer className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                            <span>{mov.type === 'In' ? (lang === 'ar' ? 'سند توريد' : 'Inward Spec') : (lang === 'ar' ? 'سند صرف' : 'Dispatch Spec')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab: Supply Alerts block */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-start">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{lang === 'ar' ? 'تقرير النقص والتوريد للأصناف الهامة' : 'Shortage & Supply Upkeep Directory'}</span>
            </h3>
            <p className="text-slate-400 text-xxs sm:text-xs mt-1 leading-normal">
              {lang === 'ar' 
                ? 'تعمل القائمة التالية على فرز المنتجات المادية التي تجاوزت الحد الأدنى المسموح به للبيع والتخزين. يمكن من هنا اتخاذ إجراءات التوريد أو إصدار طلب شراء فوري.' 
                : 'Presents items requiring supplementary purchase cycles to prevent delivery delays.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto text-xxs sm:text-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-start">
                    <th className="p-4">SKU / Code</th>
                    <th className="p-4">{lang === 'ar' ? 'الصنف وتوصيفه' : 'Product Target'}</th>
                    <th className="p-4 text-center">{lang === 'ar' ? 'الرصيد المتبقي' : 'Warehouse Count'}</th>
                    <th className="p-4 text-center">{lang === 'ar' ? 'الحد الأدنى اللوجيستي' : 'Min Alert Threshold'}</th>
                    <th className="p-4 text-center">{lang === 'ar' ? 'رصيد العجز الفعلي' : 'Deficit Amount'}</th>
                    <th className="p-4 text-center">{lang === 'ar' ? 'الإجراء المقترح' : 'Upkeep Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold italic">
                        {lang === 'ar' ? 'كل المنتجات ممتازة ومستويات المخزون كافية كلياً' : 'All warehouse stock levels are healthy.'}
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map(p => {
                      const deficitQty = p.minStockAlert - p.stock;
                      return (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/70 text-start align-middle">
                          <td className="p-4 font-mono font-bold text-slate-800">{p.sku}</td>
                          <td className="p-4 font-sans font-semibold text-slate-700">
                            {lang === 'ar' ? p.nameAr : p.name}
                          </td>
                          <td className="p-4 text-center font-mono font-black text-rose-600">
                            {p.stock} units
                          </td>
                          <td className="p-4 text-center font-mono text-slate-500">
                            {p.minStockAlert} units
                          </td>
                          <td className="p-4 text-center font-mono font-black text-rose-700 bg-rose-50/50">
                            -{deficitQty} units
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedProductForStock(p);
                                setMovementType('In');
                                setMovementBranchId(currentBranchId !== 'all' ? currentBranchId : '');
                                setMovementReference('SUPPLY-CYCLE');
                                setMovementNotes('Upkeep batch warehouse replenishment');
                                setMovementNotesAr('توريد إضافي لرفع رصيد المخزن للحد الآمن بفرع المقر كاستحقاق معزز');
                                setIsUpdatingStock(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-100 rounded-lg cursor-pointer duration-100"
                            >
                              {lang === 'ar' ? 'تعبئة المستودع الآن' : 'Replenish Count'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STOCKS LEDGER CORRECTION POPUP MODAL */}
      {isUpdatingStock && selectedProductForStock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-350 shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-slide-in text-start">
            
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'حركة تسوية يدوية للمستودع' : 'Post Stocks Correction'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsUpdatingStock(false);
                  setSelectedProductForStock(null);
                  setStockError('');
                }}
                className="text-slate-400 hover:text-slate-650 bg-slate-200/55 p-1 rounded-lg border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="p-6 space-y-4 text-xs font-sans">
              {stockError && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold">
                  {stockError}
                </div>
              )}

              {/* Readonly product spec */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Product Link:</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{lang === 'ar' ? selectedProductForStock.nameAr : selectedProductForStock.name}</p>
                <p className="text-[10px] font-mono text-slate-600 mt-0.5">{selectedProductForStock.sku} (Current Balance: {selectedProductForStock.stock} units)</p>
              </div>

              {/* Action type: Inward / Outward */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'نوع التسوية اللوجستية' : 'Movement Type direction'}</label>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMovementType('In')}
                    className={`py-2 border-0 rounded-xl cursor-pointer duration-150 font-bold ${
                      movementType === 'In' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
                    }`}
                  >
                    {lang === 'ar' ? 'زيادة المخزون (+ In)' : 'Adjust inventory upwards'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('Out')}
                    className={`py-2 border-0 rounded-xl cursor-pointer duration-150 font-bold ${
                      movementType === 'Out' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
                    }`}
                  >
                    {lang === 'ar' ? 'إنقاص المخزون (- Out)' : 'Adjust inventory downwards'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'الكمية بالأعداد' : 'Quantity Adjusted count'}</label>
                  <input
                    type="number"
                    value={movementQty}
                    onChange={(e) => setMovementQty(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>

                {/* Target Branch Store */}
                <div>
                  <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'المستودع / الفرع' : 'Warehouse Location'}</label>
                  <select
                    value={movementBranchId}
                    onChange={(e) => setMovementBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الفرع --' : '-- Choose branch --'}</option>
                    {branches.map(brInfo => (
                      <option key={brInfo.id} value={brInfo.id}>
                        {lang === 'ar' ? brInfo.nameAr : brInfo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'رقم السند المرجعي اللوجيستي' : 'Logistic Suffix Settle No.'}</label>
                <input
                  type="text"
                  value={movementReference}
                  onChange={(e) => setMovementReference(e.target.value)}
                  placeholder="e.g. PO-CORP-01 or WASTE-023"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans uppercase font-bold"
                />
              </div>

              {/* Reason descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'ملاحظات (English)' : 'Logistics notes (English)'}</label>
                  <textarea
                    rows={3}
                    value={movementNotes}
                    onChange={(e) => setMovementNotes(e.target.value)}
                    placeholder="Wasted/damaged replacement..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'ملاحظات (العربية)' : 'Logistics notes (Arabic)'}</label>
                  <textarea
                    rows={3}
                    value={movementNotesAr}
                    onChange={(e) => setMovementNotesAr(e.target.value)}
                    placeholder="مثال: تلف، شراء شحنة إضافية..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans text-start"
                  />
                </div>
              </div>

              {/* Submit footer */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdatingStock(false);
                    setSelectedProductForStock(null);
                    setStockError('');
                  }}
                  className="py-2.5 px-5 bg-white border border-slate-200 cursor-pointer rounded-xl font-bold font-sans text-slate-500"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-850 cursor-pointer border-0 rounded-xl font-bold text-white shadow-sm"
                >
                  {lang === 'ar' ? 'اعتماد التحديث المخزني' : 'Register stock transaction'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAILED BRANDED PRINTABLE STOCK MOVEMENTS SLIP (A5 SIZE) */}
      {viewingMovementVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-in">
            
            {/* Modal Control Head */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'ar' 
                    ? `إشعار مخزني رقم: IMV-${viewingMovementVoucher.id.slice(-6).toUpperCase()}` 
                    : `Stock Voucher: IMV-${viewingMovementVoucher.id.slice(-6).toUpperCase()}`}
                </span>
              </h3>
              <button
                onClick={() => setViewingMovementVoucher(null)}
                className="text-slate-400 hover:text-slate-650 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-lg border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Mockup Area - Styled for A5 Formats */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 text-start custom-scrollbar">
              
              {/* THE WRAPPER TARGETED BY THE MEDIA-PRINT TARGET */}
              <div className="printable-area bg-white p-5 rounded-lg border border-slate-200 space-y-5 font-sans relative text-xs shadow-inner">
                
                {/* Official Structured Letterhead */}
                <div className="flex justify-between items-start border-b border-double border-slate-300 pb-4">
                  <div className="text-left space-y-0.5">
                    <span className="text-xs font-black text-slate-800 block">
                      {lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}
                    </span>
                    <p className="text-[9px] text-slate-500 max-w-[200px] leading-tight">
                      {lang === 'ar' ? systemSettings.companyAddressAr : systemSettings.companyAddress}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {systemSettings.companyPhone} | {systemSettings.companyEmail}
                    </p>
                  </div>

                  <div className="text-center">
                    {systemSettings.logoUrl ? (
                      <img 
                        src={systemSettings.logoUrl} 
                        alt="Company Logo" 
                        className="h-9 max-w-[100px] object-contain rounded-lg bg-white p-1 shadow-sm mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center rounded-lg font-mono font-bold text-xs mx-auto">
                        {(systemSettings.companyName || 'C')[0]}
                      </div>
                    )}
                    <span className="text-[8px] text-emerald-600 uppercase font-mono font-bold tracking-wider mt-1 block">
                      {lang === 'ar' ? 'سند مستودعي معتمد' : 'STOCKS ACTION'}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5 text-[9px] font-mono">
                    <p className="text-slate-800"><span className="text-slate-400">{lang === 'ar' ? 'رقم الإشعار:' : 'Voucher No:'}</span> <strong className="text-slate-900">IMV-{viewingMovementVoucher.id.slice(-6).toUpperCase()}</strong></p>
                    <p className="text-slate-500"><span className="text-slate-400">{lang === 'ar' ? 'التاريخ والوقت:' : 'Recorded At:'}</span> {viewingMovementVoucher.date}</p>
                    <p className="text-slate-600"><span className="text-slate-400">{lang === 'ar' ? 'السجل التجاري:' : 'C.R. No:'}</span> {systemSettings.registrationNo}</p>
                  </div>
                </div>

                {/* Subtitle Card */}
                <div className="text-center py-2 border-b border-slate-100 bg-slate-50/75 rounded-lg">
                  <h2 className="text-sm font-black text-slate-850 tracking-wide uppercase">
                    {lang === 'ar' 
                      ? (viewingMovementVoucher.type === 'In' ? 'إشعار توريد مخزني رسمي' : 'إشعار صرف مخزني رسمي') 
                      : (viewingMovementVoucher.type === 'In' ? 'OFFICIAL INWARD STOCK VOUCHER' : 'OFFICIAL GOODS DISPATCH VOUCHER')}
                  </h2>
                  <p className="text-[8px] text-slate-400 tracking-wider">
                    {lang === 'ar' ? 'مستند رقابي رسمي لإثبات مناقلة الحركات المخزنية وإدراج التحديث الفعلي بالأرفف' : 'Warehousing ledger item modification certificate - compliant with legal logistics protocols'}
                  </p>
                </div>

                {/* Primary Form Fields Block */}
                <div className="space-y-3 text-[10px]">
                  
                  {/* Row 1: Target Item SKU/Name */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'الصنف المستهدف:' : 'STOCK ITEM:'}
                    </span>
                    <div className="col-span-9 font-extrabold text-slate-900 text-start text-xs">
                      <p className="font-mono text-emerald-700 leading-none mb-1 font-black">
                        {getProductDetail(viewingMovementVoucher.productId).sku}
                      </p>
                      <p>
                        {lang === 'ar' ? getProductDetail(viewingMovementVoucher.productId).nameAr : getProductDetail(viewingMovementVoucher.productId).name}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Action Type direction */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'نوع حركة التحديث:' : 'BALANCE DIRECTION:'}
                    </span>
                    <p className="col-span-9 font-bold text-slate-800 text-start">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                        viewingMovementVoucher.type === 'In' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        {viewingMovementVoucher.type === 'In' 
                          ? (lang === 'ar' ? 'إضافة وتوريد للمستودع (+)' : 'Warehouse Replenishment (+)') 
                          : (lang === 'ar' ? 'سحب وصرف من المستودع (-)' : 'Warehouse Dispatch (-)')}
                      </span>
                    </p>
                  </div>

                  {/* Row 3: Adjusted quantity */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'الكمية المنقولة:' : 'QUANTITY ADAPTED:'}
                    </span>
                    <p className="col-span-9 font-black text-slate-900 font-mono text-start">
                      {viewingMovementVoucher.quantity} UNITS (وحدات مستندة)
                    </p>
                  </div>

                  {/* Row 4: Reason description */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'شرح سبب الحركة:' : 'LOGISTIC NOTES:'}
                    </span>
                    <p className="col-span-9 text-slate-700 italic text-start">
                      {viewingMovementVoucher.notesAr && lang === 'ar' ? viewingMovementVoucher.notesAr : (viewingMovementVoucher.notes || 'Routine stock ledger verification action')}
                    </p>
                  </div>

                  {/* Row 5: Branch and Reference Suffix */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-left font-mono text-[9px]">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider">{lang === 'ar' ? 'المستودع / الفرع:' : 'STORAGE SPACE BRANCH:'}</span>
                      <p className="text-slate-700 font-bold">{getBranchName(viewingMovementVoucher.branchId)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-right font-mono text-[9px]">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-right">{lang === 'ar' ? 'رقم السند المرجعي:' : 'REFERENCE SUFFIX:'}</span>
                      <p className="text-slate-700 font-bold">{viewingMovementVoucher.reference || 'SYSTEM'}</p>
                    </div>
                  </div>

                </div>

                {/* Sign-off & Seal section */}
                <div className="border-t border-slate-150 pt-3 grid grid-cols-2 gap-2 min-h-[80px] items-center">
                  
                  {/* Seal display */}
                  <div className="text-left space-y-1">
                    {systemSettings.showSealOnInvoices && (
                      <div>
                        {systemSettings.companySealUrl ? (
                          <img 
                            src={systemSettings.companySealUrl} 
                            alt="Company Seal" 
                            className="h-14 w-14 object-contain mix-blend-multiply opacity-90 rotate-[-1deg]"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full border-4 border-double border-emerald-600/65 flex flex-col items-center justify-center text-emerald-600/80 font-bold text-[5px] select-none scale-90 rotate-[-4deg]">
                            <span>LOGISTICS</span>
                            <span className="w-full border-t border-b border-emerald-600/20 py-0.5 my-0.5 text-center truncate scale-95">{systemSettings.companyName}</span>
                            <span className="font-extrabold">CONFIRMED</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Signature display */}
                  <div className="text-right space-y-0.5 text-right">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">
                      {lang === 'ar' ? 'توقيع أمين المستودع المسؤول:' : 'STOREKEEPER AUTHS:'}
                    </span>
                    {systemSettings.showSignatureOnInvoices && systemSettings.authorizedSignatureUrl ? (
                      <div className="h-8 w-24 flex items-center justify-end overflow-hidden ml-auto mr-0">
                        <img 
                          src={systemSettings.authorizedSignatureUrl} 
                          alt="Signature Slip" 
                          className="max-h-full object-contain mix-blend-multiply opacity-95"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <p className="font-serif italic text-slate-600 font-bold text-xs rotate-[-1deg] border-b border-slate-200 border-dashed inline-block px-3 py-0.5 text-right">
                        {lang === 'ar' ? 'مراقب المستودع' : 'Warehouse Inspector'}
                      </p>
                    )}
                  </div>

                </div>

              </div>
            </div>

            {/* Email dispatch drawer */}
            {showEmailInput && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-start no-print">
                <span className="font-bold text-slate-800 text-xxs uppercase tracking-wider block">
                  {lang === 'ar' ? 'إرسال السند بالبريد الإلكتروني' : 'Email Voucher Dispatch'}
                </span>
                
                <div className="flex gap-2 items-center">
                  <input
                    type="email"
                    value={emailTarget}
                    onChange={(e) => setEmailTarget(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none font-mono"
                    disabled={isSendingEmail}
                  />
                  
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0 border-0"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{lang === 'ar' ? 'إرسال' : 'Send'}</span>
                  </button>
                </div>

                {emailError && (
                  <p className="text-xxs text-rose-600 font-bold">{emailError}</p>
                )}
                {emailSuccess && (
                  <p className="text-xxs text-emerald-600 font-bold">{emailSuccess}</p>
                )}
              </div>
            )}

            {/* Bottom Actions footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-xxs font-bold">
              <span className="text-slate-400 font-mono">
                {lang === 'ar' ? 'سند مستودعي معتمد - قياس A5 مناسب' : 'Certified stock voucher - optimized A5 paper'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const existing = document.getElementById('print-size-style');
                    if (existing) existing.remove();
                    const style = document.createElement('style');
                    style.id = 'print-size-style';
                    style.innerHTML = `@media print { @page { size: A5; margin: 10mm; } }`;
                    document.head.appendChild(style);
                    window.print();
                  }}
                  className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs rounded-lg transition duration-100 border-0 flex items-center gap-1 shadow-sm font-sans"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailInput(prev => !prev)}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold cursor-pointer text-xs rounded-lg transition duration-100 flex items-center gap-1 shadow-sm font-sans"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إرسال بريد' : 'Email'}</span>
                </button>
                <button
                  onClick={() => setViewingMovementVoucher(null)}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer text-xs rounded-lg transition duration-100 border-0 font-sans"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
