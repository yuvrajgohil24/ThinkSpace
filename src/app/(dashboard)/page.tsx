"use client";

import { useOrganization } from "@clerk/nextjs";

import { EmptyOrg } from "./_components/empty-org";
import { ThinkSpaceList } from "./_components/thinkspace-list";

interface DashboardPageProps {
    searchParams: {
        search?: string;        //check typo from search-input.tsx page
        favorites?: string;     //check typo from company-sidebar.tsx page
    };
};

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
    const { organization } = useOrganization();

    return (
        <div className="flex-1 h-[100%] p-6">
            {!organization ? (
                <EmptyOrg />
            ) : (
                <ThinkSpaceList
                    orgId={organization.id}
                    query={searchParams}
                />
            )}
        </div>
    );
};

export default DashboardPage;