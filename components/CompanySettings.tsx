
import React, { useState, useRef } from 'react';
import { CompanyConfig } from '../types';
import { dataService } from '../dataService';
import { Icons } from '../constants';

const CompanySettings: React.FC = () => {
  const [config, setConfig] = useState<CompanyConfig>({
    name: "", subtitle: "", cnpj: "", address: "", phone: "", footerMsg: ""
  });
  React.useEffect(() => { dataService.getCompanyConfig().then(setConfig); }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await dataService.saveCompanyConfig(config);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    window.dispatchEvent(new Event('companyConfigUpdated'));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert("Logo deve ter menos de 1MB."); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setConfig({ ...config, logo: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-8 animate-in slide-in-from-bottom-2 pb-10">
      <div className="bg-white p-6 lg:p-10 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 text-emerald-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shrink-0 overflow-hidden">
             {config.logo ? <img src={config.logo} className="w-full h-full object-cover" alt="Logo" /> : <Icons.Settings />}
          </div>
          <div>
            <h3 className="text-lg lg:text-2xl font-black text-slate-800 uppercase">Empresa</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identidade do Negócio</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Logotipo</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 p-4 lg:p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl lg:rounded-3xl">
                <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {config.logo ? <img src={config.logo} className="w-full h-full object-contain p-1" alt="Preview" /> : <Icons.Box />}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase rounded-lg">Selecionar Imagem</button>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">Formatos PNG ou JPG até 1MB.</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Nome da Loja</label>
              <input type="text" required className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl lg:rounded-2xl outline-none focus:border-emerald-500 focus:bg-white font-black text-slate-900 shadow-inner" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Slogan</label>
              <input type="text" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-900 shadow-inner" value={config.subtitle} onChange={e => setConfig({...config, subtitle: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">WhatsApp</label>
              <input type="text" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-900 shadow-inner" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Endereço</label>
              <input type="text" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-900 shadow-inner" value={config.address} onChange={e => setConfig({...config, address: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Mensagem Rodapé</label>
              <textarea className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-900 shadow-inner min-h-[80px]" value={config.footerMsg} onChange={e => setConfig({...config, footerMsg: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
             {showSuccess && <div className="text-emerald-600 font-black text-[10px] uppercase animate-bounce">Configurações Atualizadas!</div>}
             <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-emerald-600 text-white font-black px-12 py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all uppercase text-xs flex items-center justify-center gap-2">
                {isSaving ? 'Salvando...' : <><Icons.Save /> Salvar Dados</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettings;
