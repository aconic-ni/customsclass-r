"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileCode2, History, Loader2, Sparkles, FileDown, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getHsCodePrediction, type ResultData } from "@/app/actions";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getHistory, clearHistoryForUser } from "@/services/firestore";

const formSchema = z.object({
  brand: z.string(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type FormData = z.infer<typeof formSchema>;
export type HistoryItem = FormData & { id: string; result: ResultData };

export function CustomsClassifier() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { brand: "", description: "" },
  });
  
  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const userHistory = await getHistory(user.uid);
      setHistory(userHistory);
    } catch (error) {
      console.error("Failed to load history from Firestore", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el historial.",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  useEffect(() => {
    fetchHistory();
  }, [user]);
  
  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para clasificar."});
      return;
    }

    setIsLoading(true);
    setResult(null);
    setActiveHistoryId(null);
    const response = await getHsCodePrediction({ ...data, userId: user.uid });
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
      await fetchHistory();
      // Find the newly created history item to set it as active. This is a simple approach.
      // A more robust way might involve getting the new item's ID from the server action.
      setTimeout(() => {
        if(history.length > 0) {
            setActiveHistoryId(history[0].id);
        }
      }, 500);

    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    form.reset({ brand: item.brand, description: item.description });
    setResult(item.result);
    setActiveHistoryId(item.id);
    setIsLoading(false);
  };
  
  const handleExport = () => {
    if (history.length === 0) {
      toast({ title: "Nada que exportar", description: "Tu historial está vacío." });
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(history, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `CustomsClass-R_history_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Historial Exportado", description: "Tu historial de interacciones ha sido descargado." });
  };

  const handleClearHistory = async () => {
    if(!user) return;
    await clearHistoryForUser(user.uid);
    setHistory([]);
    setResult(null);
    setActiveHistoryId(null);
    form.reset({ brand: "", description: "" });
    toast({ title: "Historial Limpiado" });
  };


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader>
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    <History className="size-5" />
                    <h2 className="text-lg font-semibold font-headline">Historial</h2>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleExport} aria-label="Exportar Historial" disabled={history.length === 0}>
                        <FileDown className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Limpiar Historial" disabled={history.length === 0}>
                            <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu historial de interacciones.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearHistory}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
            <SidebarMenu className="p-2">
                {isLoadingHistory && (
                  <div className="p-2 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                {!isLoadingHistory && history.length === 0 && (
                    <div className="text-center text-muted-foreground p-4 text-sm">Aún no hay interacciones.</div>
                )}
                {!isLoadingHistory && history.map((item) => (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                            onClick={() => handleHistorySelect(item)} 
                            isActive={item.id === activeHistoryId}
                            className="h-auto whitespace-normal py-2"
                        >
                            <div className="flex flex-col items-start gap-1 w-full">
                                <span className="font-semibold text-primary">{item.brand || 'Sin Marca'}</span>
                                <span className="text-xs text-muted-foreground truncate w-full">{item.description}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <header className="flex items-center gap-2">
                <FileCode2 className="size-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">CustomsClass-R</h1>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
              <div className="lg:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="size-5 text-accent" />Detalles del Producto</CardTitle>
                        <CardDescription>Ingresa la información de tu producto para predecir su código HS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="brand" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca (Opcional)</FormLabel>
                                        <FormControl><Input placeholder="ej. QuantumLeap" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción del Producto</FormLabel>
                                        <FormControl><Textarea placeholder="ej. Un cronómetro personal retro-futurista con carcasa de latón y pantalla de tubo Nixie." className="min-h-[150px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? "Clasificando..." : "Predecir Código HS"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-headline">Resultado de la Clasificación</CardTitle>
                        <CardDescription>El código HS predicho y la explicación aparecerán aquí.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-6">
                                <Skeleton className="h-12 w-1/2" />
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : result ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Código HS Predicho</p>
                                    <p className="text-4xl font-bold font-headline text-primary">{result.prediction.hsCode}</p>
                                </div>
                                <Accordion type="single" collapsible defaultValue="justification" className="w-full">
                                    <AccordionItem value="justification">
                                        <AccordionTrigger>Justificación</AccordionTrigger>
                                        <AccordionContent className="text-foreground/80 prose prose-invert max-w-none">{result.prediction.explanation}</AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="retro-explanation">
                                        <AccordionTrigger>Explicación Retro</AccordionTrigger>
                                        <AccordionContent className="text-foreground/80 prose prose-invert max-w-none">{result.explanation.explanation}</AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <FileCode2 className="size-16 mb-4" />
                                <p className="font-semibold">Tus resultados están pendientes</p>
                                <p className="text-sm">Completa el formulario para comenzar.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
              </div>
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
