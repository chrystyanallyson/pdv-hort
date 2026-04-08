
import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { dataService } from '../dataService';
import { Icons } from '../constants';

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  React.useEffect(() => { dataService.getClients().then(setClients); }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterText, setFilterText] = useState('');

  const [name, setName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(filterText.toLowerCase()) ||
      (c.cpf_cnpj && c.cpf_cnpj.includes(filterText))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, filterText]);

  const handleOpenForm = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setCpfCnpj(client.cpf_cnpj || '');
      setAddress(client.address || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
    } else {
      setEditingClient(null);
      setName('');
      setCpfCnpj('');
      setAddress('');
      setEmail('');
      setPhone('');
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await dataService.saveClient({
      id: editingClient?.id,
      name, cpf_cnpj: cpfCnpj, address, email, phone
    });
    setClients(await dataService.getClients());
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6 pb-10">
      <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6">
        <div className="w-full md:w-1/2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
          <input 
            type="text" 
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-900 text-sm" 
            placeholder="Pesquisar cliente..."
            value={filterText} 
            onChange={e => setFilterText(e.target.value)} 
          />
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="w-full md:w-auto bg-[#00a859] text-white font-black px-8 py-3 rounded-xl shadow-lg hover:bg-[#00904d] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
        >
          <Icons.Plus /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700 bg-white">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-950 uppercase">{client.name}</td>
                  <td className="px-8 py-5 font-mono text-xs text-slate-600">{client.cpf_cnpj || '---'}</td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenForm(client)} className="p-2 text-slate-400 hover:text-blue-600"><Icons.Edit /></button>
                    <button onClick={async () => { if(confirm('Excluir?')) { await dataService.deleteClient(client.id); setClients(await dataService.getClients()); }}} className="p-2 text-slate-400 hover:text-red-600"><Icons.Trash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredClients.map(client => (
            <div key={client.id} className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="font-black text-slate-900 uppercase text-sm">{client.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenForm(client)} className="p-2.5 text-blue-500 bg-blue-50 rounded-lg"><Icons.Edit /></button>
                  <button onClick={async () => { if(confirm('Excluir?')) { await dataService.deleteClient(client.id); setClients(await dataService.getClients()); }}} className="p-2.5 text-red-500 bg-red-50 rounded-lg"><Icons.Trash /></button>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                {client.cpf_cnpj || 'Sem Identificação'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-slate-200">
            <div className="p-4 lg:p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase text-xs lg:text-base">Dados do Cliente</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 p-1"><Icons.XCircle /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 lg:p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nome *</label>
                  <input type="text" required className="w-full px-4 py-2 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm lg:text-base" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CPF/CNPJ</label>
                  <input type="text" className="w-full px-4 py-2 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm lg:text-base" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Telefone</label>
                  <input type="text" className="w-full px-4 py-2 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm lg:text-base" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-slate-500 font-black uppercase text-[10px]">Cancelar</button>
                <button type="submit" className="bg-[#00a859] text-white font-black px-8 py-3 rounded-xl uppercase text-[10px] shadow-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
