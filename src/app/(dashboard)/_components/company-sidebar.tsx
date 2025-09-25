"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";

import { LayoutDashboard, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
})

export const CompanySidebar = () => {
    const searchParams = useSearchParams();
    const favorites = searchParams.get("favorites");

    return (
        <div className="hidden lg:flex flex-col space-y-6 w-[200px] pl-5 pt-5">
            <Link href="/">
                <div className="flex items-center justify-center">
                    <Image
                        src={"/logo.svg"}
                        alt="Logo"
                        height={600}
                        width={70}
                        className="scale-300"
                    />
                    {/* <div className={cn(
                        "font-semibold text-2xl",
                        font.className,
                    )}>
                        TSpace
                    </div> */}
                </div>
            </Link>

            <OrganizationSwitcher
                hidePersonal
                appearance={{
                    elements: {
                        rootBox: {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                        },
                        organizationSwitcherTrigger: {
                            padding: "6px",
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            justifyContent: "space-between",
                            backgroundColor: "white"
                        }
                    }
                }}
            />
            <div className="space-y-1 w-full">
                <Button asChild
                    variant={favorites ? "ghost" : "secondary"}
                    size={"lg"}
                    className="font-normal justify-start px-2 w-full"
                >
                    <Link href={"/"}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Team boards
                    </Link>
                </Button>
                <Button asChild
                    variant={favorites ? "secondary" : "ghost"}
                    size={"lg"}
                    className="font-normal justify-start px-2 w-full"
                >
                    <Link href={{
                        pathname: "/",
                        query: { favorites: true }
                    }}>
                        <Star className="h-4 w-4 mr-2" />
                        Favorite boards
                    </Link>
                </Button>
            </div>
        </div>
    )
}