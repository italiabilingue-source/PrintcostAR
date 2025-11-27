export interface CostInput {
  materialCost: number;
  printingTimeHours: number;
  electricityCost: number;
  laborCost: number;
  printerDepreciation: number;
  postProcessingCost: number;
  profitMargin: number;
  currency: string;
}

export interface CalculatedCosts {
  productionCost: number;
  sellingPrice: number;
  profit: number;
  totalMaterialCost: number;
  totalTimeBasedCost: number;
}
