"use client";
import { useRouter } from "next/navigation";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";

import { Plus } from "lucide-react";
import { toast } from "sonner";

interface NewSpaceButtonProps {
    orgId: string;
    disabled?: boolean;
}

export const NewSpaceButton = ({ orgId, disabled }: NewSpaceButtonProps) => {
    const router = useRouter();
    const { mutate, pending } = useApiMutation(api.space.create);

    const handleClick = () => {
        mutate({
            orgId,
            title: "Untitled"
        }).then((id) => {
            toast.success("Space created")
            router.push(`/space/${id}`)
        }).catch(() => toast.error("Failed to create the space"))
    }

    return (
        <button
            disabled={pending || disabled}
            onClick={handleClick}
            className={cn("col-span-1 aspect-[100/127] bg-orange-400 rounded-lg hover:bg-orange-600 flex flex-col items-center justify-center py-6 cursor-pointer", (pending || disabled) && "opacity-75 hover:bg-orange-400 cursor-not-allowed")}
        >
            <div />
            <Plus className="h-12 w-12 text-white stroke-1" />
            <p className="text-sm  text-white ">
                New space
            </p>
        </button>
    )
}