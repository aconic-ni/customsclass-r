
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileCode2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAuthAction = async (action: 'signIn' | 'signUp', data: LoginFormValues) => {
    setIsAuthLoading(true);
    try {
      if (action === 'signIn') {
        await signInWithEmail(data.email, data.password);
      } else {
        await signUpWithEmail(data.email, data.password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Ocurrió un error inesperado.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'El correo electrónico o la contraseña son incorrectos.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está registrado.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil.';
            break;
          default:
            errorMessage = 'Error al procesar tu solicitud.';
        }
      }
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: errorMessage,
      });
      console.error('Authentication error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: 'No se pudo iniciar sesión con Google.',
      });
      console.error('Error signing in with Google', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <FileCode2 className="size-16 text-primary" />
        <h1 className="text-5xl font-bold font-headline">CustomsClass-R</h1>
        <p className="max-w-md text-muted-foreground">
          Tu asistente inteligente para la clasificación arancelaria. Inicia sesión para comenzar.
        </p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Iniciar Sesión</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Acceder</DialogTitle>
            <DialogDescription>
              Elige tu método de autenticación preferido para continuar.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="google">
               <div className="grid gap-4 py-4">
                  <Button onClick={handleGoogleSignIn} disabled={isAuthLoading}>
                    {isAuthLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : (
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" >
                        <path fill="currentColor" d="M488 261.8C488 403.3 381.4 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.8 244 11.8c70.3 0 129.5 28.5 173.4 73.2l-67.4 64.9C325.8 122.4 289.1 99 244 99c-66.9 0-121.5 54.4-121.5 121.5s54.6 121.5 121.5 121.5c78.3 0 110.5-59.4 114.2-88.2H244v-75.5h236.4c2.5 13.9 3.6 28.4 3.6 42.9z" ></path>
                      </svg>
                    )}
                    Continuar con Google
                  </Button>
                </div>
            </TabsContent>
            <TabsContent value="email">
              <div className="py-4">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                       <Button type="button" onClick={form.handleSubmit((data) => handleAuthAction('signIn', data))} disabled={isAuthLoading} className="w-full">
                        {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Iniciar Sesión
                      </Button>
                      <Button type="button" onClick={form.handleSubmit((data) => handleAuthAction('signUp', data))} disabled={isAuthLoading} variant="secondary" className="w-full">
                        {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Registrarse
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </main>
  );
}
