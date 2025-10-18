export interface NavbarProps {
  className?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag?: string;
}

export interface PromotionBanner {
  url: string;
  img: string;
  alt: string;
}

export interface NavbarState {
  languageDropdown: boolean;
  languages: string[];
  loading: boolean;
  loadingSub: boolean;
  isMobileMenuOpen: boolean;
  pillHome?: PromotionBanner;
}

export interface NavbarActions {
  toggleLanguageDropdown: () => void;
  changeLanguage: (language: string) => void;
  toggleMobileMenu: () => void;
  handleSearch: (query: string) => void;
}
