import { FooterVisibilityConfig } from '../types';

export const defaultFooterConfig: FooterVisibilityConfig = {
  excludedPaths: [
    "/login",
    "/register", 
    "/congrats",
    "/realms/dashboard",
  ],
};

export const shouldShowFooter = (
  pathname: string, 
  config: FooterVisibilityConfig = defaultFooterConfig
): boolean => {
  return !config.excludedPaths.some((path) => 
    pathname === path || pathname.startsWith(path)
  );
};
