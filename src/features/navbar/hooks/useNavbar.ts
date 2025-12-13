"use client";

import { useState, useEffect } from "react";
import { useUserContext } from "@/context/UserContext";
import { getAvailableCountries } from "@/api/country";
import { widgetPillSubscription } from "@/api/home";
import { WidgetPillHome } from "@/model/model";
import Cookies from "js-cookie";
import { NavbarState, NavbarActions } from "../types/navbar.types";

export const useNavbar = (): NavbarState & NavbarActions => {
  const { user, setUser } = useUserContext();
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSub, setLoadingSub] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pillHome, setPillHome] = useState<WidgetPillHome>();

  const jwt = Cookies.get("token");

  useEffect(() => {
    const fetchAvailableCountries = async () => {
      setLoading(true);
      try {
        const apiResponse = await getAvailableCountries();
        const uniqueLanguages = Array.from(
          new Set(apiResponse.map((country) => country.language))
        );
        setLanguages(uniqueLanguages);
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCountries();
  }, []);

  useEffect(() => {
    const fetchWidgetPillSubscription = async () => {
      setLoadingSub(true);
      try {
        const widgetResponse = await widgetPillSubscription(
          user.language,
          jwt || null
        );
        setPillHome(widgetResponse);
      } catch (error) {
        setLoadingSub(true);
      } finally {
        setLoadingSub(false);
      }
    };

    if (user && jwt) {
      fetchWidgetPillSubscription();
    }
  }, [user]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdown(!languageDropdown);
  };

  const changeLanguage = (language: string) => {
    if (user) {
      setUser({
        ...user,
        language: language,
      });
    }
    setLanguageDropdown(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return {
    languageDropdown,
    languages,
    loading,
    loadingSub,
    isMobileMenuOpen,
    pillHome,
    handleSearch,
    toggleLanguageDropdown,
    changeLanguage,
    toggleMobileMenu,
  };
};
