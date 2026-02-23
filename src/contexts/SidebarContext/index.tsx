'use client';

import { createContext } from "react";
import { SidebarContextProps } from "@/components/ui/sidebar";

export const SidebarContext = createContext<SidebarContextProps | null>(null)