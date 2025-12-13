import { Teleport } from "@/model/teleport";

export interface TeleportFormData extends Omit<Teleport, "id"> {}

export interface FormErrors {
  [key: string]: string;
}

export interface TeleportDashboardProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}

export interface FieldConstraint {
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  step?: number;
}

export interface FieldConstraints {
  [key: string]: FieldConstraint;
}
