import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const members: Member[] = [
    {
        id: "1",
        code: "P-10023",
        role: "Advocate",
        name: "Sophia Valentine",
        phone: "9823456789",
        gender: "Female",
        verified: true,
        reported: 0,
        plan: "Pro/Silver",
        coins: 100,
        since: "01-12-2025",
        status: "Active",
        image: "/avatar5.jpg",
    },
    {
        id: "2",
        code: "P-10024",
        role: "Client",
        name: "James Sterling",
        phone: "9823456790",
        gender: "Male",
        verified: true,
        reported: 1,
        plan: "Ultra Pro/Platinum",
        coins: 50,
        since: "15-12-2025",
        status: "Active",
        image: "/avatar6.jpg",
    },
];

const PremiumMembers: React.FC = () => {
    return <MemberTable title="Premium Members" initialMembers={members} context="premium" />;
};

export default PremiumMembers;
