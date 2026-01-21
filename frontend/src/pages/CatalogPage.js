import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { active_only: true };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product) => {
    if (language === 'pt') return product.name_pt;
    if (language === 'es') return product.name_es;
    return product.name_en;
  };

  const getProductDesc = (product) => {
    if (language === 'pt') return product.desc_pt;
    if (language === 'es') return product.desc_es;
    return product.desc_en;
  };

  const filteredProducts = products.filter(product => {
    const name = getProductName(product).toLowerCase();
    const desc = getProductDesc(product).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
  });

  const handleAddToCart = (product) => {
    const productWithName = {
      ...product,
      name: getProductName(product)
    };
    addToCart(productWithName);
    toast.success(`${getProductName(product)} ${t('addToCart').toLowerCase()}`);
    
    // Track analytics
    axios.post(`${API}/analytics/track`, {
      product_id: product.id,
      event_type: 'add_to_cart'
    }).catch(err => console.error('Analytics tracking failed:', err));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Search Bar */}
      <div className="sticky top-0 bg-background z-10 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            data-testid="search-input"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-full bg-white border-muted focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <Button
            data-testid="category-all"
            variant={!selectedCategory ? 'default' : 'outline'}
            onClick={() => handleCategoryChange('')}
            className="rounded-full whitespace-nowrap h-10 px-4"
          >
            {t('allCategories')}
          </Button>
          {categories.map((category) => {
            const translatedCategory = getCategoryName(category);
            return (
              <Button
                key={category.id}
                data-testid={`category-filter-${category.name_pt.toLowerCase().replace(/\s+/g, '-')}`}
                variant={selectedCategory === category.name_pt ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(category.name_pt)}
                className="rounded-full whitespace-nowrap h-10 px-4 min-h-[40px] flex items-center"
              >
                <span>{translatedCategory}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t('noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`product-card-${product.id}`}
                className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {product.image_url && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[40px]">
                    {getProductName(product)}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {getProductDesc(product)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-lg">
                      {formatCurrency(product.price)}
                    </span>
                    <Button
                      data-testid={`add-to-cart-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-8 w-8 p-0 active:scale-95 transition-transform"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;