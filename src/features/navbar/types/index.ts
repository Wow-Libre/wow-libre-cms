export interface NavbarVisibilityConfig {
  pathsWithoutNavbar: string[];
}

export interface NavbarVisibilityProps {
  config?: Partial<NavbarVisibilityConfig>;
}
