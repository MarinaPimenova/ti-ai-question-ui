import type { FallbackProps } from 'react-error-boundary';
import { Button, Result } from 'antd';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
        <div style={{ padding: '48px 0' }}>
            <Result
                status="error"
                title="Something went wrong"
                subTitle={errorMessage}
                extra={
                    <Button type="primary" onClick={resetErrorBoundary}>
                        Try again
                    </Button>
                }
            />
        </div>
    );
}

export default Fallback;
