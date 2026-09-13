// src/error/network/index.tsx
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTE } from '../../router/router.enum';

export const BaseNetworkError: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '48px 0' }}>
            <Result
                status="500"
                title="Service Unavailable"
                subTitle="Sorry, the server is currently unreachable. Please check your network connection or try again later."
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTE.ROOT)}>
                        Try Again
                    </Button>
                }
            />
        </div>
    );
};
