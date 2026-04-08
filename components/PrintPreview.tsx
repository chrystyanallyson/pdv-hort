
import React from 'react';
import { Order, OrderStatus, CompanyConfig } from '../types';
import { dataService } from '../dataService';

interface PrintPreviewProps {
  order: Order;
  company: CompanyConfig;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ order, company }) => {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="print-area text-slate-900 bg-white w-full max-w-[21cm] mx-auto p-1 text-[8pt] leading-tight">
      {/* CABEÇALHO COM LOGO */}
      <div className="flex justify-between items-start border-b border-slate-900 pb-3 mb-3">
        <div className="flex gap-3 items-center">
          {company.logo && (
            <div className="w-16 h-16 shrink-0">
               <img src={company.logo} className="w-full h-full object-contain" alt="Logo Empresa" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{company.name}</h1>
            <p className="text-[7pt] font-bold uppercase tracking-wider text-slate-500">{company.subtitle}</p>
            <div className="mt-1 space-y-0.5">
              <p className="text-[6pt] font-medium text-slate-400 leading-tight">{company.address}</p>
              <p className="text-[6pt] font-medium text-slate-400">{company.phone} {company.cnpj && `| CNPJ: ${company.cnpj}`}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[7pt] font-bold border border-slate-300 px-1 py-0 rounded mb-1 inline-block">DOC. NÃO FISCAL</div>
          <div className="flex flex-col mt-1">
            <span className="text-[7pt] font-bold uppercase text-slate-400">PEDIDO DE VENDA</span>
            <span className="text-xl font-black text-slate-900 leading-none">#{order.number}</span>
          </div>
        </div>
      </div>

      {/* INFORMAÇÕES BÁSICAS COMPACTAS */}
      <div className="flex justify-between gap-4 mb-3 pb-2 border-b border-slate-200">
        <div className="flex-1">
          <label className="block text-[6pt] font-black text-slate-400 uppercase">Cliente:</label>
          <p className="font-black text-sm uppercase">{order.clientName}</p>
        </div>
        <div className="text-right">
          <label className="block text-[6pt] font-black text-slate-400 uppercase">Emissão:</label>
          <p className="font-bold text-xs">{order.date} {order.time}</p>
        </div>
      </div>

      {/* AVISO DE STATUS PAGO */}
      {order.status === OrderStatus.PAID && (
        <div className="mb-3 border border-emerald-600 p-1 text-center rounded bg-emerald-50">
          <h2 className="text-emerald-600 font-black text-xs uppercase italic">Pedido Pago / Finalizado</h2>
          {order.paymentDate && (
            <p className="text-[7pt] font-bold text-emerald-800 uppercase mt-0.5">
              Liquidado em: {order.paymentDate} às {order.paymentTime}
            </p>
          )}
        </div>
      )}

      {/* TABELA DE PRODUTOS */}
      <table className="w-full mb-4 border-collapse">
        <thead>
          <tr className="border-b border-slate-900 text-slate-500">
            <th className="py-1 text-left text-[7pt] font-black uppercase tracking-wider">Descrição do Produto</th>
            <th className="py-1 text-center text-[7pt] font-black uppercase tracking-wider w-12">Un.</th>
            <th className="py-1 text-center text-[7pt] font-black uppercase tracking-wider w-12">Qtd.</th>
            <th className="py-1 text-right text-[7pt] font-black uppercase tracking-wider w-20">Unitário</th>
            <th className="py-1 text-right text-[7pt] font-black uppercase tracking-wider w-20">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => (
            <tr key={item.id || idx} className="h-5">
              <td className="py-0.5 pr-2">
                <span className="font-bold text-slate-900 uppercase text-[8pt]">{item.productName}</span>
                <span className="text-[6pt] text-slate-400 ml-2">[{String(idx + 1).padStart(2, '0')}]</span>
              </td>
              <td className="py-0.5 text-center font-medium text-slate-600 text-[6.5pt]">{item.unit}</td>
              <td className="py-0.5 text-center font-black text-slate-800 text-[7pt]">{item.quantity}</td>
              <td className="py-0.5 text-right text-slate-600 text-[6.5pt]">R$ {Number(item.price).toFixed(2)}</td>
              <td className="py-0.5 text-right font-black text-slate-900 text-[7pt]">R$ {Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAIS E OBSERVAÇÕES */}
      <div className="flex gap-4 items-start break-inside-avoid">
        <div className="flex-1 space-y-2">
          <div className="border border-slate-200 p-2 rounded min-h-[40px]">
            <label className="block text-[6pt] font-black text-slate-400 uppercase mb-1">Observações do Pedido</label>
            <p className="text-[7pt] text-slate-600 italic leading-tight">
              {order.observations || 'Sem observações.'}
            </p>
          </div>
          {company.footerMsg && (
            <div className="text-center p-2 bg-slate-50 rounded border border-dashed border-slate-200">
               <p className="text-[7pt] font-bold text-slate-500 italic">{company.footerMsg}</p>
            </div>
          )}
        </div>
        
        <div className="w-48 space-y-0.5">
          <div className="flex justify-between text-slate-500">
            <span className="font-bold uppercase text-[7pt]">Subtotal</span>
            <span className="font-bold text-[7pt]">R$ {Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-500 pb-1 border-b border-slate-100">
            <span className="font-bold uppercase text-[7pt]">Desconto</span>
            <span className="font-bold italic text-[7pt]">- R$ {Number(order.discount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-[8pt] font-black uppercase text-slate-900">Total</span>
            <div className="text-right">
              <span className="text-[7pt] font-bold mr-1 text-slate-400">R$</span>
              <span className="text-xl font-black tracking-tighter text-slate-900">
                {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ASSINATURAS */}
      <div className="mt-8 border-t border-dashed border-slate-200 pt-4 break-inside-avoid">
        <div className="flex justify-between px-6 gap-10">
           <div className="flex-1 text-center">
              <div className="border-t border-slate-400 pt-1">
                <p className="text-[6pt] font-black uppercase text-slate-400 tracking-widest">Responsável</p>
              </div>
           </div>
           <div className="flex-1 text-center">
              <div className="border-t border-slate-400 pt-1">
                <p className="text-[6pt] font-black uppercase text-slate-400 tracking-widest">Cliente</p>
              </div>
           </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-[6pt] font-bold text-slate-300 uppercase tracking-[0.2em]">
            DOCUMENTO SEM VALOR FISCAL • Gerado por SisteMaster
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
