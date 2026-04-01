'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function NovaConferenciaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/conferencia");
  }, [router]);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-3 lg:col-span-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </main>
  );
}

export default NovaConferenciaPage;