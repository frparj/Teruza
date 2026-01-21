import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ArrowLeft, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCategoriesPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name_pt: '',
    name_en: '',
    name_es: '',
    image_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
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

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name_pt: category.name_pt,
        name_en: category.name_en,
        name_es: category.name_es,
        image_url: category.image_url || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name_pt: '',
        name_en: '',
        name_es: '',
        image_url: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_pt || !formData.name_en || !formData.name_es) {
      toast.error('Please fill all name fields');
      return;
    }

    try {
      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API}/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category created successfully');
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    try {
      await axios.delete(`${API}/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const getCategoryName = (category) => {
    if (language === 'pt') return category.name_pt;
    if (language === 'es') return category.name_es;
    return category.name_en;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-muted sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            data-testid="back-to-dashboard"
            onClick={() => navigate('/admin/dashboard')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-nunito font-bold">Category Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Add Category Button */}
        <div className="mb-6 flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-category-button"
                onClick={() => handleOpenDialog()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-lg font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Category Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Category"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="category-image-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('category-image-upload').click()}
                        variant="outline"
                        disabled={uploading}
                        className="h-10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name (Portuguese)</Label>
                    <Input
                      data-testid="category-name-pt"
                      value={formData.name_pt}
                      onChange={(e) => setFormData({ ...formData, name_pt: e.target.value })}
                      placeholder="Bebidas"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (English)</Label>
                    <Input
                      data-testid="category-name-en"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      placeholder="Drinks"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (Spanish)</Label>
                    <Input
                      data-testid="category-name-es"
                      value={formData.name_es}
                      onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                      placeholder="Bebidas"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1 h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="save-category-button"
                    onClick={handleSave}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`category-card-${category.id}`}
                className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {category.image_url && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={category.image_url}
                      alt={getCategoryName(category)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-nunito font-bold text-lg mb-2">
                      {getCategoryName(category)}
                    </h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>PT: {category.name_pt}</p>
                      <p>EN: {category.name_en}</p>
                      <p>ES: {category.name_es}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid={`edit-category-${category.id}`}
                      onClick={() => handleOpenDialog(category)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      data-testid={`delete-category-${category.id}`}
                      onClick={() => handleDelete(category.id, getCategoryName(category))}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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

export default AdminCategoriesPage;
