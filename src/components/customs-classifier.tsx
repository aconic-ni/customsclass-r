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

const formSchema = z.object({
  brand: z.string().min(1, 'Brand is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

type FormData = z.infer<typeof formSchema>;
type HistoryItem = FormData & { id: string; result: ResultData };

export function CustomsClassifier() {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { brand: "", description: "" },
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedHistory = localStorage.getItem("customsClassRHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem("customsClassRHistory", JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
    }
  }, [history, isMounted]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);
    setActiveHistoryId(null);
    const response = await getHsCodePrediction(data);
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
      const newHistoryItem: HistoryItem = { id: new Date().toISOString(), ...data, result: response.data };
      setHistory(prev => [newHistoryItem, ...prev]);
      setActiveHistoryId(newHistoryItem.id);
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
      toast({ title: "Nothing to export", description: "Your history is empty." });
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(history, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `CustomsClass-R_history_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "History Exported", description: "Your interaction history has been downloaded." });
  };

  const handleClearHistory = () => {
    setHistory([]);
    setResult(null);
    setActiveHistoryId(null);
    form.reset({ brand: "", description: "" });
    toast({ title: "History Cleared" });
  };


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader>
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    <History className="size-5" />
                    <h2 className="text-lg font-semibold font-headline">History</h2>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleExport} aria-label="Export History" disabled={history.length === 0}>
                        <FileDown className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Clear History" disabled={history.length === 0}>
                            <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your interaction history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
            <SidebarMenu className="p-2">
                {isMounted && history.length === 0 && (
                    <div className="text-center text-muted-foreground p-4 text-sm">No interactions yet.</div>
                )}
                {isMounted && history.map((item) => (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                            onClick={() => handleHistorySelect(item)} 
                            isActive={item.id === activeHistoryId}
                            className="h-auto whitespace-normal py-2"
                        >
                            <div className="flex flex-col items-start gap-1 w-full">
                                <span className="font-semibold text-primary">{item.brand}</span>
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
                        <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="size-5 text-accent" />Product Details</CardTitle>
                        <CardDescription>Enter your product information to predict its HS code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="brand" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., QuantumLeap" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Description</FormLabel>
                                        <FormControl><Textarea placeholder="e.g., A retro-futuristic personal chronometer with a brass casing and Nixie tube display." className="min-h-[150px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? "Classifying..." : "Predict HS Code"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-headline">Classification Result</CardTitle>
                        <CardDescription>The predicted HS code and explanation will appear here.</CardDescription>
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
                                    <p className="text-sm text-muted-foreground">Predicted HS Code</p>
                                    <p className="text-4xl font-bold font-headline text-primary">{result.prediction.hsCode}</p>
                                </div>
                                <Accordion type="single" collapsible defaultValue="justification" className="w-full">
                                    <AccordionItem value="justification">
                                        <AccordionTrigger>Justification</AccordionTrigger>
                                        <AccordionContent className="text-foreground/80 prose prose-invert max-w-none">{result.prediction.explanation}</AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="retro-explanation">
                                        <AccordionTrigger>Retro Explanation</AccordionTrigger>
                                        <AccordionContent className="text-foreground/80 prose prose-invert max-w-none">{result.explanation.explanation}</AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <FileCode2 className="size-16 mb-4" />
                                <p className="font-semibold">Your results are pending</p>
                                <p className="text-sm">Fill out the form to get started.</p>
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
