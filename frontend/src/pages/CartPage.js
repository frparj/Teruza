import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency, DELIVERY_FEE } from '@/lib/utils';

const CartPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();

  const subtotal = getTotal();
  const total = subtotal + DELIVERY_FEE;

  if (cart.length === 0) {
    return (
      <div className="pb-20 min-h-screen flex flex-col items-center justify-center p-6">
        <ShoppingBag className="h-24 w-24 text-muted mb-4" />
        <h2 className="text-2xl font-nunito font-bold mb-2 text-foreground">
          {t('emptyCart')}
        </h2>
        <p className="text-muted-foreground mb-6 text-center">
          {t('continueShopping')}
        </p>
        <Button
          data-testid="continue-shopping-button"
          onClick={() => navigate('/catalog')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-full font-semibold"
        >
          {t('start')}
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen">
      <div className="p-4">
        <h1 className="text-3xl font-nunito font-bold mb-6 text-foreground">
          {t('cart')}
        </h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              data-testid={`cart-item-${item.id}`}
              className="bg-card rounded-xl shadow-md p-4 flex gap-4"
            >
              {item.image_url && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                <p className="text-primary font-bold mb-2">
                  {formatCurrency(item.price)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    data-testid={`decrease-quantity-${item.id}`}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold w-8 text-center" data-testid={`quantity-${item.id}`}>
                    {item.quantity}
                  </span>
                  <Button
                    data-testid={`increase-quantity-${item.id}`}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                data-testid={`remove-item-${item.id}`}
                onClick={() => removeFromCart(item.id)}
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-muted p-4 shadow-lg">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('deliveryFee')}</span>
            <span className="font-semibold">{formatCurrency(DELIVERY_FEE)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-muted pt-2">
            <span>{t('total')}</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
          <Button
            data-testid="checkout-button"
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full font-semibold text-lg active:scale-95 transition-transform"
          >
            {t('checkout')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;