import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export const CATEGORY_IMAGES = {
  'Bebidas': 'https://images.unsplash.com/photo-1632852521784-d85d5b62dd62',
  'Snacks': 'https://images.unsplash.com/photo-1641693148759-843d17ceac24',
  'Refeições Rápidas': 'https://images.unsplash.com/photo-1762631884747-8dabb217e11b',
  'Higiene': 'https://images.unsplash.com/photo-1750271336429-8b0a507785c0',
  'Emergências': 'https://images.unsplash.com/photo-1564144573017-8dc932e0039e',
  'Serviços': 'https://images.unsplash.com/photo-1724847885015-be191f1a47ef'
};

export const CATEGORIES = [
  'Bebidas',
  'Snacks',
  'Refeições Rápidas',
  'Higiene',
  'Emergências',
  'Serviços'
];

export const DELIVERY_FEE = 5.0;

export const WHATSAPP_NUMBER = '5521988760870';

export const generateWhatsAppMessage = (order, language) => {
  const { name, room, phone, deliveryPreference, notes, items, subtotal, deliveryFee, total } = order;
  
  let message = `*Teruza Hostel Mini Mercado - Novo Pedido*\n\n`;
  message += `📅 Data: ${new Date().toLocaleString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US')}\n`;
  message += `👤 Nome: ${name}\n`;
  message += `🚪 Quarto: ${room}\n`;
  message += `📱 Telefone: ${phone}\n`;
  message += `🚚 Entrega: ${deliveryPreference}\n`;
  if (notes) {
    message += `📝 Observações: ${notes}\n`;
  }
  message += `\n*Itens:*\n`;
  items.forEach(item => {
    message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
  });
  message += `\n💰 Subtotal: R$ ${subtotal.toFixed(2)}\n`;
  message += `🚚 Taxa de entrega: R$ ${deliveryFee.toFixed(2)}\n`;
  message += `*Total: R$ ${total.toFixed(2)}*`;
  
  return encodeURIComponent(message);
};