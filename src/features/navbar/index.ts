// Componentes principales
export { default as Navbar } from './components/Navbar';
export { default as NavbarAuth } from './components/NavbarAuth';
export { default as SearchBar } from './components/SearchBar';

// Hooks
export { useNavbar } from './hooks/useNavbar';

// Tipos
export type { 
  NavbarProps, 
  LanguageOption, 
  PromotionBanner, 
  NavbarState, 
  NavbarActions 
} from './types/navbar.types';

// Estilos (importación automática)
import './styles/navbar.css';