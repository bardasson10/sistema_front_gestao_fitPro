'use client';

import { createContext } from 'react';
import { ProductionContextType } from '@/types/production';

export const ProductionContext = createContext<ProductionContextType | undefined>(undefined);