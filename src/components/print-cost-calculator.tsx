"use client";

import { useState, useEffect, useMemo } from 'react';
import type { CostInput, CalculatedCosts } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Box, Clock, Zap, User, Printer, Paintbrush, TrendingUp, Wand2, Lightbulb, Save, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { generateEstimatesFromPrompt } from '@/ai/flows/generate-estimates-from-prompt';
import { analyzeAndSuggestOptimizations } from '@/ai/flows/analyze-and-suggest-optimizations';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const initialCosts: CostInput = {
  materialCost: 10,
  printingTimeHours: 5,
  electricityCost: 0.15,
  laborCost: 20,
  printerDepreciation: 0.5,
  postProcessingCost: 5,
  profitMargin: 20,
  currency: 'USD',
};

const currencies = [
  { value: 'USD', label: 'USD - Dólar estadounidense', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - Libra esterlina', symbol: '£' },
  { value: 'JPY', label: 'JPY - Yen japonés', symbol: '¥' },
];

export function PrintCostCalculator() {
  const { toast } = useToast();
  const [costs, setCosts] = useState<CostInput>(initialCosts);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState('');
  const [isRecentUpdate, setIsRecentUpdate] = useState(false);

  const handleInputChange = (field: keyof CostInput, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      setCosts(prev => ({ ...prev, [field]: numericValue }));
    }
  };

  const handleCurrencyChange = (value: string) => {
    setCosts(prev => ({ ...prev, currency: value }));
  };

  const calculatedCosts: CalculatedCosts = useMemo(() => {
    const { materialCost, printingTimeHours, electricityCost, laborCost, printerDepreciation, postProcessingCost, profitMargin } = costs;
    const totalTimeBasedCost = printingTimeHours * (electricityCost + laborCost + printerDepreciation);
    const productionCost = materialCost + totalTimeBasedCost + postProcessingCost;
    const profit = productionCost * (profitMargin / 100);
    const sellingPrice = productionCost + profit;

    return {
      productionCost,
      sellingPrice,
      profit,
      totalMaterialCost: materialCost,
      totalTimeBasedCost,
    };
  }, [costs]);
  
  useEffect(() => {
    setIsRecentUpdate(true);
    const timer = setTimeout(() => setIsRecentUpdate(false), 500);
    return () => clearTimeout(timer);
  }, [calculatedCosts]);

  const handleGenerateEstimates = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, introduzca una descripción para generar la estimación.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const estimates = await generateEstimatesFromPrompt({ prompt });
      setCosts(estimates);
      toast({
        title: "Éxito",
        description: "Estimaciones generadas con IA y aplicadas.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudieron generar las estimaciones.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestOptimizations = async () => {
    setIsOptimizing(true);
    setOptimizationSuggestions('');
    try {
      const costEstimationDetails = JSON.stringify(costs, null, 2);
      const result = await analyzeAndSuggestOptimizations({ costEstimationDetails });
      setOptimizationSuggestions(result.optimizationSuggestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudieron generar las sugerencias de optimización.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleSave = () => {
    // This is a mock save function. In a real app, this would save to Firestore.
    toast({
        title: "Guardado",
        description: "Su estimación de costos ha sido guardada.",
    });
  }

  const currencySymbol = currencies.find(c => c.value === costs.currency)?.symbol || '$';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: costs.currency }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-3 h-fit">
        <CardHeader>
          <CardTitle>Parámetros de Entrada</CardTitle>
          <CardDescription>Ajuste los detalles para calcular el costo de impresión.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
            <Label htmlFor="ai-prompt" className="font-semibold text-primary">Generar con IA</Label>
            <Textarea
              id="ai-prompt"
              placeholder="Ej: Un pequeño engranaje de repuesto para una bicicleta, impreso en PLA, con un 20% de relleno."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={handleGenerateEstimates} disabled={isGenerating}>
              {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generar Estimación
            </Button>
          </div>
          
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField icon={Box} label="Costo del Material" value={costs.materialCost} onChange={e => handleInputChange('materialCost', e.target.value)} currencySymbol={currencySymbol} />
            <InputField icon={Clock} label="Tiempo de Impresión" value={costs.printingTimeHours} onChange={e => handleInputChange('printingTimeHours', e.target.value)} unit="horas" />
            <InputField icon={Zap} label="Electricidad" value={costs.electricityCost} onChange={e => handleInputChange('electricityCost', e.target.value)} currencySymbol={currencySymbol} unit="/hora" />
            <InputField icon={User} label="Mano de Obra" value={costs.laborCost} onChange={e => handleInputChange('laborCost', e.target.value)} currencySymbol={currencySymbol} unit="/hora" />
            <InputField icon={Printer} label="Depreciación" value={costs.printerDepreciation} onChange={e => handleInputChange('printerDepreciation', e.target.value)} currencySymbol={currencySymbol} unit="/hora" />
            <InputField icon={Paintbrush} label="Post-procesamiento" value={costs.postProcessingCost} onChange={e => handleInputChange('postProcessingCost', e.target.value)} currencySymbol={currencySymbol} />
            <InputField icon={TrendingUp} label="Margen de Ganancia" value={costs.profitMargin} onChange={e => handleInputChange('profitMargin', e.target.value)} unit="%" />
            
            <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={costs.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger id="currency">
                        <SelectValue placeholder="Seleccione moneda" />
                    </SelectTrigger>
                    <SelectContent>
                        {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <Separator />
          <div className="flex justify-end">
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Guardar Estimación</Button>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Desglose Detallado</CardTitle>
            <CardDescription>Así es como se suman los costos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <ResultRow label="Costo Total del Material" value={formatCurrency(calculatedCosts.totalMaterialCost)} isRecentUpdate={isRecentUpdate} />
             <ResultRow label="Costos Basados en el Tiempo" value={formatCurrency(calculatedCosts.totalTimeBasedCost)} isRecentUpdate={isRecentUpdate} />
             <ResultRow label="Costo de Post-procesamiento" value={formatCurrency(costs.postProcessingCost)} isRecentUpdate={isRecentUpdate} />
             <Separator />
             <ResultRow label="Subtotal (Costo de Producción)" value={formatCurrency(calculatedCosts.productionCost)} isRecentUpdate={isRecentUpdate} isTotal={true} />
          </CardContent>
        </Card>
        
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Cálculo Final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResultRow label="Ganancia" value={formatCurrency(calculatedCosts.profit)} isRecentUpdate={isRecentUpdate} isTotal={false} darkTheme={true} />
            <Separator className="bg-primary-foreground/20" />
            <div className={cn("flex justify-between items-center text-2xl font-bold transition-all duration-300", isRecentUpdate && "scale-105")}>
              <span>Precio de Venta</span>
              <span>{formatCurrency(calculatedCosts.sellingPrice)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent" /> Optimización con IA</CardTitle>
                <CardDescription>Obtenga sugerencias para reducir costos y mejorar la rentabilidad.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleSuggestOptimizations} disabled={isOptimizing} className="w-full" variant="outline">
                    {isOptimizing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                    Sugerir Optimizaciones
                </Button>
                {isOptimizing && (
                    <div className="space-y-3 mt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {optimizationSuggestions && (
                    <div className="mt-4 text-sm p-4 bg-secondary/30 rounded-lg whitespace-pre-wrap font-mono">
                        {optimizationSuggestions}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

const InputField = ({ icon: Icon, label, value, onChange, unit, currencySymbol, ...props }: any) => (
  <div className="space-y-2">
    <Label htmlFor={label} className="flex items-center gap-2 text-sm font-medium">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Label>
    <div className="relative">
      <Input
        id={label}
        type="number"
        step="0.01"
        value={value}
        onChange={onChange}
        className="pr-12"
        {...props}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-muted-foreground">
        {currencySymbol}{unit}
      </div>
    </div>
  </div>
);

const ResultRow = ({ label, value, isRecentUpdate, isTotal = false, darkTheme = false }: any) => (
    <div className={cn("flex justify-between items-center transition-colors duration-300 rounded-md -mx-2 px-2 py-1", isRecentUpdate && !darkTheme && "bg-accent/10", isRecentUpdate && darkTheme && "bg-primary-foreground/10", isTotal ? "font-semibold text-lg" : "text-sm", darkTheme ? "text-primary-foreground/90" : "text-foreground")}>
      <span>{label}</span>
      <span className={cn(isTotal && "font-bold")}>{value}</span>
    </div>
);
