export interface Promotion {
  id: number;
  name: string;
  description: string;
  discount: string;
  img?: string;
  status?: boolean;
  type?: string;
  amount?: number;
  btn_txt?: string;
  min_lvl?: number;
  max_lvl?: number;
  level?: number;
}

export interface CarouselItem {
  image: string;
  title: string;
  description: string;
  buttonText: string;
}

export interface PromotionsFilters {
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
}

export interface PromotionsPagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalElements: number;
}

export interface PromotionModel {
  id: number;
  reference: string;
  img: string;
  name: string;
  send_item: boolean;
  description: string;
  type: string;
  amount: number;
  btn_txt: string;
  min_lvl: number;
  max_lvl: number;
  realm_id: number;
  class_id: number;
  status: boolean;
  level: number;
  items: ItemPromotionModel[];
}

export interface ItemPromotionModel {
  code: string;
  quantity: number;
}

// DTO para crear promoción
export interface CreatePromotionDto {
  img_url: string; // @NotNull, @NotBlank
  name: string; // @Size(max = 30), @NotNull, @NotBlank
  description: string;
  btn_text: string;
  send_item: boolean;
  type: string;
  min_level: number;
  max_level: number;
  amount?: number;
  realm_id: number;
  class_character?: number;
  level?: number;
  status: boolean;
  language: string;
  items?: PromotionItemDto[];
}

export interface PromotionItemDto {
  code: string; // @Size(max = 30), @NotNull, @NotBlank
  quantity: number; // @NotNull, @Min(1)
}
