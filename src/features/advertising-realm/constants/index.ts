import { RealmAdvertisement } from "@/model/RealmAdvertising";

export const emptyRealmAdvertisement: RealmAdvertisement = {
  id: 0,
  title: "",
  tag: "",
  sub_title: "",
  description: "",
  cta_primary: "",
  img_url: "",
  footer_disclaimer: "",
  redirect: "",
  realmlist: "",
  copy_success: false,
};

export const FIELD_CONSTRAINTS = {
  tag: {
    minLength: 5,
    maxLength: 10,
  },
  sub_title: {
    minLength: 1,
    maxLength: 40,
  },
  description: {
    minLength: 5,
    maxLength: 40,
  },
  footer_disclaimer: {
    minLength: 5,
    maxLength: 40,
  },
  cta_primary: {
    minLength: 5,
    maxLength: 20,
  },
  img_url: {
    maxLength: 2048,
  },
} as const;
