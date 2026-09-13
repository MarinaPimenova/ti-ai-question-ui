// landing-layout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Interceptor } from '../components/interceptor';
import { ScrollToTop } from '../components/scroll-to-top';

import './landing.scss';

export const LandingLayout = () => {
    return (
        <div className="app-layout">
            <Interceptor />
            <ScrollToTop />
            <Header />
            <main className="container">
                <div className="content">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};
