import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  Flame
} from 'lucide-react';

interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function LoginForm({ onLogin, onForgotPassword, loading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    await onLogin({ email: email.trim(), password, rememberMe });
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) return;
    
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(false);
    
    try {
      await onForgotPassword(forgotPasswordEmail.trim());
      setForgotPasswordSuccess(true);
      setForgotPasswordEmail('');
    } catch (err) {
      setForgotPasswordError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-600 rounded-full">
              <Flame className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Sistema DUAR
            </h1>
            <p className="text-muted-foreground">
              Búsqueda y Rescate - Acceso Seguro
            </p>
          </div>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.email@organizacion.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Recordarme
                  </Label>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="px-0 text-red-600 hover:text-red-700">
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-red-600" />
                        Recuperar Contraseña
                      </DialogTitle>
                      <DialogDescription>
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {forgotPasswordSuccess ? (
                        <Alert className="border-green-200 bg-green-50 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Se ha enviado un enlace de recuperación a tu correo electrónico.
                            Revisa tu bandeja de entrada y spam.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          {forgotPasswordError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{forgotPasswordError}</AlertDescription>
                            </Alert>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Correo Electrónico</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="tu.email@organizacion.com"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              disabled={forgotPasswordLoading}
                            />
                          </div>
                          
                          <Button
                            onClick={handleForgotPassword}
                            disabled={!forgotPasswordEmail.trim() || forgotPasswordLoading}
                            className="w-full bg-red-600 hover:bg-red-700"
                          >
                            {forgotPasswordLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Enlace
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading || !email.trim() || !password.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Información adicional */}
            <div className="pt-4 border-t border-border">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">Dirección de Bomberos DUAR</p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span>🔒 Acceso Seguro</span>
                  <span>📱 Móvil Compatible</span>
                  <span>🌐 24/7 Disponible</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Dirección de Bomberos DUAR. Todos los derechos reservados.</p>
          <p className="mt-1">
            Para soporte técnico contacta a tu administrador de sistema
          </p>
        </div>
      </div>
    </div>
  );
}