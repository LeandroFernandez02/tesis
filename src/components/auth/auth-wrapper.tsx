import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { LoginForm } from './login-form';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  permissions: string[];
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // MODO DESARROLLO - Cambiar a false para requerir autenticación
  const DEVELOPMENT_MODE = true;

  // Simular datos de usuario para desarrollo
  const mockUsers = [
    {
      id: 'user-1',
      email: 'comandante@duar.org',
      password: 'DUAR123456',
      name: 'Carlos Méndez',
      role: 'Comandante',
      organization: 'Dirección de Bomberos DUAR',
      permissions: ['all']
    },
    {
      id: 'user-2',
      email: 'coordinador@duar.org',
      password: 'DUAR123456',
      name: 'Ana García',
      role: 'Coordinador',
      organization: 'Dirección de Bomberos DUAR',
      permissions: ['incidents', 'personnel', 'maps']
    },
    {
      id: 'user-3',
      email: 'operador@duar.org',
      password: 'DUAR123456',
      name: 'Miguel Torres',
      role: 'Operador',
      organization: 'Dirección de Bomberos DUAR',
      permissions: ['incidents', 'maps']
    }
  ];

  useEffect(() => {
    // Verificar sesión guardada
    const checkSession = async () => {
      try {
        // Si está en modo desarrollo, crear usuario automáticamente
        if (DEVELOPMENT_MODE) {
          const devUser: User = {
            id: 'dev-user',
            email: 'desarrollo@duar.org',
            name: 'Usuario Desarrollo',
            role: 'Comandante',
            organization: 'Dirección de Bomberos DUAR',
            permissions: ['all'],
            lastLogin: new Date()
          };
          setUser(devUser);
          setIsLoading(false);
          return;
        }
        
        const savedSession = localStorage.getItem('duar_session');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          const sessionExpiry = new Date(sessionData.expiry);
          
          if (sessionExpiry > new Date()) {
            // Sesión válida, simular carga de usuario
            const userData = mockUsers.find(u => u.id === sessionData.userId);
            if (userData) {
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                organization: userData.organization,
                permissions: userData.permissions,
                lastLogin: new Date(sessionData.loginTime)
              });
            }
          } else {
            // Sesión expirada
            localStorage.removeItem('duar_session');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('duar_session');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Detectar cambios de conectividad
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = mockUsers.find(
        u => u.email.toLowerCase() === credentials.email.toLowerCase() && 
             u.password === credentials.password
      );
      
      if (!userData) {
        throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
      }
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organization: userData.organization,
        permissions: userData.permissions,
        lastLogin: new Date()
      };
      
      setUser(user);
      
      // Guardar sesión si "recordarme" está activado
      if (credentials.rememberMe) {
        const sessionData = {
          userId: user.id,
          loginTime: new Date().toISOString(),
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
        };
        localStorage.setItem('duar_session', JSON.stringify(sessionData));
      }
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Simular delay de logout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('duar_session');
      
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    // Simular envío de email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userExists = mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userExists) {
      throw new Error('No existe una cuenta con este correo electrónico.');
    }
    
    // En un sistema real, aquí se enviaría el email
    console.log(`Password reset email sent to: ${email}`);
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    forgotPassword
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <div>
            <p className="text-lg font-medium">Sistema DUAR</p>
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {/* Indicador de conectividad */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Sin conexión a internet. Funcionando en modo offline.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {!user ? (
        <LoginFormWrapper />
      ) : (
        <div className={!isOnline ? 'pt-12' : ''}>
          {children}
        </div>
      )}
    </AuthContext.Provider>
  );
}

function LoginFormWrapper() {
  const { login, forgotPassword, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    setError(null);
    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await forgotPassword(email);
    } catch (err) {
      throw err;
    }
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      loading={isLoading}
      error={error}
    />
  );
}

// Hook para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes('all') || user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role,
    userOrganization: user?.organization
  };
};