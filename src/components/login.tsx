'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCode2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';

export function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google', error);
      // Aquí podrías mostrar una notificación de error al usuario
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
    return null; // O un loader mientras redirige
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
          <div className="grid gap-4 py-4">
            <Button onClick={handleGoogleSignIn} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 381.4 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.8 244 11.8c70.3 0 129.5 28.5 173.4 73.2l-67.4 64.9C325.8 122.4 289.1 99 244 99c-66.9 0-121.5 54.4-121.5 121.5s54.6 121.5 121.5 121.5c78.3 0 110.5-59.4 114.2-88.2H244v-75.5h236.4c2.5 13.9 3.6 28.4 3.6 42.9z"
                  ></path>
                </svg>
              )}
              Continuar con Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
