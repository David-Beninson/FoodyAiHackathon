import { Outlet } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar.jsx";
export default function HomePage() {
    return (
        <>
            <header>
                <Navbar />
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
}