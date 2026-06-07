export type ProductDeliveryType = "IN_GAME" | "EXTERNAL_KEY";

export type ProductDetailRequestDto = {
  title: string;
  description: string;
  image_url: string;
};

export type ProductRequestDto = {
  name: string;
  product_category_id: number;
  disclaimer: string;
  price: number;
  discount: number;
  description: string;
  image_url: string;
  realm_id: number;
  realm_name: string;
  language: string;
  tax: string;
  return_tax: string;
  credit_points_value: number;
  credit_points_enabled: boolean;
  packages: string[];
  delivery_type?: ProductDeliveryType;
  redeem_instructions?: string;
  redeem_keys?: string[];
  details?: ProductDetailRequestDto[];
};
