import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const testQueryClients: QueryClient[] = [];

export function createTestQueryClient(): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  testQueryClients.push(queryClient);
  return queryClient;
}

export function clearTestQueryClients() {
  testQueryClients.splice(0).forEach((queryClient) => queryClient.clear());
}

export function createQueryWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
