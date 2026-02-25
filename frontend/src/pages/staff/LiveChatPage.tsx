import { useSearchParams } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import LiveChatDashboard from './roles/LiveChatDashboard';

const LiveChatPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'live';

    return (
        <StaffLayout>
            <LiveChatDashboard view={view as any} />
        </StaffLayout>
    );
};

export default LiveChatPage;
