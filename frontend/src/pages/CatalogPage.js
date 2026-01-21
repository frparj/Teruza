import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, X } from 'lucide-react';
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
  
  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

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

  // Handle adding to cart from card button (single item)
  const handleAddToCartFromCard = (e, product) => {
    e.stopPropagation(); // Prevent card click from opening modal
    const productWithName = {
      ...product,
      name: getProductName(product)
    };
    addToCart(productWithName);
    toast.success(`${getProductName(product)} ${t('addedToCart')}`);
    
    // Track analytics
    axios.post(`${API}/analytics/track`, {
      product_id: product.id,
      event_type: 'add_to_cart'
    }).catch(err => console.error('Analytics tracking failed:', err));
  };

  // Handle opening product detail modal
  const handleOpenProductDetail = (product) => {
    setSelectedProduct(product);
    setQuantity(product.type === 'service' ? 1 : 1);
    setIsDrawerOpen(true);
    
    // Track view analytics
    axios.post(`${API}/analytics/track`, {
      product_id: product.id,
      event_type: 'view'
    }).catch(err => console.error('Analytics tracking failed:', err));
  };

  // Handle adding to cart from modal (with quantity)
  const handleAddToCartFromModal = () => {
    if (!selectedProduct) return;
    
    const productWithName = {
      ...selectedProduct,
      name: getProductName(selectedProduct)
    };
    
    // Add the specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithName);
    }
    
    // Track analytics
    axios.post(`${API}/analytics/track`, {
      product_id: selectedProduct.id,
      event_type: 'add_to_cart'
    }).catch(err => console.error('Analytics tracking failed:', err));
    
    // Show success message
    const productName = getProductName(selectedProduct);
    if (quantity === 1) {
      toast.success(`${productName} ${t('addedToCart')}`);
    } else {
      toast.success(`${quantity} ${productName} ${t('itemsAddedToCart')}`);
    }
    
    // Close modal
    setIsDrawerOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
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
                className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenProductDetail(product)}
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
                      onClick={(e) => handleAddToCartFromCard(e, product)}
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

      {/* Product Detail Drawer (Bottom Sheet) */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          {selectedProduct && (
            <>
              {/* Close Button */}
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-4 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Product Image */}
                {selectedProduct.image_url && (
                  <div className="w-full aspect-video bg-muted overflow-hidden">
                    <img
                      src={selectedProduct.image_url}
                      alt={getProductName(selectedProduct)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-xl font-bold">
                    {getProductName(selectedProduct)}
                  </DrawerTitle>
                  <div className="text-2xl font-bold text-primary mt-2">
                    {formatCurrency(selectedProduct.price)}
                  </div>
                </DrawerHeader>

                {/* Full Description */}
                <div className="px-4 pb-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {getProductDesc(selectedProduct)}
                  </p>

                  {/* Service Note */}
                  {selectedProduct.type === 'service' && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {t('serviceNote')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with Quantity and Add Button */}
              <DrawerFooter className="border-t border-muted pt-4">
                {/* Quantity Selector (hidden for services) */}
                {selectedProduct.type !== 'service' && (
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('quantity')}:
                    </span>
                    <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="h-8 w-8 p-0 rounded-full hover:bg-background"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={incrementQuantity}
                        className="h-8 w-8 p-0 rounded-full hover:bg-background"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCartFromModal}
                  className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
                >
                  {t('addToCartFull')} - {formatCurrency(selectedProduct.price * quantity)}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CatalogPage;
