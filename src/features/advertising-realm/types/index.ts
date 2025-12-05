import { RealmAdvertisement } from "@/model/RealmAdvertising";

export interface AdvertisingRealmFormData {
  tag: string;
  sub_title: string;
  description: string;
  footer_disclaimer: string;
  img_url: string;
  cta_primary: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface AdvertisingRealmDashboardProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}

export interface AdvertisingRealmPreviewProps {
  formData: RealmAdvertisement;
  copied: boolean;
  onCopy: (text: string) => void;
  t: (key: string) => string;
}

export interface AdvertisingRealmFormProps {
  formData: RealmAdvertisement;
  errors: FormErrors;
  language: "ES" | "EN" | "PT";
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}
