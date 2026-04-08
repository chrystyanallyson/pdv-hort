
import React, { useState, useEffect } from 'react';
import { View, Order, OrderStatus, CompanyConfig } from './types';
import { Icons, COMPANY_NAME, COMPANY_SUBTITLE } from './constants';
import { dataService } from './dataService';
import Login from './components/Login';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import PrintPreview from './components/PrintPreview';
import ClientManagement from './components/ClientManagement';
import ProductManagement from './components/ProductManagement';
import CompanySettings from './components/CompanySettings';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [view, setView] = useState<View>('LOGIN');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [company, setCompany] = useState<CompanyConfig>({
    name: "Carregando...", subtitle: "", cnpj: "", address: "", phone: "", footerMsg: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || null);
        setView('ORDER_FORM');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || null);
        setView('ORDER_FORM');
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        setView('LOGIN');
      }
    });

    const updateCompany = async () => setCompany(await dataService.getCompanyConfig());
    updateCompany();
    window.addEventListener('companyConfigUpdated', updateCompany);
    return () => {
      window.removeEventListener('companyConfigUpdated', updateCompany);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    // Handled by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSidebarOpen(false);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setView('ORDER_FORM');
    setIsSidebarOpen(false);
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
  };

  const navigate = (newView: View) => {
    setView(newView);
    setIsSidebarOpen(false);
    if (newView !== 'ORDER_FORM') setEditingOrder(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-['Inter'] relative">
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden no-print"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#064e3b] text-white flex flex-col no-print shrink-0 shadow-2xl z-40 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] w-10 h-10 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
               {company.logo ? (
                 <img src={company.logo} className="w-full h-full object-cover" alt="Logo Sidebar" />
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-2.5 4-3 5.5-4.1 11.2A7 7 0 0 1 11 20z"/></svg>
               )}
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-lg leading-tight uppercase tracking-tighter truncate">{company.name}</h1>
              <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest truncate">{company.subtitle}</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-emerald-400 hover:text-white transition-colors">
            <Icons.XCircle />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest px-4 mb-3">Menu Principal</p>
          
          <button 
            onClick={() => navigate('ORDER_FORM')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${view === 'ORDER_FORM' ? 'bg-[#10b981] text-white shadow-lg' : 'text-emerald-100/60 hover:bg-emerald-900/40'}`}
          >
            <Icons.Plus />
            <span>Nova Venda</span>
          </button>

          <button 
            onClick={() => navigate('ORDER_HISTORY')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${view === 'ORDER_HISTORY' ? 'bg-[#10b981] text-white shadow-lg' : 'text-emerald-100/60 hover:bg-emerald-900/40'}`}
          >
            <Icons.History />
            <span>Histórico</span>
          </button>

          <button 
            onClick={() => navigate('CLIENT_MANAGEMENT')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${view === 'CLIENT_MANAGEMENT' ? 'bg-[#10b981] text-white shadow-lg' : 'text-emerald-100/60 hover:bg-emerald-900/40'}`}
          >
            <Icons.Users />
            <span>Clientes</span>
          </button>

          <button 
            onClick={() => navigate('PRODUCT_MANAGEMENT')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${view === 'PRODUCT_MANAGEMENT' ? 'bg-[#10b981] text-white shadow-lg' : 'text-emerald-100/60 hover:bg-emerald-900/40'}`}
          >
            <Icons.Box />
            <span>Produtos</span>
          </button>

          <button 
            onClick={() => navigate('COMPANY_SETTINGS')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${view === 'COMPANY_SETTINGS' ? 'bg-[#10b981] text-white shadow-lg' : 'text-emerald-100/60 hover:bg-emerald-900/40'}`}
          >
            <Icons.Settings />
            <span>Empresa</span>
          </button>
        </nav>

        <div className="p-4 border-t border-emerald-900/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-red-200 font-black text-xs uppercase bg-red-500/10 hover:bg-red-500/20 transition-all tracking-widest"
          >
            <Icons.Logout /> Sair
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 no-print shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-emerald-50 text-emerald-600 rounded-xl active:scale-95 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
              <h2 className="text-slate-900 font-black uppercase tracking-tight text-sm lg:text-xl truncate leading-none">
                {view === 'ORDER_FORM' && (editingOrder ? `Venda #${editingOrder.number}` : 'PDV Master')}
                {view === 'ORDER_HISTORY' && 'Histórico'}
                {view === 'CLIENT_MANAGEMENT' && 'Clientes'}
                {view === 'PRODUCT_MANAGEMENT' && 'Produtos'}
                {view === 'COMPANY_SETTINGS' && 'Configurações'}
              </h2>
              {view === 'ORDER_FORM' && !editingOrder && <span className="text-[9px] lg:text-[10px] font-bold text-emerald-600 uppercase lg:mt-1">Caixa Aberto</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Usuário</p>
                <p className="text-xs font-black text-slate-800 truncate max-w-[150px]">{userEmail || 'Admin'}</p>
             </div>
             <div className="w-9 h-9 lg:w-11 lg:h-11 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-slate-500">
                <Icons.Users />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 lg:p-8 no-print animate-in fade-in duration-300">
          <div className="max-w-[1600px] mx-auto">
            {view === 'ORDER_FORM' && (
              <OrderForm 
                orderToEdit={editingOrder} 
                onSave={() => setView('ORDER_HISTORY')} 
                onCancel={() => { setEditingOrder(null); setView('ORDER_HISTORY'); }}
              />
            )}
            {view === 'ORDER_HISTORY' && (
              <OrderHistory 
                onEdit={handleEditOrder} 
                onPrint={handlePrint}
              />
            )}
            {view === 'CLIENT_MANAGEMENT' && <ClientManagement />}
            {view === 'PRODUCT_MANAGEMENT' && <ProductManagement />}
            {view === 'COMPANY_SETTINGS' && <CompanySettings />}
          </div>
        </main>
      </div>

      {/* Modal Impressão */}
      {printingOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col h-[90vh] lg:h-auto lg:max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 lg:p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-sm lg:text-lg">Pré-visualização</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Recibo de Venda #{printingOrder.number}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition shadow-lg text-xs"
                >
                  <Icons.Printer /> Imprimir
                </button>
                <button 
                  onClick={() => setPrintingOrder(null)} 
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Icons.XCircle />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 lg:p-10 bg-slate-200 flex justify-center">
              <div className="bg-white shadow-2xl w-full max-w-[21cm] p-4 lg:p-[1.5cm] border border-slate-300">
                <PrintPreview order={printingOrder} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="print-only">
        {printingOrder && <PrintPreview order={printingOrder} />}
      </div>
    </div>
  );
};

export default App;
