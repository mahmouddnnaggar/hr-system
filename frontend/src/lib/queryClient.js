import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export const liveQueryOptions = {
  refetchInterval: 1000,
  refetchIntervalInBackground: true,
  staleTime: 0,
};
