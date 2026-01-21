import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrdersPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
    // Set up polling for new orders
    const interval = setInterval(fetchOrders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(false); // Don't show loading on refresh
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await axios.get(`${API}/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('admin.orderStatusUpdated'));
      fetchOrders();
    } catch (error) {
      toast.error(t('admin.failedToUpdateStatus'));
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm(t('admin.confirmDeleteOrder'))) {
      return;
    }

    try {
      const response = await axios.delete(`${API}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const analyticsDeleted = response.data.analytics_deleted || 0;
      toast.success(`${t('admin.orderDeleted')} ${analyticsDeleted} ${t('admin.analyticsEntriesRemoved')}.`);
      fetchOrders();
    } catch (error) {
      toast.error(t('admin.failedToDeleteOrder'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return t('admin.pending');
      case 'confirmed':
        return t('admin.confirmed');
      case 'completed':
        return t('admin.completed');
      case 'cancelled':
        return t('admin.cancelled');
      default:
        return status;
    }
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
          <h1 className="text-2xl font-nunito font-bold">{t('admin.orderManagement')}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-semibold">{t('admin.filterByStatus')}</span>
          <Select value={filterStatus || "all"} onValueChange={(val) => setFilterStatus(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('admin.allOrders')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allOrders')}</SelectItem>
              <SelectItem value="pending">{t('admin.pending')}</SelectItem>
              <SelectItem value="confirmed">{t('admin.confirmed')}</SelectItem>
              <SelectItem value="completed">{t('admin.completed')}</SelectItem>
              <SelectItem value="cancelled">{t('admin.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">{t('admin.loadingOrders')}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">
              {t('admin.noOrdersFound')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('admin.ordersAppearHere')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`order-card-${order.id}`}
                className="bg-card rounded-xl shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-nunito font-bold text-lg">
                        {t('admin.order')} #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.guestName')}</p>
                    <p className="font-semibold">{order.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.roomNumber')}</p>
                    <p className="font-semibold">{order.room_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.phone')}</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.deliveryPreference')}</p>
                    <p className="font-semibold">{order.delivery_preference}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('admin.notes')}</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}

                <div className="border-t border-muted pt-4 mb-4">
                  <p className="text-sm font-semibold mb-2">{t('admin.items')}</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-muted pt-4">
                  <div className="text-lg font-bold">
                    {t('admin.total')} <span className="text-primary">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <Button
                        data-testid={`confirm-order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {t('admin.confirm')}
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        data-testid={`complete-order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {t('admin.complete')}
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <Button
                        data-testid={`cancel-order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        size="sm"
                        variant="destructive"
                      >
                        {t('admin.cancel')}
                      </Button>
                    )}
                    <Button
                      data-testid={`delete-order-${order.id}`}
                      onClick={() => deleteOrder(order.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      {t('admin.delete')}
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

export default AdminOrdersPage;
