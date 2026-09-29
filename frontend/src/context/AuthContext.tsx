'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  roleName: 'Owner' | 'BillingExecutive' | 'WarehouseOperator' | 'AccountsExecutive' | string;
  email: string;
  permissions: string[];
}

export interface DemoPersona {
  username: string;
  roleName: string;
  fullName: string;
  description: string;
  avatarInitials: string;
}

interface AuthContextType {
  user: UserProfile;
  token: string | null;
  isAuthenticated: boolean;
  personas: DemoPersona[];
  login: (username: string, password?: string) => Promise<boolean>;
  switchPersona: (username: string) => Promise<void>;
  logout: () => void;
  hasPermission: (moduleKey: string) => boolean;
}

const DEFAULT_PERSONAS: DemoPersona[] = [
  {
    username: 'admin',
    roleName: 'Owner',
    fullName: 'Selva Kumaran',
    description: 'Managing Director & Stockist Owner (Full P&L and All Modules)',
    avatarInitials: 'SK',
  },
  {
    username: 'billing',
    roleName: 'BillingExecutive',
    fullName: 'Suresh Babu',
    description: 'Senior Counter Billing Operator (Rapid Invoicing & Retailer CRM)',
    avatarInitials: 'SB',
  },
  {
    username: 'warehouse',
    roleName: 'WarehouseOperator',
    fullName: 'Karthik Raja',
    description: 'Warehouse & Inward Put-Away Lead (FEFO Batches & Cold Chain)',
    avatarInitials: 'KR',
  },
  {
    username: 'accounts',
    roleName: 'AccountsExecutive',
    fullName: 'Meena Sundaram',
    description: 'Finance & GST Controller (Dual GST, Ledgers & Scheme Claims)',
    avatarInitials: 'MS',
  },
];

const DEFAULT_USER: UserProfile = {
  userId: '00000000-0000-0000-0000-000000000001',
  username: 'admin',
  fullName: 'Selva Kumaran',
  roleName: 'Owner',
  email: 'admin@pharmagrid.com',
  permissions: ['dashboard', 'billing', 'orders', 'procurement', 'logistics', 'products', 'stockmaster', 'inventory', 'demandforecast', 'customers', 'schemes', 'audit', 'payroll', 'users', 'masters'],
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  token: null,
  isAuthenticated: false,
  personas: DEFAULT_PERSONAS,
  login: async () => true,
  switchPersona: async () => {},
  logout: () => {},
  hasPermission: () => true,
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5050';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [personas, setPersonas] = useState<DemoPersona[]>(DEFAULT_PERSONAS);

  // Load active session from localStorage or initialize with admin
  useEffect(() => {
    const savedToken = localStorage.getItem('pharmagrid_token');
    const savedUser = localStorage.getItem('pharmagrid_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.warn('Failed to parse saved auth profile:', err);
      }
    }

    // Fetch live personas from Web API
    fetch(`${API_BASE}/api/v1/auth/personas`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setPersonas(data);
        }
      })
      .catch(err => console.warn('Personas fetch notice:', err));
  }, []);

  const login = async (username: string, password: string = 'password123'): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('pharmagrid_token', data.token);
        localStorage.setItem('pharmagrid_user', JSON.stringify(data.user));
        return true;
      }
    } catch (err) {
      console.warn('Login request error, trying fallback:', err);
    }

    // Fallback local login for personas
    const cleanUser = username.trim().toLowerCase().split('@')[0];
    const found = personas.find(p => p.username.toLowerCase() === cleanUser);
    if (found) {
      await switchPersona(found.username);
      setIsAuthenticated(true);
      return true;
    }

    // Generic fallback login
    const fallbackUser: UserProfile = {
      userId: '00000000-0000-0000-0000-000000000001',
      username: cleanUser,
      fullName: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1) + ' (Staff)',
      roleName: 'BillingExecutive',
      email: `${cleanUser}@pharmagrid.com`,
      permissions: ['billing', 'customers', 'products', 'schemes'],
    };
    setUser(fallbackUser);
    setIsAuthenticated(true);
    localStorage.setItem('pharmagrid_user', JSON.stringify(fallbackUser));
    return true;
  };

  const switchPersona = async (username: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'password123' }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('pharmagrid_token', data.token);
        localStorage.setItem('pharmagrid_user', JSON.stringify(data.user));
        return;
      }
    } catch (err) {
      console.warn('Switch persona error, falling back locally:', err);
    }

    // Fallback local switch
    const found = personas.find(p => p.username === username);
    if (found) {
      const fallbackUser: UserProfile = {
        userId: '00000000-0000-0000-0000-000000000001',
        username: found.username,
        fullName: found.fullName,
        roleName: found.roleName,
        email: `${found.username}@pharmagrid.com`,
        permissions: found.roleName === 'Owner'
          ? ['dashboard', 'billing', 'orders', 'procurement', 'logistics', 'products', 'stockmaster', 'inventory', 'demandforecast', 'customers', 'schemes', 'audit', 'payroll', 'users', 'masters']
          : found.roleName === 'BillingExecutive'
          ? ['billing', 'orders', 'customers', 'schemes', 'products']
          : found.roleName === 'WarehouseOperator'
          ? ['inventory', 'stockmaster', 'procurement', 'logistics', 'products', 'masters']
          : ['dashboard', 'payroll', 'customers', 'schemes', 'audit', 'masters'],
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      localStorage.setItem('pharmagrid_user', JSON.stringify(fallbackUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('pharmagrid_token');
    localStorage.removeItem('pharmagrid_user');
    setUser(DEFAULT_USER);
    setToken(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (moduleKey: string) => {
    if (!user || !user.permissions) return true;
    return user.permissions.includes(moduleKey);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, personas, login, switchPersona, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

