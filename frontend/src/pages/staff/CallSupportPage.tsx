import { useSearchParams } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import CallSupportDashboard from './roles/CallSupportDashboard';

const CallSupportPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'live';

    return (
        <StaffLayout>
            <CallSupportDashboard view={view as any} />
        </StaffLayout>
    );
};

export default CallSupportPage;
