"use client";

import { Plus } from "lucide-react";
import { CreateOrganization } from "@clerk/nextjs";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Hint } from "@/components/hint";

export const NewButton = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="aspect-square">
                    <Hint label="Create Organization" side="right" align="start" sideOffset={8}>
                        <button className="bg-white/25 h-full w-full rounded-md flex justify-center items-center opacity-60 hover:opacity-100 transition cursor-pointer">
                            <Plus className="text-white" />
                        </button>
                    </Hint>
                </div>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none w-[430px] max-w-[450px]">
                <CreateOrganization />
            </DialogContent>
        </Dialog>
    );
};