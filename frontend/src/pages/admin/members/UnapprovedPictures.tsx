import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const UnapprovedPictures: React.FC = () => {
    return <MemberTable title="Unapproved Profiles (Rejected)" context="rejected" />;
};

export default UnapprovedPictures;
