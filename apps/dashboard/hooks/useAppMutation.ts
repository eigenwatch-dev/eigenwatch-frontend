// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { refreshSession, logout } from "@/actions/auth";
// import { AppApiResponse } from "@/types/apiResponse.types";
// import {
//   useMutation,
//   UseMutationOptions,
//   UseMutationResult,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";

// type Fn<TData, TVariables> = (
//   variables: TVariables
// ) => Promise<AppApiResponse<TData>>;

// /**
//  * A smart mutation wrapper that:
//  * - Handles error toasts automatically
//  * - Unwraps API responses (returns the actual data)
//  * - Refreshes session & retries on UNAUTHORIZED (max 2 attempts)
//  * - Logs user out if still unauthorized after 2 retries
//  * - Only calls onSuccess when success = true
//  */
// export function useAppMutation<TData = any, TVariables = void>(
//   fn: Fn<TData, TVariables>,
//   options?: Omit<
//     UseMutationOptions<AppApiResponse<TData>, any, TVariables, unknown>,
//     "mutationFn" | "onSuccess"
//   > & {
//     onSuccess?: (data?: TData) => void;
//   }
// ): UseMutationResult<AppApiResponse<TData>, any, TVariables> {
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   return useMutation<AppApiResponse<TData>, any, TVariables>({
//     mutationFn: async (variables: TVariables) => {
//       let response = await fn(variables);
//       let retryCount = 0;

//       // Retry loop (max 2 refreshes)
//       while (response.errorCode === "UNAUTHORIZED" && retryCount < 2) {
//         retryCount++;
//         console.warn(
//           `Session expired — refreshing session (attempt ${retryCount})...`
//         );

//         try {
//           await refreshSession();
//         } catch (err) {
//           console.log("Session refresh failed:", err);
//           break;
//         }

//         response = await fn(variables);
//       }

//       // After 2 failed refreshes, force logout
//       if (response.errorCode === "UNAUTHORIZED" && retryCount >= 2) {
//         console.log("Session refresh limit reached. Logging out...");
//         toast.error("Session expired. Please log in again.");
//         await logout();
//         queryClient.clear();
//         router.push("/signin");
//       }

//       return response;
//     },
//     ...options,
//     onSuccess: (response) => {
//       if (!response.success) {
//         toast.error(response.message || "Operation failed");
//         return;
//       }

//       const unwrapped = response.data?.data;
//       toast.success(response.message || "Success");

//       if (options?.onSuccess) {
//         options.onSuccess(unwrapped);
//       }
//     },
//     onError: (error: any) => {
//       console.log(error);
//       toast.error(error?.message || "Something went wrong");
//     },
//   });
// }
