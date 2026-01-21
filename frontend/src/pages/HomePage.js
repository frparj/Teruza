import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const getCategoryName = (category) => {
    if (language === 'pt') return category.name_pt;
    if (language === 'es') return category.name_es;
    return category.name_en;
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 sm:p-8 rounded-b-3xl mb-6"
      >
        <h1 className="text-4xl sm:text-5xl font-nunito font-bold text-foreground mb-4 leading-tight">
          {t('headline')}
        </h1>
        <Button
          data-testid="start-button"
          onClick={() => navigate('/catalog')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-full font-semibold text-lg active:scale-95 transition-transform shadow-md"
        >
          {t('start')}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>

      {/* Categories Section */}
      <div className="px-4 mb-8">
        <h2 className="text-2xl font-nunito font-bold mb-4 text-foreground">
          {t('categories')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const translatedCategory = t(`category.${category}`);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigate(`/catalog?category=${encodeURIComponent(category)}`)}
                className="bg-card rounded-xl shadow-md overflow-hidden cursor-pointer active:scale-95 transition-transform hover:shadow-lg"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={CATEGORY_IMAGES[category]}
                    alt={category}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 min-h-[60px] flex items-center justify-center">
                  <h3
                    className="font-nunito font-bold text-sm text-center leading-tight"
                    dangerouslySetInnerHTML={{ __html: translatedCategory }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;