// Components
export { default as PromotionsDashboard } from "./components/PromotionsDashboard";
export { default as CreatePromotionModal } from "./components/CreatePromotionModal";

// Hooks
export { usePromotions } from "./hooks/usePromotions";

// API
export {
  getPromotionsAll,
  deletePromotion,
  createPromotion,
} from "./api/promosApi";

// Types
export type {
  Promotion,
  CarouselItem,
  PromotionsFilters,
  PromotionsPagination,
  PromotionsModel,
  ItemPromotionModel,
  CreatePromotionDto,
  PromotionItemDto,
} from "./types";
