export interface ProductsDetailsDto {
  products: Product[];
  total_products: number;
}

export interface Product {
  id: number;
  name: string;
  disclaimer: string;
  category: string;
  price: number;
  status: boolean;
  discount: number;
  discount_price: number;
  use_points: boolean;
  points_amount: number;
  category_id: number;
  category_name: string;
  description: string;
  img_url: string;
  partner: string;
  partner_id: number;
  reference_number: string;
  return_tax: string;
  language: string;
  tax: string;
}
