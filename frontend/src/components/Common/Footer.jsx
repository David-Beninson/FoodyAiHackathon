import './Common.css';

export default function Footer() {
    return (
        <footer className="appFooter">
            <div className="appFooterContent">
                <h1 className="appFooterCopyright">
                    Please note that using AI is at your own risk.
                </h1>
                <p className="footer-description">
                    This project was created under the "Fighters to High-Tech" initiative by Atidim, in collaboration with CyberPro and the Aman Group.
                </p>
                <div className="footer-logos-container">
                    <img src="/logos/fighters_high_tech.png" alt="Fighters to High-Tech" className="footer-logo" />
                    <img src="/logos/atidim.png" alt="Atidim" className="footer-logo" />
                    <img src="/logos/cyberpro.png" alt="CyberPro" className="footer-logo" />
                    <img src="/logos/aman.png" alt="Aman" className="footer-logo" />
                </div>

            </div>
        </footer>
    );
}