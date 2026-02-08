/** Mapeo de activeOption (URL) a título para el header */
export const DASHBOARD_OPTION_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  portals: "Portales",
  adversing: "Mi reino",
  premium: "Beneficios VIP",
  promotions: "Promociones",
  products: "Productos",
  settings: "Configuración",
  bank: "Bank",
  guilds: "Hermandades",
  news: "Noticias",
  users: "Usuarios",
  faqs: "Preguntas frecuentes",
  advertising: "Advertising",
  votes: "Votes",
  provider: "Proveedores",
  paymentMethods: "Medios de pago",
  interstitial: "Configurar Interstitial",
  subscriptions: "Suscripciones",
};

/** Descripción opcional por vista (se muestra bajo el título en DashboardPageWrapper) */
export const DASHBOARD_OPTION_DESCRIPTIONS: Partial<Record<string, string>> = {
  dashboard: "Métricas y estadísticas del servidor en tiempo real.",
  paymentMethods: "Configura y gestiona los métodos de pago del servidor.",
  products: "Gestiona productos y categorías de la tienda.",
  bank: "Préstamos y créditos del banco del servidor.",
  news: "Crea y edita noticias del servidor.",
  users: "Administra usuarios y permisos.",
  faqs: "Preguntas frecuentes y respuestas.",
  advertising: "Banners y publicidad del sitio.",
  votes: "Configuración de votaciones.",
  provider: "Proveedores de pago y servicios.",
  interstitial: "Imagen y redirección del popup intersticial mostrado a los usuarios.",
  subscriptions: "Listado de suscripciones activas e historial: usuarios, planes, fechas y pagos.",
  portals: "Portales de teletransporte del reino.",
  adversing: "Publicidad y configuración del reino.",
  premium: "Beneficios VIP y suscripciones.",
  promotions: "Promociones y ofertas.",
  settings: "Configuración general del reino.",
  guilds: "Hermandades del servidor.",
};

export interface DashboardMenuItem {
  id: string;
  label: string;
  section: "reino" | "servidor";
}

/** Orden y secciones del menú lateral */
export const DASHBOARD_MENU_ITEMS: DashboardMenuItem[] = [
  { id: "portals", label: "Portales", section: "reino" },
  { id: "adversing", label: "Mi reino", section: "reino" },
  { id: "premium", label: "Beneficios VIP", section: "reino" },
  { id: "promotions", label: "Promociones", section: "reino" },
  { id: "products", label: "Productos", section: "reino" },
  { id: "settings", label: "Configuración", section: "servidor" },
  { id: "paymentMethods", label: "Medios de pago", section: "servidor" },
  { id: "provider", label: "Proveedores", section: "servidor" },
  { id: "faqs", label: "Faqs", section: "servidor" },
  { id: "advertising", label: "Advertising", section: "servidor" },
  { id: "votes", label: "Votes", section: "servidor" },
  { id: "interstitial", label: "Configurar Interstitial", section: "servidor" },
  { id: "subscriptions", label: "Suscripciones", section: "servidor" },
  { id: "dashboard", label: "Dashboard", section: "servidor" },
  { id: "news", label: "Noticias", section: "servidor" },
  { id: "bank", label: "Bank", section: "servidor" },
  { id: "guilds", label: "Hermandades", section: "servidor" },
  { id: "users", label: "Usuarios", section: "servidor" },
];
