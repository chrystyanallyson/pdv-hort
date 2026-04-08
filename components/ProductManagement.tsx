
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { dataService } from '../dataService';
import { Icons } from '../constants';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  React.useEffect(() => { dataService.getProducts().then(setProducts); }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterText, setFilterText] = useState('');

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('KG');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.code.includes(filterText)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, filterText]);

  const handleOpenForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setCode(product.code);
      setName(product.name);
      setUnit(product.unit);
    } else {
      setEditingProduct(null);
      setCode('');
      setName('');
      setUnit('KG');
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    await dataService.saveProduct({ id: editingProduct?.id, code, name, unit });
    setProducts(await dataService.getProducts());
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6 pb-10">
      <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6">
        <div className="w-full md:w-1/2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600"><Icons.Search /></span>
          <input 
            type="text" 
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-black text-slate-900 text-sm" 
            placeholder="Pesquisar produto..."
            value={filterText} 
            onChange={e => setFilterText(e.target.value)} 
          />
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="w-full md:w-auto bg-[#10b981] text-white font-black px-8 py-3 rounded-xl shadow-lg hover:bg-[#059669] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
        >
          <Icons.Plus /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">Cód.</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5 text-center">Unidade</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700 bg-white">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-mono text-emerald-700 font-black">#{product.code}</td>
                  <td className="px-8 py-5 uppercase font-black text-slate-900">{product.name}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase border">{product.unit}</span>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenForm(product)} className="p-2 text-slate-400 hover:text-blue-600"><Icons.Edit /></button>
                    <button onClick={async () => { if(confirm('Excluir?')) { await dataService.deleteProduct(product.id); setProducts(await dataService.getProducts()); }}} className="p-2 text-slate-400 hover:text-red-600"><Icons.Trash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredProducts.map(product => (
            <div key={product.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="text-emerald-700 font-black text-[10px] block">#{product.code}</span>
                <h4 className="font-black text-slate-900 uppercase text-xs">{product.name}</h4>
                <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{product.unit}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleOpenForm(product)} className="p-2.5 text-blue-500 bg-blue-50 rounded-lg"><Icons.Edit /></button>
                <button onClick={async () => { if(confirm('Excluir?')) { await dataService.deleteProduct(product.id); setProducts(await dataService.getProducts()); }}} className="p-2.5 text-red-500 bg-red-50 rounded-lg"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-slate-200">
            <div className="p-4 lg:p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="font-black text-emerald-900 uppercase text-xs lg:text-base">Ficha do Produto</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-emerald-600 p-1"><Icons.XCircle /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 lg:p-8 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cód. Interno</label>
                  <input type="text" required className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm lg:text-base" value={code} onChange={e => setCode(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Descrição</label>
                  <input type="text" required className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm lg:text-base" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unidade</label>
                  <select className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm lg:text-base appearance-none" value={unit} onChange={e => setUnit(e.target.value)}>
                    <option value="KG">Quilograma (KG)</option>
                    <option value="UN">Unidade (UN)</option>
                    <option value="MAÇO">Maço (MAÇO)</option>
                    <option value="BD">Bandeja (BD)</option>
                    <option value="CX">Caixa (CX)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-slate-500 font-black uppercase text-[10px]">Cancelar</button>
                <button type="submit" className="bg-[#10b981] text-white font-black px-8 py-3 rounded-xl uppercase text-[10px] shadow-lg">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
