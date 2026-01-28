import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const members: Member[] = [
    {
        id: "1",
        code: "R-4001",
        role: "Advocate",
        name: "Elijah Mikaelson",
        phone: "9000000006",
        gender: "Male",
        verified: true,
        reported: 15,
        plan: "Pro Lite/Gold",
        coins: 0,
        since: "12-07-2025",
        status: "Active",
        image: "/avatar12.jpg",
    },
    {
        id: "2",
        code: "R-4002",
        role: "Client",
        name: "Finn Mikaelson",
        phone: "9000000008",
        gender: "Male",
        verified: true,
        reported: 10,
        plan: "Free",
        coins: 0,
        since: "13-07-2025",
        status: "Active",
        image: "/avatar2.jpg",
    },
];

const ReportedMembers: React.FC = () => {
    return <MemberTable title="Reported Members" initialMembers={members} />;
};

export default ReportedMembers;
