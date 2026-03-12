import React from 'react';

function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section about">
                    <h3 className="footer-logo">🌴 <span>Cồn Sơn Go Quest</span></h3>
                    <p className="footer-description">
                        Khám phá vẻ đẹp và trải nghiệm du lịch cộng đồng độc đáo tại Cồn Sơn, Cần Thơ.
                    </p>
                </div>

                <div className="footer-section contact">
                    <h4 className="footer-title">Liên hệ</h4>
                    <ul className="contact-info">
                        <li>📍 <span>Bình Thủy, Cần Thơ, Việt Nam</span></li>
                        <li>📞 <span>0999999999</span></li>
                        <li>✉️ <span>ConSonGoQuest@gmail.com</span></li>
                    </ul>
                </div>

                <div className="footer-section maps">
                    <h4 className="footer-title">Vị trí</h4>
                    <div className="footer-map-container">
                        <iframe
                            title="Cồn Sơn Map"
                            src="https://maps.google.com/maps?q=Cồn%20Sơn&t=&z=14&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="150"
                            style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Cồn Sơn Go Quest</p>
            </div>
        </footer>
    );
}

export default Footer;
