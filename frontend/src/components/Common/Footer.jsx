import './Common.css';

export default function Footer() {
    return (
        <footer className="appFooter">
            <div className="appFooterContent">
                <p className="footer-ai-note">
                    This app uses AI-generated content. Results may not be accurate — use at your own responsibility.
                </p>
                <p className="footer-description">
                    Created under <strong>לוחמים להייטק</strong> initiative · Atidim × CyberPro × Aman Group
                </p>
                <div className="footer-logos-container">
                    <img src="/warriors.png" alt="Fighters to High-Tech" className="footer-logo" />
                    <img src="/atidim.png" alt="Atidim" className="footer-logo" />
                    <img src="/cyberpro.png" alt="CyberPro" className="footer-logo" />
                    <img src="/aman.png" alt="Aman" className="footer-logo" />
                </div>
            </div>
        </footer>
    );
}