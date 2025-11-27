"use client";

import { useState, useEffect, useMemo } from 'react';
import type { CostInput, CalculatedCosts } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Box, Clock, Zap, User, Printer, Paintbrush, TrendingUp, Save, Trash2, Repeat, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const initialCosts: CostInput = {
  pieceName: '',
  clientName: '',
  notes: '',
  
  filamentKiloCost: 25000,
  filamentGrams: 100,
  
  printingTimeHours: 5,
  
  printerConsumptionWatts: 350,
  kwhCost: 45,
  
  laborHours: 1,
  laborCostPerHour: 2000,
  
  printerDepreciation: 500,
  postProcessingCost: 5000,
  
  failureRiskPercentage: 5,
  urgencySurchargePercentage: 0,
  
  profitMargin: 20,
  currency: 'ARS',
};

const currencies = [
  { value: 'ARS', label: 'ARS - Peso argentino', symbol: '$' },
  { value: 'USD', label: 'USD - Dólar estadounidense', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
];

export function PrintCostCalculator() {
  const { toast } = useToast();
  const [costs, setCosts] = useState<CostInput>(initialCosts);
  const [isRecentUpdate, setIsRecentUpdate] = useState(false);
  const [isProjectInfoCollapsed, setProjectInfoCollapsed] = useState(false);


  const handleInputChange = (field: keyof CostInput, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    // Allow updating non-numeric fields as well
    if (typeof initialCosts[field] === 'string') {
        setCosts(prev => ({ ...prev, [field]: value }));
    } else if (!isNaN(numericValue)) {
      setCosts(prev => ({ ...prev, [field]: numericValue }));
    }
  };

  const handleCurrencyChange = (value: string) => {
    setCosts(prev => ({ ...prev, currency: value }));
  };

  const calculatedCosts: CalculatedCosts = useMemo(() => {
    const { 
        filamentKiloCost, filamentGrams, printingTimeHours, printerConsumptionWatts, kwhCost,
        laborHours, laborCostPerHour, printerDepreciation, postProcessingCost,
        failureRiskPercentage, profitMargin, urgencySurchargePercentage
    } = costs;

    const materialCost = (filamentKiloCost / 1000) * filamentGrams;
    const electricityCost = (printerConsumptionWatts * printingTimeHours / 1000) * kwhCost;
    const laborCost = laborHours * laborCostPerHour;
    const printerWearCost = printingTimeHours * printerDepreciation;

    const subtotal = materialCost + electricityCost + laborCost + printerWearCost + postProcessingCost;
    const failureRiskCost = subtotal * (failureRiskPercentage / 100);
    const productionCost = subtotal + failureRiskCost;
    const profit = productionCost * (profitMargin / 100);
    const urgencyCost = productionCost * (urgencySurchargePercentage / 100);
    
    const sellingPrice = productionCost + profit + urgencyCost;

    return {
      materialCost,
      electricityCost,
      laborCost,
      printerWearCost,
      postProcessingCost: costs.postProcessingCost,
      subtotal,
      failureRiskCost,
      productionCost,
      profit,
      urgencyCost,
      sellingPrice,
    };
  }, [costs]);
  
  useEffect(() => {
    setIsRecentUpdate(true);
    const timer = setTimeout(() => setIsRecentUpdate(false), 500);
    return () => clearTimeout(timer);
  }, [calculatedCosts]);
  
  const handleSave = () => {
    toast({
        title: "Presupuesto Guardado (Simulación)",
        description: `El presupuesto para "${costs.pieceName || 'Pieza sin nombre'}" ha sido guardado.`,
    });
  }

  const handleReset = () => {
    setCosts(initialCosts);
    toast({
        title: "Campos Reiniciados",
        description: "Todos los valores han vuelto a su estado inicial.",
    });
  }

  const currencySymbol = currencies.find(c => c.value === costs.currency)?.symbol || '$';

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return `${currencySymbol} 0,00`;
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: costs.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-3 flex flex-col gap-8">
        <Card className="h-fit">
           <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Información del Proyecto</CardTitle>
              <CardDescription>Identifique el trabajo y el cliente.</CardDescription>
            </div>
             <Button variant="ghost" size="icon" onClick={() => setProjectInfoCollapsed(!isProjectInfoCollapsed)}>
                {isProjectInfoCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
             </Button>
          </CardHeader>
          {!isProjectInfoCollapsed && (
            <CardContent className="space-y-4">
                <InputField icon={FileText} label="Nombre de la Pieza" value={costs.pieceName} onChange={e => handleInputChange('pieceName', e.target.value)} type="text" />
                <InputField icon={User} label="Cliente" value={costs.clientName} onChange={e => handleInputChange('clientName', e.target.value)} type="text" />
                 <div>
                    <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium mb-2">Observaciones</Label>
                    <Textarea id="notes" placeholder="Detalles del proyecto, colores, etc." value={costs.notes} onChange={e => handleInputChange('notes', e.target.value)} />
                </div>
            </CardContent>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Parámetros de Costo</CardTitle>
            <CardDescription>Ajuste los detalles para calcular el costo de impresión.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="p-4 border rounded-md">
                <h4 className="font-semibold mb-4 text-primary flex items-center"><Box className="mr-2 h-5 w-5" />Costo de Material</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Costo Kilo Filamento" value={costs.filamentKiloCost} onChange={e => handleInputChange('filamentKiloCost', e.target.value)} currencySymbol={currencySymbol} />
                    <InputField label="Gramos de la Pieza" value={costs.filamentGrams} onChange={e => handleInputChange('filamentGrams', e.target.value)} unit="g" />
                </div>
            </div>
            
            <div className="p-4 border rounded-md">
                <h4 className="font-semibold mb-4 text-primary flex items-center"><Zap className="mr-2 h-5 w-5" />Costo de Electricidad</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Consumo Impresora" value={costs.printerConsumptionWatts} onChange={e => handleInputChange('printerConsumptionWatts', e.target.value)} unit="Watts" />
                    <InputField label="Precio por kWh" value={costs.kwhCost} onChange={e => handleInputChange('kwhCost', e.target.value)} currencySymbol={currencySymbol} />
                </div>
            </div>

            <div className="p-4 border rounded-md">
                <h4 className="font-semibold mb-4 text-primary flex items-center"><User className="mr-2 h-5 w-5" />Costo de Mano de Obra</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Horas de Trabajo" value={costs.laborHours} onChange={e => handleInputChange('laborHours', e.target.value)} unit="hs" />
                    <InputField label="Costo por Hora" value={costs.laborCostPerHour} onChange={e => handleInputChange('laborCostPerHour', e.target.value)} currencySymbol={currencySymbol} />
                </div>
            </div>
            
            <div className="p-4 border rounded-md">
                 <h4 className="font-semibold mb-4 text-primary flex items-center"><Printer className="mr-2 h-5 w-5" />Costos de Impresión y Generales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Tiempo de Impresión" value={costs.printingTimeHours} onChange={e => handleInputChange('printingTimeHours', e.target.value)} unit="hs" />
                    <InputField label="Depreciación" value={costs.printerDepreciation} onChange={e => handleInputChange('printerDepreciation', e.target.value)} currencySymbol={currencySymbol} unit="/hora" />
                    <InputField icon={Paintbrush} label="Post-procesamiento" value={costs.postProcessingCost} onChange={e => handleInputChange('postProcessingCost', e.target.value)} currencySymbol={currencySymbol} />
                </div>
            </div>

             <div className="p-4 border rounded-md">
                 <h4 className="font-semibold mb-4 text-primary flex items-center"><TrendingUp className="mr-2 h-5 w-5" />Márgenes y Riesgos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={AlertTriangle} label="Riesgo de Fallas" value={costs.failureRiskPercentage} onChange={e => handleInputChange('failureRiskPercentage', e.target.value)} unit="%" />
                    <InputField label="Margen de Ganancia" value={costs.profitMargin} onChange={e => handleInputChange('profitMargin', e.target.value)} unit="%" />
                    <div className="space-y-2">
                        <Label htmlFor="urgency">Urgencia</Label>
                        <Select value={String(costs.urgencySurchargePercentage)} onValueChange={(val) => handleInputChange('urgencySurchargePercentage', val)}>
                            <SelectTrigger id="urgency">
                                <SelectValue placeholder="Seleccione urgencia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Normal</SelectItem>
                                <SelectItem value="20">Urgente (+20%)</SelectItem>
                                <SelectItem value="30">Express (+30%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
            </div>
            
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
               <Button onClick={handleReset} variant="outline"><Trash2 className="mr-2 h-4 w-4" /> Reiniciar</Button>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Guardar</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Resumen Detallado de Costos</CardTitle>
            <CardDescription>Así es como se desglosa el precio final.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
             <ResultRow label="Material" value={formatCurrency(calculatedCosts.materialCost)} isRecentUpdate={isRecentUpdate} />
             <ResultRow label="Electricidad" value={formatCurrency(calculatedCosts.electricityCost)} isRecentUpdate={isRecentUpdate} />
             <ResultRow label="Mano de Obra" value={formatCurrency(calculatedCosts.laborCost)} isRecentUpdate={isRecentUpdate} />
             <ResultRow label="Desgaste Impresora" value={formatCurrency(calculatedCosts.printerWearCost)} isRecentUpdate={isRecentUpdate} />
             <ResultRow label="Post-procesado" value={formatCurrency(calculatedCosts.postProcessingCost)} isRecentUpdate={isRecentUpdate} />
             <Separator />
             <ResultRow label="Subtotal (Costos Directos)" value={formatCurrency(calculatedCosts.subtotal)} isRecentUpdate={isRecentUpdate} isTotal={true} />
             <ResultRow label="Cobertura de Riesgo" value={formatCurrency(calculatedCosts.failureRiskCost)} isRecentUpdate={isRecentUpdate} />
             <Separator />
             <ResultRow label="Costo de Producción Total" value={formatCurrency(calculatedCosts.productionCost)} isRecentUpdate={isRecentUpdate} isTotal={true} />
          </CardContent>
        </Card>
        
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Cálculo Final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResultRow label="Ganancia" value={formatCurrency(calculatedCosts.profit)} isRecentUpdate={isRecentUpdate} isTotal={false} darkTheme={true} />
            {costs.urgencySurchargePercentage > 0 && <ResultRow label="Recargo por Urgencia" value={formatCurrency(calculatedCosts.urgencyCost)} isRecentUpdate={isRecentUpdate} darkTheme={true}/>}
            <Separator className="bg-primary-foreground/20" />
            <div className={cn("flex justify-between items-center text-3xl font-bold transition-all duration-300", isRecentUpdate && "scale-105")}>
              <span>PRECIO FINAL</span>
              <span>{formatCurrency(calculatedCosts.sellingPrice)}</span>
            </div>
          </CardContent>
           <CardFooter className="flex justify-end gap-2">
              <Button variant="secondary" disabled><FileText className="mr-2 h-4 w-4" /> Exportar PDF</Button>
              <Button variant="secondary" disabled><Repeat className="mr-2 h-4 w-4" /> Duplicar</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

const InputField = ({ icon: Icon, label, value, onChange, unit, currencySymbol, type="number", ...props }: any) => (
  <div className="space-y-2">
    <Label htmlFor={label} className="flex items-center gap-2 text-sm font-medium">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      {label}
    </Label>
    <div className="relative">
      <Input
        id={label}
        type={type}
        step={type === 'number' ? "0.01" : undefined}
        value={value}
        onChange={onChange}
        className={cn("w-full", (unit || currencySymbol) ? 'pr-14' : 'pr-4')}
        {...props}
      />
      {(unit || currencySymbol) && 
        <Badge variant="secondary" className="absolute inset-y-0 right-0 m-1.5 pointer-events-none text-xs">
          {currencySymbol}{unit}
        </Badge>
      }
    </div>
  </div>
);

const ResultRow = ({ label, value, isRecentUpdate, isTotal = false, darkTheme = false }: any) => (
    <div className={cn("flex justify-between items-baseline transition-colors duration-300 rounded-md -mx-2 px-2 py-1", isRecentUpdate && !darkTheme && "bg-accent/10", isRecentUpdate && darkTheme && "bg-primary-foreground/10", isTotal && "font-semibold", darkTheme ? "text-primary-foreground/90" : "text-foreground")}>
      <span className={cn(isTotal ? "text-base" : "text-sm")}>{label}</span>
      <span className={cn("font-mono font-medium", isTotal ? "text-lg" : "text-base")}>{value}</span>
    </div>
);
