"use client"

import { ThemeProvider } from "./ThemeProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useMemo } from "react"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos (antes era cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }), [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
