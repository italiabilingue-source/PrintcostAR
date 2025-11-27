import { PrintCostCalculator } from '@/components/print-cost-calculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 py-8 sm:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
            PrintCost AR
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Calcule con precisión el costo de sus impresiones 3D con la ayuda de IA. Introduzca los detalles de su proyecto o describa la pieza para obtener una estimación instantánea.
          </p>
        </header>
        <PrintCostCalculator />
      </div>
       <footer className="py-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} PrintCost AR. All rights reserved.</p>
        </footer>
    </main>
  );
}
