// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { refreshSession, logout } from "@/actions/auth";
// import { AppApiResponse } from "@/types/apiResponse.types";
// import {
//   useQuery,
//   UseQueryOptions,
//   UseQueryResult,
//   QueryKey,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";

// /**
//  * Generic fetcher type.
//  * Should return an AppApiResponse<TData>
//  */
// type Fn<TData> = () => Promise<AppApiResponse<TData>>;

// interface UseAppQueryOptions<TData, TError>
//   extends Omit<
//     UseQueryOptions<AppApiResponse<TData>, TError, TData>,
//     "queryFn" | "select" | "queryKey"
//   > {
//   showToast?: boolean;
// }

// /**
//  * Custom useAppQuery wrapper that:
//  * - Automatically unwraps API responses (returns `data.data`)
//  * - Handles UNAUTHORIZED errors by refreshing session (max 2 retries)
//  * - Logs out after 2 failed refreshes
//  * - Handles success/error toasts
//  */
// export function useAppQuery<TData = any, TError = any>(
//   key: QueryKey,
//   fn: Fn<TData>,
//   options?: UseAppQueryOptions<TData, TError>
// ): UseQueryResult<TData, TError> {
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   return useQuery<AppApiResponse<TData>, TError, TData>({
//     queryKey: key,
//     queryFn: async () => {
//       let res = await fn();
//       let retryCount = 0;

//       // Retry up to 2 times if unauthorized
//       while (res.errorCode === "UNAUTHORIZED" && retryCount < 2) {
//         retryCount++;
//         console.warn(
//           `Query unauthorized — refreshing session (attempt ${retryCount})...`
//         );

//         try {
//           await refreshSession();
//         } catch (err) {
//           console.log("Session refresh failed:", err);
//           break;
//         }

//         res = await fn();
//       }

//       // After 2 failed refreshes, logout and redirect
//       if (res.errorCode === "UNAUTHORIZED" && retryCount >= 2) {
//         console.log("Session refresh limit reached. Logging out...");
//         toast.error("Session expired. Please log in again.");
//         await logout();
//         queryClient.clear();
//         router.push("/signin");
//         throw new Error("Session expired — logged out.");
//       }

//       // Handle general failure
//       if (!res.success) {
//         if (options?.showToast !== false) {
//           toast.error(res.message || "Failed to fetch data");
//         }
//         throw new Error(res.message || "Query failed");
//       }

//       // Optional success toast
//       if (options?.showToast) {
//         toast.success(res.message || "Fetched successfully");
//       }

//       // Unwrap and return actual data
//       return res.data?.data ?? (res.data as any);
//     },
//     ...options,
//   });
// }
