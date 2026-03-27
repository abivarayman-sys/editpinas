import { create } from 'zustand';

export interface Reseller {
  id: string;
  brandName: string;
  subdomain: string;
  creditsBalance: number;
  maintenanceMode: boolean;
  gcashNumber?: string;
  priceSingle?: number;
  creditsSingle?: number;
  currentOverlayUrl?: string;
  ownerUid: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  credits: number;
  status: 'verified' | 'banned';
  totalCreditPurchased: number;
  photosGenerated: number;
}

interface TenantState {
  currentTenant: Reseller | null;
  currentUserData: AppUser | null;
  setCurrentTenant: (tenant: Reseller | null) => void;
  setCurrentUserData: (user: AppUser | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: null,
  currentUserData: null,
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  setCurrentUserData: (user) => set({ currentUserData: user }),
}));
