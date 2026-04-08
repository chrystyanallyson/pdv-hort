
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { dataService } from '../dataService';
import { Icons } from '../constants';

interface OrderHistoryProps {
  onEdit: (order: Order) => void;
  onPrint: (order: Order) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onEdit, onPrint }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  React.useEffect(() => { dataService.getOrders().then(setOrders); }, []);
  
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modais
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);
  const [orderToReverse, setOrderToReverse] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchTerm = filterText.trim().toLowerCase();
      const matchText = !searchTerm || 
                       order.clientName.toLowerCase().includes(searchTerm) || 
                       order.number.toString().includes(searchTerm);
      
      const matchStatus = filterStatus === 'TODOS' || order.status === filterStatus;
      
      const parseBrDate = (dateStr: string) => {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return new Date(0);
        const [day, month, year] = parts.map(Number);
        const d = new Date(year, month - 1, day);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const orderDate = parseBrDate(order.date);
      const orderTime = orderDate.getTime();
      
      let matchPeriod = true;
      if (startDate) {
        const [sy, sm, sd] = startDate.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd);
        start.setHours(0, 0, 0, 0);
        if (orderTime < start.getTime()) matchPeriod = false;
      }
      if (endDate) {
        const [ey, em, ed] = endDate.split('-').map(Number);
        const end = new Date(ey, em - 1, ed);
        end.setHours(0, 0, 0, 0);
        if (orderTime > end.getTime()) matchPeriod = false;
      }

      return matchText && matchStatus && matchPeriod;
    }).sort((a, b) => b.number - a.number);
  }, [orders, filterText, filterStatus, startDate, endDate]);

  const totals = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      acc.count++;
      if (order.status === OrderStatus.PAID) {
        acc.paid += order.total;
      } else {
        acc.pending += order.total;
      }
      return acc;
    }, { count: 0, paid: 0, pending: 0 });
  }, [filteredOrders]);

  const handleProcessPayment = async () => {
    if (!orderToPay) return;
    setIsProcessing(true);
    await dataService.markOrderAsPaid(orderToPay.id);
    setOrders(await dataService.getOrders());
    setOrderToPay(null);
    setIsProcessing(false);
  };

  const handleProcessReverse = async () => {
    if (!orderToReverse) return;
    setIsProcessing(true);
    await dataService.reversePayment(orderToReverse.id);
    setOrders(await dataService.getOrders());
    setOrderToReverse(null);
    setIsProcessing(false);
  };

  const handleProcessDelete = async () => {
    if (!orderToDelete) return;
    setIsProcessing(true);
    await dataService.deleteOrder(orderToDelete.id);
    setOrders(await dataService.getOrders());
    setOrderToDelete(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4 lg:space-y-8 pb-10">
      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 lg:w-14 lg:h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Icons.History />
          </div>
          <div>
            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Vendas</p>
            <p className="text-xl lg:text-2xl font-black text-slate-900">{totals.count}</p>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 lg:w-14 lg:h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Icons.Check />
          </div>
          <div>
            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Liquidado</p>
            <p className="text-xl lg:text-2xl font-black text-emerald-700">R$ {totals.paid.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 lg:w-14 lg:h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Icons.Save />
          </div>
          <div>
            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Em Aberto</p>
            <p className="text-xl lg:text-2xl font-black text-amber-700">R$ {totals.pending.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Buscar Venda</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-bold text-slate-900 text-sm" 
                placeholder="Cliente ou Nº..." 
                value={filterText} 
                onChange={e => setFilterText(e.target.value)} 
              />
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Início</label>
              <input type="date" className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fim</label>
              <input type="date" className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
            <select className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-slate-900 text-xs appearance-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="TODOS">Todos</option>
              <option value={OrderStatus.EMITTED}>Emitidos</option>
              <option value={OrderStatus.PAID}>Pagos</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <button 
              onClick={() => {setFilterText(''); setFilterStatus('TODOS'); setStartDate(''); setEndDate('');}} 
              className="w-full py-3 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-all border-2 border-dashed border-slate-200 rounded-xl"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Listagem Responsiva */}
      <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-5">Venda</th>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Emissão</th>
                <th className="px-8 py-5 text-right">Total</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700 bg-white">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-emerald-700 font-black">#{order.number}</td>
                  <td className="px-8 py-5 uppercase text-slate-900">{order.clientName}</td>
                  <td className="px-8 py-5 text-slate-500 text-xs">{order.date} <span className="opacity-40">{order.time}</span></td>
                  <td className="px-8 py-5 text-right font-black text-slate-950">R$ {order.total.toFixed(2)}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border ${order.status === OrderStatus.PAID ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-1.5">
                      {order.status === OrderStatus.EMITTED && (
                        <button onClick={() => setOrderToPay(order)} className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm hover:bg-emerald-600 transition-colors"><Icons.Check /></button>
                      )}
                      {order.status === OrderStatus.PAID && (
                        <button onClick={() => setOrderToReverse(order)} className="p-2 bg-orange-500 text-white rounded-lg shadow-sm hover:bg-orange-600 transition-colors"><Icons.Undo /></button>
                      )}
                      <button onClick={() => onPrint(order)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Icons.Printer /></button>
                      <button onClick={() => onEdit(order)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Icons.Edit /></button>
                      <button onClick={() => setOrderToDelete(order)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-300 font-black text-xs uppercase italic">Sem registros</div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-emerald-700 font-black text-xs">#{order.number}</span>
                    <h4 className="font-black text-slate-900 uppercase text-xs mt-0.5">{order.clientName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{order.date} • {order.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${order.status === OrderStatus.PAID ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                  <span className="font-black text-slate-950 text-base">R$ {order.total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => onPrint(order)} className="py-3 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase"><Icons.Printer /></button>
                  <button onClick={() => onEdit(order)} className="py-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase"><Icons.Edit /></button>
                  <button onClick={() => setOrderToDelete(order)} className="py-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase"><Icons.Trash /></button>
                </div>

                {order.status === OrderStatus.EMITTED && (
                  <button onClick={() => setOrderToPay(order)} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase shadow-lg shadow-emerald-50">
                    <Icons.Check /> Liquidar Venda
                  </button>
                )}
                {order.status === OrderStatus.PAID && (
                  <button onClick={() => setOrderToReverse(order)} className="w-full py-3.5 bg-orange-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase shadow-lg shadow-orange-50">
                    <Icons.Undo /> Estornar Pagamento
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Pagamento */}
      {orderToPay && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner"><Icons.Check /></div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Confirmar Recebimento</h3>
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total a Pagar</p>
                <div className="text-4xl font-black text-slate-950">R$ {orderToPay.total.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setOrderToPay(null)} className="py-4 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-xl uppercase text-[10px]">Voltar</button>
                <button onClick={handleProcessPayment} disabled={isProcessing} className="py-4 bg-emerald-600 text-white font-black rounded-xl uppercase text-[10px] flex items-center justify-center gap-2">
                  {isProcessing ? '...' : 'Liquidar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Estorno - Corrigido */}
      {orderToReverse && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner"><Icons.Undo /></div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Estornar Venda?</h3>
              <p className="text-xs font-bold text-slate-400 px-6">O status do pedido #{orderToReverse.number} voltará para "Emitido".</p>
              <div className="bg-orange-50/50 p-6 rounded-2xl border-2 border-orange-100">
                <p className="text-[10px] font-black text-orange-400 uppercase mb-1">Valor a Estornar</p>
                <div className="text-4xl font-black text-slate-950">R$ {orderToReverse.total.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setOrderToReverse(null)} className="py-4 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-xl uppercase text-[10px]">Manter Pago</button>
                <button onClick={handleProcessReverse} disabled={isProcessing} className="py-4 bg-orange-600 text-white font-black rounded-xl uppercase text-[10px] flex items-center justify-center gap-2">
                   {isProcessing ? '...' : 'Confirmar Estorno'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exclusão */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner"><Icons.Trash /></div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Excluir Registro?</h3>
              <p className="text-xs font-bold text-slate-400 px-8">Tem certeza que deseja remover permanentemente a venda #{orderToDelete.number}?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setOrderToDelete(null)} className="py-4 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-xl uppercase text-[10px]">Não, Manter</button>
                <button onClick={handleProcessDelete} disabled={isProcessing} className="py-4 bg-red-600 text-white font-black rounded-xl uppercase text-[10px] flex items-center justify-center gap-2">
                  {isProcessing ? '...' : 'Sim, Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
