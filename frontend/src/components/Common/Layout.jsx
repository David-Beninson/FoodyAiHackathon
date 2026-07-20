import { Link, Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer.jsx";
import './Common.css';

export default function Layout() {
    const location = useLocation();
    const isProfilePage = location.pathname.toLowerCase() === "/profile";

    return (
        <div className="layout-container">
            {/* סרגל ניווט עליון */}
            <nav className="navbar">
                <div className="logo">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>FoodyAI</Link>
                </div>
                <div className="linksContainer">
                    <Link to="/" className={!isProfilePage ? "active" : ""}>Home</Link>
                    <Link to="/Profile" className={isProfilePage ? "active" : ""}>Profile</Link>
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}
