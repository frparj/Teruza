import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, ShoppingCart, DollarSign, Eye, Package } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminAnalyticsPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, productsRes] = await Promise.all([
        axios.get(`${API}/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/analytics/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSummary(summaryRes.data);
      setProductAnalytics(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error(t('admin.failedToLoadAnalytics'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm(t('admin.confirmResetAnalytics'))) {
      return;
    }

    try {
      const response = await axios.delete(`${API}/analytics/reset`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${t('admin.analyticsResetSuccess')} ${response.data.deleted_count} ${t('admin.entriesRemoved')}.`);
      fetchAnalytics();
    } catch (error) {
      console.error('Failed to reset analytics:', error);
      toast.error(t('admin.failedToResetAnalytics'));
    }
  };

  const getProductName = (product) => {
    if (language === 'pt') return product.name_pt;
    if (language === 'es') return product.name_es;
    return product.name_en;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">{t('admin.loadingAnalytics')}</div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-nunito font-bold">{t('admin.analyticsInsights')}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-md p-6 border-l-4 border-primary"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{t('admin.totalOrders')}</h3>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{summary?.total_orders || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.pending_orders || 0} {t('admin.pending').toLowerCase()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl shadow-md p-6 border-l-4 border-secondary"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{t('admin.totalRevenue')}</h3>
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary?.total_revenue || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin.fromCompletedOrders')} ({summary?.completed_orders || 0})
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{t('admin.recentOrders')}</h3>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{summary?.recent_orders || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('admin.last7Days')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl shadow-md p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{t('admin.topCategory')}</h3>
              <Package className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-xl font-bold truncate">
              {summary?.popular_categories?.[0]?.category || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.popular_categories?.[0]?.count || 0} {t('admin.ordersCount')}
            </p>
          </motion.div>
        </div>

        {/* Product Performance Table */}
        <div className="bg-card rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-muted flex items-center justify-between">
            <div>
              <h2 className="text-xl font-nunito font-bold">{t('admin.productPerformance')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('admin.trackPerformance')}
              </p>
            </div>
            <Button
              data-testid="reset-analytics-button"
              onClick={handleResetAnalytics}
              variant="destructive"
              className="h-10"
            >
              {t('admin.resetAnalytics')}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.product')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.category')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.price')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.views')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.addToCartLabel')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.orders')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.conversion')}</th>
                  <th className="text-left p-4 font-semibold text-sm">{t('admin.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {productAnalytics.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted-foreground">
                      {t('admin.noAnalyticsData')}
                    </td>
                  </tr>
                ) : (
                  productAnalytics.map((product, index) => (
                    <tr
                      key={product.product_id}
                      className="border-t border-muted hover:bg-muted/20"
                      data-testid={`analytics-row-${index}`}
                    >
                      <td className="p-4">
                        <div className="font-medium">{getProductName(product)}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {product.category}
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{product.views}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4 text-blue-500" />
                          <span>{product.add_to_cart}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          {product.orders}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span
                          className={`${
                            product.conversion_rate >= 5
                              ? 'text-green-600'
                              : product.conversion_rate >= 2
                              ? 'text-yellow-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {product.conversion_rate}%
                        </span>
                      </td>
                      <td className="p-4 font-bold text-secondary">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
