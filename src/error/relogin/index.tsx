import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTE } from '../../router/router.enum';

export const ReLogin = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '48px 0' }}>
            <Result
                status="warning"
                title="Your session could not be reached"
                subTitle="Please go back to the home page and try again."
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTE.ROOT)}>
                        Back to Home
                    </Button>
                }
            />
        </div>
    );
};
