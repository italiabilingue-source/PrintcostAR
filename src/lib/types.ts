export interface CostInput {
  pieceName: string;
  clientName: string;
  notes: string;

  filamentKiloCost: number;
  filamentGrams: number;
  
  printingTimeHours: number;
  
  printerConsumptionWatts: number;
  kwhCost: number;
  
  laborHours: number;
  laborCostPerHour: number;
  
  printerDepreciation: number;
  postProcessingCost: number;

  failureRiskPercentage: number;
  urgencySurchargePercentage: number;
  
  profitMargin: number;
  currency: string;
}

export interface CalculatedCosts {
  materialCost: number;
  electricityCost: number;
  laborCost: number;
  printerWearCost: number;
  postProcessingCost: number;
  subtotal: number;
  failureRiskCost: number;
  productionCost: number;
  profit: number;
  urgencyCost: number;
  sellingPrice: number;
}
