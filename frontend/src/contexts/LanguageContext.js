import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  pt: {
    appName: 'Teruza Hostel Mini Mercado',
    home: 'Início',
    search: 'Buscar',
    cart: 'Carrinho',
    information: 'Informações',
    headline: 'Peça do seu celular e receba no seu quarto',
    start: 'Começar',
    bestSellers: 'Mais Vendidos',
    categories: 'Categorias',
    category: {
      'Bebidas': 'Bebidas',
      'Snacks': 'Snacks',
      'Refeições Rápidas': 'Refeições<br>Rápidas',
      'Higiene': 'Higiene',
      'Emergências': 'Emergências',
      'Serviços': 'Serviços'
    },
    addToCart: 'Adicionar',
    removeFromCart: 'Remover',
    emptyCart: 'Seu carrinho está vazio',
    continueShopping: 'Continue comprando',
    subtotal: 'Subtotal',
    deliveryFee: 'Taxa de entrega',
    total: 'Total',
    checkout: 'Finalizar Pedido',
    guestName: 'Nome',
    roomNumber: 'Número do Quarto',
    phone: 'Telefone',
    countryCode: 'Código do País',
    deliveryPreference: 'Preferência de Entrega',
    atTheDoor: 'Na porta',
    handToMe: 'Em mãos',
    notes: 'Observações (opcional)',
    sendWhatsApp: 'Enviar pedido via WhatsApp',
    copyOrder: 'Copiar pedido',
    paymentNote: 'O pagamento será combinado na entrega ou no checkout.',
    orderReady: 'Seu pedido está pronto para ser enviado',
    confirmWhatsApp: 'Confirme no WhatsApp',
    openingHours: 'Horário de Funcionamento',
    hours: '11:00 - 22:00',
    deliveryTime: 'Tempo Estimado de Entrega',
    deliveryTimeValue: '30-60 minutos',
    deliveryRules: 'Regras de Entrega',
    deliveryRulesText: 'Entregas disponíveis apenas dentro do hostel. Por favor, forneça o número correto do quarto.',
    paymentInfo: 'Informações de Pagamento',
    paymentInfoText: 'O pagamento pode ser feito em dinheiro ou cartão no momento da entrega. Também aceitamos pagamento na recepção.',
    searchPlaceholder: 'Buscar produtos e serviços...',
    allCategories: 'Todas as Categorias',
    noProducts: 'Nenhum produto encontrado',
    quantity: 'Quantidade',
    orderCopied: 'Pedido copiado para área de transferência',
    required: 'obrigatório',
    fillAllFields: 'Por favor, preencha todos os campos obrigatórios',
    ddi: {
      '+55': 'Brasil',
      '+54': 'Argentina',
      '+57': 'Colômbia',
      '+56': 'Chile',
      '+51': 'Peru',
      '+58': 'Venezuela',
      '+593': 'Equador',
      '+591': 'Bolívia',
      '+595': 'Paraguai',
      '+598': 'Uruguai',
      'OTHER': 'Outro'
    },
    admin: {
      login: 'Login Admin',
      email: 'Email',
      password: 'Senha',
      loginButton: 'Entrar',
      dashboard: 'Painel Admin',
      products: 'Produtos',
      addProduct: 'Adicionar Produto',
      editProduct: 'Editar Produto',
      active: 'Ativo',
      featured: 'Destaque',
      type: 'Tipo',
      product: 'Produto',
      service: 'Serviço',
      category: 'Categoria',
      price: 'Preço',
      image: 'Imagem',
      uploadImage: 'Upload Imagem',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      logout: 'Sair',
      namePt: 'Nome (PT)',
      nameEn: 'Nome (EN)',
      nameEs: 'Nome (ES)',
      descPt: 'Descrição (PT)',
      descEn: 'Descrição (EN)',
      descEs: 'Descrição (ES)',
      confirmDelete: 'Tem certeza que deseja excluir este item?',
      productSaved: 'Produto salvo com sucesso',
      productDeleted: 'Produto excluído com sucesso',
      error: 'Erro ao processar requisição'
    }
  },
  en: {
    appName: 'Teruza Hostel Mini Mercado',
    home: 'Home',
    search: 'Search',
    cart: 'Cart',
    information: 'Information',
    headline: 'Order from your phone and get it delivered to your room',
    start: 'Start',
    bestSellers: 'Best Sellers',
    categories: 'Categories',
    category: {
      'Bebidas': 'Drinks',
      'Snacks': 'Snacks',
      'Refeições Rápidas': 'Quick<br>Meals',
      'Higiene': 'Hygiene',
      'Emergências': 'Essentials',
      'Serviços': 'Services'
    },
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue shopping',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    total: 'Total',
    checkout: 'Checkout',
    guestName: 'Name',
    roomNumber: 'Room Number',
    phone: 'Phone',
    countryCode: 'Country Code',
    deliveryPreference: 'Delivery Preference',
    atTheDoor: 'At the door',
    handToMe: 'Hand to me',
    notes: 'Notes (optional)',
    sendWhatsApp: 'Send order via WhatsApp',
    copyOrder: 'Copy order',
    paymentNote: 'Payment will be arranged on delivery or at checkout.',
    orderReady: 'Your order is ready to be sent',
    confirmWhatsApp: 'Confirm on WhatsApp',
    openingHours: 'Opening Hours',
    hours: '11:00 AM - 10:00 PM',
    deliveryTime: 'Estimated Delivery Time',
    deliveryTimeValue: '30-60 minutes',
    deliveryRules: 'Delivery Rules',
    deliveryRulesText: 'Deliveries available only within the hostel. Please provide correct room number.',
    paymentInfo: 'Payment Information',
    paymentInfoText: 'Payment can be made in cash or card upon delivery. We also accept payment at reception.',
    searchPlaceholder: 'Search products and services...',
    allCategories: 'All Categories',
    noProducts: 'No products found',
    quantity: 'Quantity',
    orderCopied: 'Order copied to clipboard',
    required: 'required',
    fillAllFields: 'Please fill all required fields',
    ddi: {
      '+55': 'Brazil',
      '+54': 'Argentina',
      '+57': 'Colombia',
      '+56': 'Chile',
      '+51': 'Peru',
      '+58': 'Venezuela',
      '+593': 'Ecuador',
      '+591': 'Bolivia',
      '+595': 'Paraguay',
      '+598': 'Uruguay',
      'OTHER': 'Other'
    },
    admin: {
      login: 'Admin Login',
      email: 'Email',
      password: 'Password',
      loginButton: 'Login',
      dashboard: 'Admin Dashboard',
      products: 'Products',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      active: 'Active',
      featured: 'Featured',
      type: 'Type',
      product: 'Product',
      service: 'Service',
      category: 'Category',
      price: 'Price',
      image: 'Image',
      uploadImage: 'Upload Image',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      logout: 'Logout',
      namePt: 'Name (PT)',
      nameEn: 'Name (EN)',
      nameEs: 'Name (ES)',
      descPt: 'Description (PT)',
      descEn: 'Description (EN)',
      descEs: 'Description (ES)',
      confirmDelete: 'Are you sure you want to delete this item?',
      productSaved: 'Product saved successfully',
      productDeleted: 'Product deleted successfully',
      error: 'Error processing request'
    }
  },
  es: {
    appName: 'Teruza Hostel Mini Mercado',
    home: 'Inicio',
    search: 'Buscar',
    cart: 'Carrito',
    information: 'Información',
    headline: 'Pide desde tu teléfono y recíbelo en tu habitación',
    start: 'Comenzar',
    bestSellers: 'Más Vendidos',
    categories: 'Categorías',
    category: {
      'Bebidas': 'Bebidas',
      'Snacks': 'Snacks',
      'Refeições Rápidas': 'Comidas<br>Rápidas',
      'Higiene': 'Higiene',
      'Emergências': 'Esenciales',
      'Serviços': 'Servicios'
    },
    addToCart: 'Agregar',
    removeFromCart: 'Eliminar',
    emptyCart: 'Tu carrito está vacío',
    continueShopping: 'Continuar comprando',
    subtotal: 'Subtotal',
    deliveryFee: 'Tarifa de entrega',
    total: 'Total',
    checkout: 'Finalizar Pedido',
    guestName: 'Nombre',
    roomNumber: 'Número de Habitación',
    phone: 'Teléfono',
    countryCode: 'Código de País',
    deliveryPreference: 'Preferencia de Entrega',
    atTheDoor: 'En la puerta',
    handToMe: 'En mano',
    notes: 'Notas (opcional)',
    sendWhatsApp: 'Enviar pedido por WhatsApp',
    copyOrder: 'Copiar pedido',
    paymentNote: 'El pago se coordinará en la entrega o en el checkout.',
    orderReady: 'Tu pedido está listo para ser enviado',
    confirmWhatsApp: 'Confirmar en WhatsApp',
    openingHours: 'Horario de Apertura',
    hours: '11:00 - 22:00',
    deliveryTime: 'Tiempo Estimado de Entrega',
    deliveryTimeValue: '30-60 minutos',
    deliveryRules: 'Reglas de Entrega',
    deliveryRulesText: 'Entregas disponibles solo dentro del hostel. Por favor, proporcione el número de habitación correcto.',
    paymentInfo: 'Información de Pago',
    paymentInfoText: 'El pago se puede hacer en efectivo o tarjeta al momento de la entrega. También aceptamos pago en recepción.',
    searchPlaceholder: 'Buscar productos y servicios...',
    allCategories: 'Todas las Categorías',
    noProducts: 'No se encontraron productos',
    quantity: 'Cantidad',
    orderCopied: 'Pedido copiado al portapapeles',
    required: 'requerido',
    fillAllFields: 'Por favor, complete todos los campos requeridos',
    ddi: {
      '+55': 'Brasil',
      '+54': 'Argentina',
      '+57': 'Colombia',
      '+56': 'Chile',
      '+51': 'Perú',
      '+58': 'Venezuela',
      '+593': 'Ecuador',
      '+591': 'Bolivia',
      '+595': 'Paraguay',
      '+598': 'Uruguay',
      'OTHER': 'Otro'
    },
    admin: {
      login: 'Login Admin',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      loginButton: 'Iniciar Sesión',
      dashboard: 'Panel Admin',
      products: 'Productos',
      addProduct: 'Agregar Producto',
      editProduct: 'Editar Producto',
      active: 'Activo',
      featured: 'Destacado',
      type: 'Tipo',
      product: 'Producto',
      service: 'Servicio',
      category: 'Categoría',
      price: 'Precio',
      image: 'Imagen',
      uploadImage: 'Subir Imagen',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      logout: 'Salir',
      namePt: 'Nombre (PT)',
      nameEn: 'Nombre (EN)',
      nameEs: 'Nombre (ES)',
      descPt: 'Descripción (PT)',
      descEn: 'Descripción (EN)',
      descEs: 'Descripción (ES)',
      confirmDelete: '¿Está seguro de que desea eliminar este elemento?',
      productSaved: 'Producto guardado exitosamente',
      productDeleted: 'Producto eliminado exitosamente',
      error: 'Error al procesar la solicitud'
    }
  }
};

const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('teruza-language');
    return saved || detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('teruza-language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};