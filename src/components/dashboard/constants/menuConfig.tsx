"use client";

import type { IconType } from "react-icons";
import {
  FaTrophy,
  FaGamepad,
  FaCrown,
  FaTags,
  FaBoxOpen,
  FaKey,
  FaCreditCard,
  FaLayerGroup,
  FaHandshake,
  FaQuestionCircle,
  FaBullhorn,
  FaVoteYea,
  FaWindowRestore,
  FaClipboardList,
  FaListAlt,
  FaUserFriends,
  FaWallet,
  FaChartPie,
  FaNewspaper,
  FaUsers,
  FaGlobe,
  FaShoppingBag,
  FaGem,
  FaUserShield,
  FaPuzzlePiece,
} from "react-icons/fa";

/** Mapeo de activeOption (URL) a título para el header */
export const DASHBOARD_OPTION_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  portals: "Portales",
  adversing: "Mi reino",
  premium: "Beneficios VIP",
  promotions: "Promociones",
  products: "Productos",
  productDeliveries: "Entregas de claves",
  news: "Noticias",
  users: "Usuarios",
  faqs: "Preguntas frecuentes",
  advertising: "Advertising",
  votes: "Votes",
  provider: "Proveedores",
  paymentMethods: "Medios de pago",
  interstitial: "Configurar Interstitial",
  subscriptions: "Suscripciones",
  plans: "Planes de suscripción",
  usersWeb: "Usuarios web",
  wallet: "Wallet usuarios",
  battlePass: "Pase de batalla",
  cardsCatalog: "Cartas coleccionables",
};

/** Descripción opcional por vista (se muestra bajo el título en DashboardPageWrapper) */
export const DASHBOARD_OPTION_DESCRIPTIONS: Partial<Record<string, string>> = {
  dashboard: "Métricas y estadísticas del servidor en tiempo real.",
  paymentMethods: "Configura y gestiona los métodos de pago del servidor.",
  products: "Gestiona productos y categorías de la tienda.",
  productDeliveries:
    "Historial de compras con clave externa: estado de entrega, destinatario y claves asignadas.",
  news: "Crea y edita noticias del servidor.",
  users: "Administra usuarios y permisos.",
  faqs: "Preguntas frecuentes y respuestas.",
  advertising: "Banners y publicidad del sitio.",
  votes: "Configuración de votaciones.",
  provider: "Proveedores de pago y servicios.",
  interstitial: "Imagen y redirección del popup intersticial mostrado a los usuarios.",
  subscriptions: "Suscriptores premium, ingresos por transacción y asignación de planes.",
  plans: "Crear y editar planes de suscripción: nombre, precio, frecuencia y estado.",
  usersWeb: "Usuarios registrados, envío masivo de email en texto plano y cuentas de juego por reino.",
  wallet: "Consulta y modifica puntos de donación, votación y máquina por usuario.",
  portals: "Portales de teletransporte del reino.",
  battlePass: "Temporadas y premios del pase de batalla por nivel (1-80). Reinicio por fechas.",
  cardsCatalog: "Catálogo de cartas coleccionables: crear, editar y activar o desactivar cartas para los sobres.",
  adversing: "Publicidad y configuración del reino.",
  premium: "Beneficios VIP y suscripciones.",
  promotions: "Promociones y ofertas.",
};

export interface DashboardMenuItem {
  id: string;
  label: string;
  /** Icono único del item, importado de `react-icons/fa`. */
  icon: IconType;
}

export interface DashboardCategory {
  id: string;
  label: string;
  section: "reino" | "servidor";
  icon: IconType;
  items: DashboardMenuItem[];
}

/**
 * Icono outline local para "Portales". `react-icons/fa` no expone un icono
 * de portal estable, así que se mantiene un SVG con el mismo tamaño/peso
 * visual que el resto de `Fa*` (24x24, `currentColor`).
 */
const PortalIcon: IconType = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);

/**
 * Sidebar agrupado en sub-categorías dentro de las dos secciones globales
 * "Configuraciones del reino" y "Servidor". El orden de las categorías y
 * los items dentro de cada una controla el render en el sidebar.
 */
export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  // ── Configuraciones del reino ──────────────────────────────────────────
  {
    id: "mundo",
    label: "Mundo",
    section: "reino",
    icon: FaGlobe,
    items: [
      { id: "portals", label: "Portales", icon: PortalIcon },
      { id: "battlePass", label: "Pase de batalla", icon: FaTrophy },
      { id: "adversing", label: "Mi reino", icon: FaGamepad },
    ],
  },
  {
    id: "tienda",
    label: "Tienda",
    section: "reino",
    icon: FaShoppingBag,
    items: [
      { id: "products", label: "Productos", icon: FaBoxOpen },
      { id: "productDeliveries", label: "Entregas de claves", icon: FaKey },
      { id: "promotions", label: "Promociones", icon: FaTags },
    ],
  },
  {
    id: "vip",
    label: "VIP",
    section: "reino",
    icon: FaGem,
    items: [{ id: "premium", label: "Beneficios VIP", icon: FaCrown }],
  },

  // ── Servidor ──────────────────────────────────────────────────────────
  {
    id: "pagos",
    label: "Pagos",
    section: "servidor",
    icon: FaCreditCard,
    items: [
      { id: "paymentMethods", label: "Medios de pago", icon: FaCreditCard },
      { id: "provider", label: "Proveedores", icon: FaHandshake },
      { id: "plans", label: "Planes de suscripción", icon: FaListAlt },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad",
    section: "servidor",
    icon: FaUserShield,
    items: [
      { id: "users", label: "Usuarios", icon: FaUsers },
      { id: "usersWeb", label: "Usuarios web", icon: FaUserFriends },
      { id: "wallet", label: "Wallet usuarios", icon: FaWallet },
      { id: "subscriptions", label: "Suscripciones", icon: FaClipboardList },
      { id: "dashboard", label: "Dashboard", icon: FaChartPie },
    ],
  },
  {
    id: "contenido",
    label: "Contenido",
    section: "servidor",
    icon: FaPuzzlePiece,
    items: [
      { id: "cardsCatalog", label: "Cartas coleccionables", icon: FaLayerGroup },
      { id: "faqs", label: "Faqs", icon: FaQuestionCircle },
      { id: "advertising", label: "Advertising", icon: FaBullhorn },
      { id: "interstitial", label: "Configurar Interstitial", icon: FaWindowRestore },
      { id: "votes", label: "Votes", icon: FaVoteYea },
      { id: "news", label: "Noticias", icon: FaNewspaper },
    ],
  },
];
