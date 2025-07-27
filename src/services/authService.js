import { apiService } from './apiService';
import { localStorageService } from './localStorageService';

// Mock user database
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', 
    name: 'Admin User',
    role: 'admin',
    permissions: ['admin', 'user:read', 'user:write', 'user:delete', 'analytics:read', 'system:read'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    permissions: ['user:read', 'analytics:read'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=32&h=32&fit=crop&crop=face',
    lastLogin: null,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'manager@example.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager',
    permissions: ['user:read', 'user:write', 'analytics:read', 'reports:read'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    lastLogin: null,
    createdAt: '2024-01-03T00:00:00Z',
  },
];

const generateToken = (user) => {
  return btoa(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  }));
};

const validateToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) {
      throw new Error('Token expired');
    }
    
    const user = mockUsers.find(u => u.id === decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
      permissions: user.permissions,
      sessionExpiry: new Date(decoded.exp).toISOString(),
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const authService = {
  async login(credentials) {
    console.log('🏪 AuthService login called with:', credentials);
    
    // Simulate API delay
    console.log('⏳ Simulating API delay...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { email, password } = credentials;
    console.log('🔍 Looking for user with email:', email);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.error('❌ User not found or password mismatch');
      console.log('🗃️ Available users:', mockUsers.map(u => ({ email: u.email, password: u.password })));
      throw new Error('Invalid email or password');
    }

    console.log('👤 Found user:', { id: user.id, email: user.email, name: user.name, role: user.role });

    // Update last login
    user.lastLogin = new Date().toISOString();

    const token = generateToken(user);
    console.log('🎫 Generated token for user');
    
    const response = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
      permissions: user.permissions,
      sessionExpiry: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(),
    };
    
    console.log('📤 Returning login response:', response);
    return response;
  },

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  },

  async validateToken(token) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return validateToken(token);
  },

  async refreshSession() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = localStorageService.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const userData = validateToken(token);
    const newExpiry = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
    
    return {
      sessionExpiry: newExpiry,
    };
  },

  async changePassword(currentPassword, newPassword) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const token = localStorageService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const userData = validateToken(token);
    const user = mockUsers.find(u => u.id === userData.user.id);
    
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    
    return { success: true };
  },

  async updateProfile(profileData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const token = localStorageService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const userData = validateToken(token);
    const user = mockUsers.find(u => u.id === userData.user.id);
    
    // Update user data
    Object.assign(user, profileData);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    };
  },

  async resetPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Email not found');
    }

    return { success: true, message: 'Password reset email sent' };
  },
}; 