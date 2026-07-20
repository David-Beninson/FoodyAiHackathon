import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Footer from "./Footer.jsx";
import './Common.css';

export default function Layout() {
    const location = useLocation();
    const isProfilePage = location.pathname.toLowerCase() === "/profile";
    const isPlannerPage = location.pathname.toLowerCase() === "/planner";
    const isPantryPage = location.pathname.toLowerCase() === "/pantry";
    const isShoppingListPage = location.pathname.toLowerCase() === "/shopping-list";
    const { user } = useAuth();

    return (
        <div className="layout-container">
            <nav className="navbar">
                <div className="logo">
                    <Link to="/">Foody<span>AI</span></Link>
                </div>
                <div className="linksContainer">
                    <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
                    <span className="nav-divider"></span>
                    <Link to="/planner" className={isPlannerPage ? "active" : ""}>Planner</Link>
                    <span className="nav-divider"></span>
                    <Link to="/pantry" className={isPantryPage ? "active" : ""}>Pantry</Link>
                    <span className="nav-divider"></span>
                    <Link to="/shopping-list" className={isShoppingListPage ? "active" : ""}>Shopping List</Link>
                    <span className="nav-divider"></span>
                    <Link to="/Profile" className={isProfilePage ? "active" : ""}>Profile</Link>
                </div>
                <div className="nav-right-section">
                    {user ? (
                        <div className="nav-user-container">
                            <span className="nav-divider"></span>
                            <span className="nav-welcome">Hi, {user.username}</span>
                        </div>
                    ) : (
                        <div className="nav-right-placeholder"></div>
                    )}
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}