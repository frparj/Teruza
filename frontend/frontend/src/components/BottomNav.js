import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Home, Search, ShoppingCart, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  const navItems = [
    { icon: Home, label: t('home'), path: '/', testId: 'nav-home' },
    { icon: Search, label: t('search'), path: '/catalog', testId: 'nav-search' },
    { icon: ShoppingCart, label: t('cart'), path: '/cart', testId: 'nav-cart', badge: itemCount },
    { icon: Info, label: t('information'), path: '/information', testId: 'nav-info' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-muted z-50">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              data-testid={item.testId}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                {item.badge > 0 && (
                  <span
                    data-testid="cart-badge"
                    className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;