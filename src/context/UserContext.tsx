"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import i18n from "@/i18n";

export interface UserModel {
  id: number | null;
  username: string;
  country: string;
  language: string;
  date_of_birth: Date | null;
  first_name: string;
  last_name: string;
  cell_phone: string | null;
  email: string;
  logged_in: boolean;
  avatar: string;
  server: string | null;
  expansion: string | null;
  pending_validation: boolean;
  is_admin: boolean;
}

const initialUserData: UserModel = {
  id: null,
  username: "",
  country: "",
  language: "en",
  date_of_birth: null,
  first_name: "",
  last_name: "",
  cell_phone: "",
  email: "",
  logged_in: false,
  avatar: "",
  server: null,
  expansion: null,
  pending_validation: false,
  is_admin: false,
};

interface UserContextProps {
  user: UserModel;
  setUser: React.Dispatch<React.SetStateAction<UserModel>>;
  clearUserData: () => void;
}

export const UserContext = createContext<UserContextProps>({
  user: initialUserData,
  setUser: () => {},
  clearUserData: () => {},
});

interface UserProviderProps {
  children: React.ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
  let initialUser = initialUserData;

  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    initialUser = storedUser ? JSON.parse(storedUser) : initialUserData;
  }

  const [user, setUser] = useState<UserModel>(initialUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      i18n.changeLanguage(user.language);
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const clearUserData = () => {
    localStorage.removeItem("user");
    setUser(initialUserData);
    Cookies.remove("token");
    Cookies.remove("refresh_token");
  };

  const updateLanguage = (lang: string) => {
    setUser((prevUser) => ({ ...prevUser, language: lang }));
    localStorage.setItem("user", JSON.stringify({ ...user, language: lang }));
    i18n.changeLanguage(lang);
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUserContext = (): UserContextProps => {
  return useContext(UserContext);
};
