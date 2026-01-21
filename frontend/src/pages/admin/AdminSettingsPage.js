import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSettingsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/settings`);
      setWhatsappNumber(response.data.whatsapp_number);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!whatsappNumber) {
      toast.error('WhatsApp number is required');
      return;
    }

    // Validate format (numbers only)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      toast.error('Please enter a valid WhatsApp number');
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        `${API}/settings`,
        { whatsapp_number: cleanNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Settings saved successfully');
      setWhatsappNumber(cleanNumber);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading settings...</div>
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
          <h1 className="text-2xl font-nunito font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 rounded-full p-3">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-nunito font-bold">WhatsApp Integration</h2>
              <p className="text-sm text-muted-foreground">
                Configure the WhatsApp number for receiving orders
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-semibold">
                WhatsApp Number
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter the number with country code (e.g., 5521988760870 for Brazil)
              </p>
              <Input
                id="whatsapp"
                data-testid="whatsapp-number-input"
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="5521988760870"
                className="h-12 rounded-lg font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Current: +{whatsappNumber}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Guests will send their orders to this WhatsApp number</li>
                <li>• Make sure the number can receive messages from unknown contacts</li>
                <li>• Format: Country code + number (no spaces, dashes, or special characters)</li>
                <li>• Example: 5521988760870 (Brazil), 14155552671 (USA)</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                className="flex-1 h-12 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                data-testid="save-settings-button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-lg font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
