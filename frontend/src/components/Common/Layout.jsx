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
    const { user, logout } = useAuth();

    return (
        <div className="layout-container">
            <nav className="navbar">
                <div className="logo">
                    <Link to="/">Foody<span>AI</span></Link>
                </div>
                <div className="linksContainer">
                    <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
                    <Link to="/planner" className={isPlannerPage ? "active" : ""}>Planner</Link>
                    <Link to="/pantry" className={isPantryPage ? "active" : ""}>Pantry</Link>
                    <Link to="/shopping-list" className={isShoppingListPage ? "active" : ""}>Shopping List</Link>
                    <Link to="/Profile" className={isProfilePage ? "active" : ""}>Profile</Link>
                    {user && (
                        <div className="nav-user-container">
                            <span className="nav-welcome">Hi, {user.username}</span>
                            <button onClick={logout} className="nav-logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
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