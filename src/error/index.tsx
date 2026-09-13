import { useRouteError } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import './not-found.scss';

export const ErrorPage = () => {
    const error: unknown = useRouteError();

    return (
        <div id="error-page" className="error-page">
            <Header />
            <div className="not-found">
                <h2>Sorry, an unexpected error has occurred.</h2>
                <p>
                    <i>{error instanceof Error ? error.message : 'Unknown error'}</i>
                </p>
            </div>
            <div className="footer-container">
                <Footer />
            </div>
        </div>
    );
};
