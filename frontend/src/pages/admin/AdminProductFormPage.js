import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProductFormPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name_pt: '',
    name_en: '',
    name_es: '',
    desc_pt: '',
    desc_en: '',
    desc_es: '',
    type: 'product',
    category: '',
    price: '',
    currency: 'BRL',
    image_url: '',
    active: true,
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
      if (response.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: response.data[0].name_pt }));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const getCategoryName = (category) => {
    if (language === 'pt') return category.name_pt;
    if (language === 'es') return category.name_es;
    return category.name_en;
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(response.data);
    } catch (error) {
      toast.error(t('admin.error'));
      navigate('/admin/dashboard');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await axios.post(`${API}/products/upload-image`, formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ ...formData, image_url: response.data.image_url });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (isEdit) {
        await axios.put(`${API}/products/${id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/products`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success(t('admin.productSaved'));
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(t('admin.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-muted sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            data-testid="admin-back-button"
            onClick={() => navigate('/admin/dashboard')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-nunito font-bold">
            {isEdit ? t('admin.editProduct') : t('admin.addProduct')}
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4"
      >
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-md p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('admin.image')}</Label>
            <div className="flex items-center gap-4">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Product"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  data-testid="admin-image-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('image-upload').click()}
                  variant="outline"
                  disabled={uploading}
                  className="h-10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : t('admin.uploadImage')}
                </Button>
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{t('admin.type')}</Label>
            <Select
              data-testid="admin-type-select"
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">{t('admin.product')}</SelectItem>
                <SelectItem value="service">{t('admin.service')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('admin.category')}</Label>
            <Select
              data-testid="admin-category-select"
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.namePt')}</Label>
              <Input
                data-testid="admin-name-pt-input"
                value={formData.name_pt}
                onChange={(e) => setFormData({ ...formData, name_pt: e.target.value })}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.nameEn')}</Label>
              <Input
                data-testid="admin-name-en-input"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.nameEs')}</Label>
              <Input
                data-testid="admin-name-es-input"
                value={formData.name_es}
                onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                className="h-12"
                required
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.descPt')}</Label>
              <Textarea
                data-testid="admin-desc-pt-input"
                value={formData.desc_pt}
                onChange={(e) => setFormData({ ...formData, desc_pt: e.target.value })}
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.descEn')}</Label>
              <Textarea
                data-testid="admin-desc-en-input"
                value={formData.desc_en}
                onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.descEs')}</Label>
              <Textarea
                data-testid="admin-desc-es-input"
                value={formData.desc_es}
                onChange={(e) => setFormData({ ...formData, desc_es: e.target.value })}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label>{t('admin.price')} (R$)</Label>
            <Input
              data-testid="admin-price-input"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="h-12"
              required
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                data-testid="admin-active-switch"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label>{t('admin.active')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                data-testid="admin-featured-switch"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label>{t('admin.featured')}</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              data-testid="admin-cancel-button"
              onClick={() => navigate('/admin/dashboard')}
              variant="outline"
              className="flex-1 h-12 rounded-lg"
            >
              {t('admin.cancel')}
            </Button>
            <Button
              type="submit"
              data-testid="admin-save-button"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-lg font-semibold"
            >
              {loading ? 'Saving...' : t('admin.save')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminProductFormPage;