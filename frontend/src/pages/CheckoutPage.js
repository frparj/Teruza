import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { formatCurrency, WHATSAPP_NUMBER, generateWhatsAppMessage } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DDI_OPTIONS = [
  { code: '+55', key: '+55' },
  { code: '+54', key: '+54' },
  { code: '+57', key: '+57' },
  { code: '+56', key: '+56' },
  { code: '+51', key: '+51' },
  { code: '+58', key: '+58' },
  { code: '+593', key: '+593' },
  { code: '+591', key: '+591' },
  { code: '+595', key: '+595' },
  { code: '+598', key: '+598' },
  { code: 'OTHER', key: 'OTHER' },
];

const CheckoutPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { cart, getTotal } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState('5521988760870');
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    ddi: '+55',
    customDdi: '',
    phone: '',
    deliveryPreference: 'door',
    notes: '',
  });

  const total = getTotal();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setWhatsappNumber(response.data.whatsapp_number);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Use default if fetch fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.room || !formData.phone) {
      toast.error(t('fillAllFields'));
      return;
    }

    const ddiCode = formData.ddi === 'OTHER' ? formData.customDdi : formData.ddi;
    const fullPhone = `${ddiCode}${formData.phone}`;
    
    const orderItems = cart.map(item => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    const order = {
      guest_name: formData.name,
      room_number: formData.room,
      phone: fullPhone,
      delivery_preference: formData.deliveryPreference === 'door' ? t('atTheDoor') : t('handToMe'),
      notes: formData.notes,
      items: orderItems,
      total,
    };

    try {
      // Create order in backend
      await axios.post(`${API}/orders`, order);
      
      // Generate WhatsApp message
      const displayOrder = {
        name: formData.name,
        room: formData.room,
        phone: fullPhone,
        deliveryPreference: order.delivery_preference,
        notes: formData.notes,
        items: cart,
        total,
      };
      
      const message = generateWhatsAppMessage(displayOrder, language);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      // Store order data
      const orderDataToStore = { order: displayOrder, whatsappUrl };
      localStorage.setItem('teruza-last-order', JSON.stringify(orderDataToStore));
      
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      navigate('/confirmation');
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order. Please try again.');
    }
  };

  const handleCopyOrder = () => {
    const ddiCode = formData.ddi === 'OTHER' ? formData.customDdi : formData.ddi;
    const fullPhone = `${ddiCode}${formData.phone}`;
    
    const order = {
      name: formData.name,
      room: formData.room,
      phone: fullPhone,
      deliveryPreference: formData.deliveryPreference === 'door' ? t('atTheDoor') : t('handToMe'),
      notes: formData.notes,
      items: cart,
      total,
    };

    const message = generateWhatsAppMessage(order, language);
    const decoded = decodeURIComponent(message);
    
    navigator.clipboard.writeText(decoded);
    toast.success(t('orderCopied'));
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 min-h-screen"
    >
      <div className="p-4">
        <h1 className="text-3xl font-nunito font-bold mb-6 text-foreground">
          {t('checkout')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              {t('guestName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              data-testid="input-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 rounded-lg bg-white"
              required
            />
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <Label htmlFor="room" className="text-sm font-semibold">
              {t('roomNumber')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="room"
              data-testid="input-room"
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="h-12 rounded-lg bg-white"
              required
            />
          </div>

          {/* Phone with DDI */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t('phone')} <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Select
                data-testid="select-ddi"
                value={formData.ddi}
                onValueChange={(value) => setFormData({ ...formData, ddi: value })}
              >
                <SelectTrigger className="w-[140px] h-12 rounded-lg bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DDI_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.code}>
                      {option.code === 'OTHER' ? t(`ddi.${option.key}`) : `${option.code} ${t(`ddi.${option.key}`)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.ddi === 'OTHER' && (
                <Input
                  data-testid="input-custom-ddi"
                  type="text"
                  placeholder="+"
                  value={formData.customDdi}
                  onChange={(e) => setFormData({ ...formData, customDdi: e.target.value })}
                  className="w-20 h-12 rounded-lg bg-white"
                  required
                />
              )}
              <Input
                data-testid="input-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="flex-1 h-12 rounded-lg bg-white"
                required
              />
            </div>
          </div>

          {/* Delivery Preference */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('deliveryPreference')}</Label>
            <RadioGroup
              data-testid="delivery-preference"
              value={formData.deliveryPreference}
              onValueChange={(value) => setFormData({ ...formData, deliveryPreference: value })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 bg-card p-4 rounded-lg border border-muted">
                <RadioGroupItem value="door" id="door" data-testid="delivery-door" />
                <Label htmlFor="door" className="flex-1 cursor-pointer">
                  {t('atTheDoor')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-card p-4 rounded-lg border border-muted">
                <RadioGroupItem value="hand" id="hand" data-testid="delivery-hand" />
                <Label htmlFor="hand" className="flex-1 cursor-pointer">
                  {t('handToMe')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              {t('notes')}
            </Label>
            <Textarea
              id="notes"
              data-testid="input-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[100px] rounded-lg bg-white"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-xl p-4 space-y-2 border border-muted">
            <div className="flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Note */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            {t('paymentNote')}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="submit"
              data-testid="send-whatsapp-button"
              className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white h-12 rounded-full font-semibold text-lg active:scale-95 transition-transform"
            >
              {t('sendWhatsApp')}
            </Button>
            <Button
              type="button"
              data-testid="copy-order-button"
              onClick={handleCopyOrder}
              variant="outline"
              className="w-full h-12 rounded-full font-semibold"
            >
              {t('copyOrder')}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;