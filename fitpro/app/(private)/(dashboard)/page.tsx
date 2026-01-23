import StepIndicator from "@/components/StepIndicator/step-indicador";

export default function DashboardPage() {
  return (
  <div>
    <StepIndicator currentStep={1} totalSteps={3} titles={['Step 1', 'Step 2', 'Step 3']} />
  </div>);
}