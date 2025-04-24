
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: 'emp1',
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    role: 'employee',
    position: 'Staff',
    hourlyRate: 150,
    department: 'Operations',
  },
  {
    id: 'emp2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    role: 'employee',
    position: 'Supervisor',
    hourlyRate: 300,
    department: 'Customer Service',
  },
  {
    id: 'emp3',
    name: 'Pedro Reyes',
    email: 'pedro@example.com',
    role: 'employee',
    position: 'Manager',
    hourlyRate: 500,
    department: 'Finance',
  }
];

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to authenticate
    // For demo purposes, we'll just check against our mock users
    
    // Simple validation
    if (!email || !password) {
      return false;
    }
    
    // Find user with matching email
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // In a real app, you'd compare hashed passwords here
      // For demo, we'll accept any non-empty password
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      isAuthenticated,
      allUsers: MOCK_USERS 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
