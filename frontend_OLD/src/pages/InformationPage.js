import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Clock, Truck, CreditCard, Info } from 'lucide-react';

const InformationPage = () => {
  const { t } = useLanguage();

  const infoSections = [
    {
      icon: Clock,
      title: t('openingHours'),
      content: t('hours'),
      testId: 'info-hours'
    },
    {
      icon: Truck,
      title: t('deliveryTime'),
      content: t('deliveryTimeValue'),
      testId: 'info-delivery-time'
    },
    {
      icon: Info,
      title: t('deliveryRules'),
      content: t('deliveryRulesText'),
      testId: 'info-delivery-rules'
    },
    {
      icon: CreditCard,
      title: t('paymentInfo'),
      content: t('paymentInfoText'),
      testId: 'info-payment'
    },
  ];

  return (
    <div className="pb-20 min-h-screen">
      <div className="p-4">
        <h1 className="text-3xl font-nunito font-bold mb-6 text-foreground">
          {t('information')}
        </h1>

        <div className="space-y-4">
          {infoSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={section.testId}
                className="bg-card rounded-xl shadow-md p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-nunito font-bold text-lg mb-2">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InformationPage;