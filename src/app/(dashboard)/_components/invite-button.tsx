import { OrganizationProfile } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const InviteButton = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <Button variant={"outline"}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite members
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[880px] max-w-[900px] p-0 border-none sm:max-w-none"            >
                <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
                    <OrganizationProfile
                        appearance={{
                            elements: {
                                rootBox: "w-full h-[400px]",
                            },
                        }}
                    />
                </div>
            </DialogContent>


        </Dialog>
    );
};
