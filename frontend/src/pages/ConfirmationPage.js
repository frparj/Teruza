import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const ConfirmationPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const lastOrder = localStorage.getItem('teruza-last-order');
    console.log('Confirmation page - lastOrder from localStorage:', lastOrder);
    
    if (lastOrder) {
      try {
        const parsedOrder = JSON.parse(lastOrder);
        console.log('Parsed order:', parsedOrder);
        setOrderData(parsedOrder);
        clearCart();
        localStorage.removeItem('teruza-last-order');
      } catch (error) {
        console.error('Failed to parse order data:', error);
        navigate('/');
      }
    } else {
      console.log('No order data found, redirecting to home');
      navigate('/');
    }
  }, [navigate, clearCart]);

  if (!orderData) return null;

  const handleOpenWhatsApp = () => {
    window.open(orderData.whatsappUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pb-20 min-h-screen flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <CheckCircle className="h-24 w-24 text-secondary mb-6" />
      </motion.div>
      
      <h1 className="text-3xl font-nunito font-bold mb-4 text-foreground text-center">
        {t('orderReady')}
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        {t('confirmWhatsApp')}
      </p>

      <div className="space-y-3 w-full max-w-md">
        <Button
          data-testid="open-whatsapp-button"
          onClick={handleOpenWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white h-12 rounded-full font-semibold text-lg active:scale-95 transition-transform"
        >
          {t('sendWhatsApp')}
        </Button>
        <Button
          data-testid="back-home-button"
          onClick={() => navigate('/')}
          variant="outline"
          className="w-full h-12 rounded-full font-semibold"
        >
          {t('home')}
        </Button>
      </div>
    </motion.div>
  );
};

export default ConfirmationPage;