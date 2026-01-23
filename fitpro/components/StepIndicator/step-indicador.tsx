"use client"

import * as React from 'react' // Adicionado importação explícita do React





export default function StepIndicator({ currentStep, totalSteps, titles }: { currentStep: number, totalSteps: number, titles: string[] }) {
  return (
    <div className="flex justify-center w-full max-w-3xl mx-auto ">
      <div className="flex items-center w-full justify-between">
        {titles.map((title, index) => {
          const stepId = index + 1
          return (
            <React.Fragment key={stepId}>
              <div className="flex flex-col items-center">
                <div
                  className={`size-8 flex items-center justify-center rounded-full font-bold transition-colors border-2 ${
                    currentStep > stepId
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === stepId
                        ? 'bg-accent border-accent text-white'
                        : 'bg-background border-border text-muted-foreground'
                  }`}
                >
                  {stepId}
                </div>
                <span className={`mt-2 hidden sm:inline text-xs font-medium text-center ${currentStep >= stepId ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {title.split(' ')[0]}
                </span>
              </div>
              {stepId < totalSteps && (
                <div className={`flex-1 h-px transition-colors duration-300 ${currentStep > stepId ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}