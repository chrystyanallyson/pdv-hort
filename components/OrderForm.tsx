
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Order, OrderItem, Client, Product, OrderStatus } from '../types';
import { dataService } from '../dataService';
import { Icons } from '../constants';

interface OrderFormProps {
  orderToEdit: Order | null;
  onSave: () => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ orderToEdit, onSave, onCancel }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  React.useEffect(() => {
     dataService.getClients().then(setClients);
     dataService.getProducts().then(setProducts);
  }, []);
  
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);

  const defaultClient = clients.find(c => c.id === '1') || clients[0];
  const [clientSearch, setClientSearch] = useState(orderToEdit?.clientName || (orderToEdit ? '' : (defaultClient?.name || '')));
  const [selectedClientId, setSelectedClientId] = useState(orderToEdit?.clientId || (orderToEdit ? '' : (defaultClient?.id || '')));
  const [showClientResults, setShowClientResults] = useState(false);

  const [items, setItems] = useState<OrderItem[]>(orderToEdit?.items || []);
  const [discount, setDiscount] = useState(orderToEdit?.discount || 0);
  const [observations, setObservations] = useState(orderToEdit?.observations || '');

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);

  // Estados como string para total controle da digitação (evita que o texto suma)
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const filteredClients = useMemo(() => {
    const search = clientSearch.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(search)).slice(0, 5);
  }, [clients, clientSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    const search = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(search) || p.code.toLowerCase().includes(search)).slice(0, 5);
  }, [products, productSearch]);

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setClientSearch(client.name);
    setShowClientResults(false);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setNewItemPrice(product.defaultPrice ? product.defaultPrice.toString() : ''); 
    setNewItemQuantity('1');
    setShowProductResults(false);
    
    setTimeout(() => {
      if (qtyInputRef.current) {
        qtyInputRef.current.focus();
        qtyInputRef.current.select();
      }
    }, 50);
  };

  const handleAddItem = () => {
    const qty = parseFloat(newItemQuantity.replace(',', '.'));
    const price = parseFloat(newItemPrice.replace(',', '.'));

    if (!selectedProduct || isNaN(qty) || isNaN(price) || qty <= 0) return;

    const item: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unit: selectedProduct.unit,
      price: price,
      quantity: qty,
      total: price * qty
    };

    setItems([...items, item]);
    setSelectedProduct(null);
    setProductSearch('');
    setNewItemPrice('');
    setNewItemQuantity('1');
    productSearchRef.current?.focus();
  };

  const handleProductSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filteredProducts.length > 0) {
        e.preventDefault();
        handleSelectProduct(filteredProducts[0]);
      }
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      priceInputRef.current?.focus();
      priceInputRef.current?.select();
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedClientId) { alert("Selecione um cliente."); return; }
    if (items.length === 0) { alert("Adicione produtos."); return; }
    const client = clients.find(c => c.id === selectedClientId);
    await dataService.saveOrder({
      id: orderToEdit?.id,
      clientId: selectedClientId,
      clientName: client?.name || clientSearch,
      items, subtotal, discount, total, observations,
      status: orderToEdit?.status || OrderStatus.EMITTED
    });
    onSave();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-8 items-start pb-20 lg:pb-0">
      <div className="xl:col-span-8 space-y-4 lg:space-y-6">
        <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-200 p-4 lg:p-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-10">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 lg:mb-3">Cliente:</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl lg:rounded-2xl outline-none bg-white font-black text-slate-900 text-sm lg:text-base shadow-sm focus:border-emerald-500"
                    placeholder="Pesquisar..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setSelectedClientId('');
                      setShowClientResults(true);
                    }}
                    onFocus={() => setShowClientResults(true)}
                  />
                </div>
                {showClientResults && filteredClients.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                    {filteredClients.map(c => (
                      <button key={c.id} className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b last:border-0 flex justify-between items-center" onClick={() => handleSelectClient(c)}>
                        <span className="font-black uppercase text-xs text-slate-800">{c.name}</span>
                        <span className="text-[8px] bg-slate-100 px-2 py-1 rounded font-bold">Selecionar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Emissão</label>
                <div className="w-full px-6 py-4 border-2 border-emerald-50 rounded-2xl bg-emerald-50/20 font-black text-emerald-800 flex justify-between items-center">
                   <span className="text-sm">{orderToEdit?.date || new Date().toLocaleDateString('pt-BR')}</span>
                   <Icons.History />
                </div>
              </div>
           </div>

           <div className="mb-6 lg:mb-10 relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 lg:mb-3">Buscar Produto (Enter seleciona):</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 z-10"><Icons.Search /></span>
                <input 
                  type="text"
                  ref={productSearchRef}
                  onKeyDown={handleProductSearchKeyDown}
                  className="w-full pl-11 pr-4 py-4 lg:py-6 border-2 border-emerald-400 rounded-xl lg:rounded-[2rem] outline-none bg-white font-black text-base lg:text-xl text-slate-900 shadow-lg shadow-emerald-50 focus:ring-4 focus:ring-emerald-50"
                  placeholder="Nome ou Código..."
                  value={productSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductSearch(val);
                    if (selectedProduct && val.toLowerCase() !== selectedProduct.name.toLowerCase()) setSelectedProduct(null);
                    setShowProductResults(true);
                  }}
                  onFocus={() => setShowProductResults(true)}
                />
              </div>

              {showProductResults && filteredProducts.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-emerald-200 rounded-xl lg:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                  {filteredProducts.map((p, idx) => (
                    <button key={p.id} className={`w-full text-left px-4 lg:px-8 py-3 lg:py-5 hover:bg-emerald-50 border-b last:border-0 flex justify-between items-center ${idx === 0 ? 'bg-emerald-50/50' : ''}`} onClick={() => handleSelectProduct(p)}>
                      <div>
                        <span className="font-black text-slate-900 uppercase text-xs lg:text-lg block">{p.name}</span>
                        <span className="text-[8px] lg:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">#{p.code} • {p.unit}</span>
                      </div>
                      <Icons.Plus />
                    </button>
                  ))}
                </div>
              )}
           </div>

           {selectedProduct && (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6 p-4 lg:p-8 bg-emerald-50 rounded-xl lg:rounded-[2rem] border-2 border-emerald-100 animate-in zoom-in-95 mb-6 lg:mb-10 shadow-inner">
                <div className="col-span-1">
                   <label className="block text-[8px] lg:text-[10px] font-black text-emerald-700 uppercase mb-1">Quantidade ({selectedProduct.unit})</label>
                   <input 
                    type="text" 
                    inputMode="decimal"
                    ref={qtyInputRef} 
                    onKeyDown={handleQtyKeyDown}
                    className="w-full p-3 lg:p-5 bg-white border-2 border-emerald-200 rounded-xl font-black text-lg lg:text-2xl outline-none focus:border-emerald-500 text-slate-900" 
                    value={newItemQuantity} 
                    onChange={e => setNewItemQuantity(e.target.value)} 
                    onFocus={(e) => e.target.select()} 
                   />
                </div>
                <div className="col-span-1">
                   <label className="block text-[8px] lg:text-[10px] font-black text-emerald-700 uppercase mb-1">Preço R$</label>
                   <input 
                    type="text" 
                    inputMode="decimal"
                    ref={priceInputRef} 
                    onKeyDown={handlePriceKeyDown}
                    className="w-full p-3 lg:p-5 bg-white border-2 border-emerald-200 rounded-xl font-black text-lg lg:text-2xl outline-none focus:border-emerald-500 text-slate-900" 
                    placeholder="0,00" 
                    value={newItemPrice} 
                    onChange={e => setNewItemPrice(e.target.value)} 
                    onFocus={(e) => e.target.select()}
                   />
                </div>
                <div className="col-span-2 md:col-span-1 flex items-end">
                   <button onClick={handleAddItem} className="w-full bg-[#10b981] text-white font-black py-4 lg:py-5 rounded-xl uppercase text-[10px] lg:text-xs shadow-lg hover:bg-emerald-600 transition-all active:scale-95">Incluir Item (Enter)</button>
                </div>
             </div>
           )}

           <div className="overflow-hidden border border-slate-200 rounded-xl lg:rounded-[1.5rem]">
              <table className="hidden md:table w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Item</th>
                    <th className="px-8 py-5 text-center">Qtd</th>
                    <th className="px-8 py-5 text-right">Subtotal</th>
                    <th className="px-8 py-5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                         <span className="font-black text-slate-900 uppercase text-base block">{item.productName}</span>
                         <span className="text-[10px] font-bold text-emerald-600 uppercase">{item.unit} • R$ {item.price.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-6 text-center font-black text-slate-700">{item.quantity}</td>
                      <td className="px-8 py-6 text-right font-black text-emerald-700 text-lg">R$ {item.total.toFixed(2)}</td>
                      <td className="px-8 py-6"><button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors"><Icons.Trash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="md:hidden divide-y divide-slate-100 bg-white">
                {items.length === 0 && <div className="p-10 text-center text-[10px] font-black uppercase text-slate-300">Nenhum item adicionado</div>}
                {items.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-black text-slate-900 uppercase text-xs block">{item.productName}</span>
                      <div className="flex gap-2 text-[10px] font-bold mt-1 text-slate-500">
                        <span className="text-emerald-600 font-black">{item.quantity} {item.unit}</span>
                        <span>x R$ {item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-700">R$ {item.total.toFixed(2)}</span>
                      <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 p-2"><Icons.Trash /></button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-200 p-4 lg:p-8">
           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-4">Observações do Pedido:</label>
           <textarea className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-slate-100 rounded-xl outline-none bg-white font-bold text-slate-900 min-h-[80px] text-sm focus:border-emerald-500" placeholder="Ex: Entrega amanhã, frágil, faturar..." value={observations} onChange={e => setObservations(e.target.value)}></textarea>
        </div>
      </div>

      <div className="xl:col-span-4 lg:sticky lg:top-6 space-y-4 lg:space-y-6">
        <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
           <div className="bg-yellow-50 px-6 lg:px-10 py-4 lg:py-8 border-b border-yellow-100 flex items-center gap-3 lg:gap-4">
              <div className="text-yellow-700 p-2 lg:p-3 bg-white rounded-xl lg:rounded-2xl shadow-sm"><Icons.Save /></div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs lg:text-sm">Fechamento</h3>
           </div>
           
           <div className="p-6 lg:p-10 space-y-4 lg:space-y-8 bg-slate-50/30">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase text-slate-500">Subtotal Bruto</span>
                 <span className="font-black text-xl lg:text-2xl text-slate-900">R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-500">Desconto R$</label>
                    <span className="text-[10px] font-black text-red-600 uppercase">- R$ {discount.toFixed(2)}</span>
                 </div>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                    <input type="number" step="0.01" className="w-full pl-10 pr-4 py-4 border-2 border-slate-200 rounded-xl outline-none font-black text-red-600 text-center text-xl lg:text-3xl bg-white shadow-md focus:border-red-400" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} />
                 </div>
              </div>

              <div className="pt-6 lg:pt-8 border-t-2 border-dashed border-slate-200">
                 <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 lg:mb-3">Valor Líquido a Receber</p>
                 <div className="text-center font-black text-4xl lg:text-6xl text-slate-950 tracking-tighter">
                   <span className="text-xl lg:text-3xl text-slate-400 mr-1 lg:mr-2">R$</span>{total.toFixed(2)}
                 </div>
              </div>
           </div>

           <div className="p-6 lg:p-10 bg-white border-t border-slate-100 space-y-3 lg:space-y-4">
              <button onClick={handleSaveOrder} className="w-full bg-[#10b981] text-white font-black py-5 lg:py-7 rounded-xl lg:rounded-[2rem] shadow-xl hover:bg-[#059669] transition-all flex items-center justify-center gap-3 text-lg lg:text-xl transform active:scale-[0.97]">
                <Icons.Save /> FINALIZAR PEDIDO
              </button>
              <button onClick={onCancel} className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Limpar Lançamento</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
