import { supabase } from './supabaseClient';
import { Order, OrderStatus, Client, Product, CompanyConfig } from './types';

const DEFAULT_COMPANY: CompanyConfig = {
  name: "SisteMaster Info",
  subtitle: "TECNOLOGIA E ASSISTÊNCIA",
  cnpj: "12.345.678/0001-99",
  address: "Av. da Informática, 1024",
  phone: "(11) 4004-1024",
  footerMsg: "Documento sem valor fiscal."
};

// Modificamos tudo para assíncrono para buscar da nuvem (Supabase)
export const dataService = {
  getCompanyConfig: async (): Promise<CompanyConfig> => {
    const { data, error } = await supabase.from('company_config').select('*').eq('id', 1).single();
    if (data && !error) {
      return {
        name: data.name,
        subtitle: data.subtitle,
        cnpj: data.cnpj,
        address: data.address,
        phone: data.phone,
        footerMsg: data.footer_msg,
        logo: data.logo
      };
    }
    return DEFAULT_COMPANY;
  },

  saveCompanyConfig: async (config: CompanyConfig): Promise<void> => {
    await supabase.from('company_config').upsert({
      id: 1,
      name: config.name,
      subtitle: config.subtitle,
      cnpj: config.cnpj,
      address: config.address,
      phone: config.phone,
      footer_msg: config.footerMsg,
      logo: config.logo
    });
  },

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('number', { ascending: false });
    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      number: d.number,
      date: d.date,
      time: d.time,
      paymentDate: d.payment_date,
      paymentTime: d.payment_time,
      clientId: d.client_id,
      clientName: d.client_name,
      items: d.items,
      subtotal: d.subtotal,
      discount: d.discount,
      total: d.total,
      observations: d.observations,
      status: d.status as OrderStatus
    }));
  },

  saveOrder: async (order: Partial<Order>): Promise<void> => {
    if (order.id) {
      await supabase.from('orders').update({
        client_id: order.clientId,
        client_name: order.clientName,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        observations: order.observations,
        status: order.status
      }).eq('id', order.id);
    } else {
      await supabase.from('orders').insert([{
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        client_id: order.clientId,
        client_name: order.clientName,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        observations: order.observations,
        status: order.status || OrderStatus.EMITTED
      }]);
    }
  },

  markOrderAsPaid: async (id: string): Promise<void> => {
    await supabase.from('orders').update({
      status: OrderStatus.PAID,
      payment_date: new Date().toLocaleDateString('pt-BR'),
      payment_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }).eq('id', id);
  },

  reversePayment: async (id: string): Promise<void> => {
    await supabase.from('orders').update({
      status: OrderStatus.EMITTED,
      payment_date: null,
      payment_time: null
    }).eq('id', id);
  },

  deleteOrder: async (id: string): Promise<void> => {
    await supabase.from('orders').delete().eq('id', id);
  },

  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error || !data) return [];
    return data.map(c => ({
      id: c.id,
      name: c.name,
      cpf_cnpj: c.cpf_cnpj,
      address: c.address,
      email: c.email,
      phone: c.phone
    }));
  },

  saveClient: async (client: Partial<Client>): Promise<void> => {
    if (client.id) {
      await supabase.from('clients').update({
        name: client.name,
        cpf_cnpj: client.cpf_cnpj,
        address: client.address,
        email: client.email,
        phone: client.phone
      }).eq('id', client.id);
    } else {
      await supabase.from('clients').insert([{
        name: client.name,
        cpf_cnpj: client.cpf_cnpj,
        address: client.address,
        email: client.email,
        phone: client.phone
      }]);
    }
  },

  deleteClient: async (id: string): Promise<void> => {
    await supabase.from('clients').delete().eq('id', id);
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error || !data) return [];
    return data.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      unit: p.unit,
      defaultPrice: p.default_price
    }));
  },

  saveProduct: async (product: Partial<Product>): Promise<void> => {
    if (product.id) {
      await supabase.from('products').update({
        code: product.code,
        name: product.name,
        unit: product.unit,
        default_price: product.defaultPrice
      }).eq('id', product.id);
    } else {
      await supabase.from('products').insert([{
        code: product.code,
        name: product.name,
        unit: product.unit,
        default_price: product.defaultPrice
      }]);
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    await supabase.from('products').delete().eq('id', id);
  }
};
