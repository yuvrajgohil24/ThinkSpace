import Image from "next/image";
import { useMutation } from "convex/react";
import { useOrganization } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";

export const EmptyBoards = () => {
    const { organization } = useOrganization();
    // const mutate = useMutation(api.board.create);
    const { mutate, pending } = useApiMutation(api.board.create);

    const onClick = () => {
        if (!organization) {
            return;
        }

        mutate({
            orgId: organization.id,
            title: "Untitled"
        }).then((id) => {
            toast.success("Space created")
        }).catch(() => toast.error("Failed in creating space"));
    }

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image
                src={"/note.svg"}
                alt="Empty Search"
                height={110}
                width={110}
            />
            <h2 className="text-2xl font-semibold mt-6">Create your first board!</h2>
            <p className="text-muted-foreground text-sm mt-2">Start by creating a board for your organization</p>
            <div className="mt-6">
                <Button size={"lg"} onClick={onClick} disabled={pending}>
                    Create board
                </Button>
            </div>
        </div>
    )
}