"use client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute: data considered "fresh"
      gcTime: 5 * 60_000, // 5 minutes: keep in cache after unmount
      refetchOnWindowFocus: false, // Don't refetch on tab switch
      refetchOnMount: false, // Don't refetch if data exists and is fresh
      retry: 1, // One retry on failure
    },
  },
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      <ErrorBoundary>{children}</ErrorBoundary>
      <ReactQueryDevtools position="right" buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
