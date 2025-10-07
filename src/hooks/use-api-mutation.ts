import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import { useState } from "react";

// Define a type for any function reference that is a mutation (no arguments, unknown result)
// This is the safest way to avoid 'any' when creating a generic hook.
type AnyMutationFunction = FunctionReference<"mutation">;

export const useApiMutation = (mutationFunction: AnyMutationFunction) => {
  const [pending, setPending] = useState(false);
  const apiMutation = useMutation(mutationFunction);

  const mutate = (payload: unknown) => {
    setPending(true);
    return apiMutation(payload)
      .finally(() => setPending(false))
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
      });
  };

  return {
    mutate,
    pending,
  };
};
