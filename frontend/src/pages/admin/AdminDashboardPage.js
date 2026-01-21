import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, LogOut } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboardPage = () => {
  const { t, language } = useLanguage();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products`, {
        params: { active_only: false },
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error(t('admin.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId, currentValue) => {
    try {
      await axios.put(
        `${API}/products/${productId}`,
        { active: !currentValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (error) {
      toast.error(t('admin.error'));
    }
  };

  const handleToggleFeatured = async (productId, currentValue) => {
    try {
      await axios.put(
        `${API}/products/${productId}`,
        { featured: !currentValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (error) {
      toast.error(t('admin.error'));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t('admin.productDeleted'));
      fetchProducts();
    } catch (error) {
      toast.error(t('admin.error'));
    }
  };

  const getProductName = (product) => {
    if (language === 'pt') return product.name_pt;
    if (language === 'es') return product.name_es;
    return product.name_en;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = getProductName(product).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-muted sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-nunito font-bold">{t('admin.dashboard')}</h1>
          <div className="flex items-center gap-2">
            <Button
              data-testid="admin-categories-button"
              onClick={() => navigate('/admin/categories')}
              variant="outline"
              className="h-10"
            >
              Manage Categories
            </Button>
            <Button
              data-testid="admin-logout-button"
              onClick={logout}
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 mr-2" />
              {t('admin.logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              data-testid="admin-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-lg"
            />
          </div>
          <Button
            data-testid="admin-add-product-button"
            onClick={() => navigate('/admin/products/new')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-lg font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('admin.addProduct')}
          </Button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-card rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Image</th>
                    <th className="text-left p-4 font-semibold text-sm">Name</th>
                    <th className="text-left p-4 font-semibold text-sm">Category</th>
                    <th className="text-left p-4 font-semibold text-sm">Type</th>
                    <th className="text-left p-4 font-semibold text-sm">Price</th>
                    <th className="text-left p-4 font-semibold text-sm">Active</th>
                    <th className="text-left p-4 font-semibold text-sm">Featured</th>
                    <th className="text-left p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-muted" data-testid={`admin-product-row-${product.id}`}>
                      <td className="p-4">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={getProductName(product)}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                      </td>
                      <td className="p-4 font-medium">{getProductName(product)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-sm">
                        <span className="px-2 py-1 rounded-full bg-muted text-xs">
                          {product.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-4">
                        <Switch
                          data-testid={`admin-toggle-active-${product.id}`}
                          checked={product.active}
                          onCheckedChange={() => handleToggleActive(product.id, product.active)}
                        />
                      </td>
                      <td className="p-4">
                        <Switch
                          data-testid={`admin-toggle-featured-${product.id}`}
                          checked={product.featured}
                          onCheckedChange={() => handleToggleFeatured(product.id, product.featured)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            data-testid={`admin-edit-${product.id}`}
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`admin-delete-${product.id}`}
                            onClick={() => handleDelete(product.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;