import Footer from "./Footer.jsx";
import HomePage from "../../pages/Home/HomePage.jsx";
import './Common.css'
export default function Layout() {
    return (
        <>
            <header>
                <HomePage />
            </header>
            <footer>
                <Footer />
            </footer>
        </>
    );
}