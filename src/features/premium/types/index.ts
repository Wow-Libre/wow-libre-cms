export interface PremiumPackage {
  id: number;
  name: string;
  description: string;
  img?: string;
  type?: string;
  command?: string;
  sendItem?: boolean;
  reactivable?: boolean;
  btnText?: string;
  realmId?: number;
  language?: string;
}

export interface CarouselItem {
  image: string;
  title: string;
  description: string;
  buttonText: string;
}

export interface PremiumFilters {
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
}

export interface PremiumPagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalElements: number;
}

export interface BenefitsPremiumDto {
  id: number;
  img: string;
  name: string;
  description: string;
  command: string;
  sendItem: boolean;
  reactivable: boolean;
  btn_text: string;
  type: string;
  realm_id: number;
  language: string;
}

// DTO para item de benefit premium
export interface BenefitPremiumItemDto {
  code: string;
  quantity: number;
}

// DTO para crear benefit premium
export interface CreateBenefitPremiumDto {
  img: string; // @NotNull
  name: string; // @NotNull
  description: string; // @NotNull
  command: string; // @NotNull
  sendItem: boolean; // @NotNull
  reactivable: boolean; // @NotNull
  btn_text: string; // @NotNull
  type: string; // @NotNull
  realm_id: number; // @NotNull
  language: string; // @NotNull
  items?: BenefitPremiumItemDto[]; // Opcional, solo cuando type es ITEM
}

// DTO para actualizar benefit premium
export interface UpdateBenefitPremiumDto {
  id: number; // @NotNull
  img?: string;
  name?: string;
  description?: string;
  command?: string;
  sendItem?: boolean;
  reactivable?: boolean;
  btn_text?: string;
  type: string; // @NotNull
  realm_id: number; // @NotNull
  language: string; // @NotNull
}

