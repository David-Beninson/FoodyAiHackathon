import { Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import './Common.css'
export default function Layout() {
    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="content">
                <Outlet />
            </main>
            <footer>
                <Footer />
            </footer>
        </>
    );
}