"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

import { api } from "../../convex/_generated/api";

import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ConfirmAction } from "./confirm-action";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string;
    title: string;
};

export const SpaceActions = ({ children, side, sideOffset, id, title }: ActionProps) => {

    const { onOpen } = useRenameModal();

    const { mutate, pending } = useApiMutation(api.space.remove);

    const deleteSpace = () => {
        mutate({ id })
            .then(() => toast.success("Space deleted"))
            .catch(() => toast.error("Failed to delete space"))
    }

    const copyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/space/${id}`,
        )
            .then(() => toast.success("Link copied"))
            .catch(() => toast.error("Failed to copy link!"))
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent side={side} sideOffset={sideOffset} className="w-60" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem className="p-3 cursor-pointer" onClick={copyLink}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy space link
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer" onClick={() => onOpen(id, title)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename space
                </DropdownMenuItem>
                <ConfirmAction
                    header="Delete space?"
                    description="This will delete the space and all its contents."
                    disabled={pending}
                    onConfirm={deleteSpace}
                >
                    <Button
                        variant={'ghost'}
                        className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
                    // onClick={deleteSpace}
                    >
                        <Trash2 className="h-4 w-4 mr-2 opacity-50" />
                        Delete space
                    </Button>
                </ConfirmAction>
            </DropdownMenuContent>
        </DropdownMenu >
    )
}