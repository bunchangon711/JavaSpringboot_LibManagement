import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="library-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Library Hours Section */}
          <div className="footer-section hours-section">
            <h3>📅 Library Hours</h3>
            <div className="hours-grid">
              <div className="hours-item">
                <span className="day">Monday - Thursday</span>
                <span className="time">8:00 AM - 9:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Friday</span>
                <span className="time">8:00 AM - 6:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Saturday</span>
                <span className="time">9:00 AM - 5:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Sunday</span>
                <span className="time">12:00 PM - 5:00 PM</span>
              </div>
            </div>
            <div className="holiday-notice">
              <small>📌 Holiday hours may vary. Please check our calendar for updates.</small>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="footer-section contact-section">
            <h3>📞 Contact Information</h3>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div className="contact-info">
                  <strong>Address</strong>
                  <span>123 Library Street<br />Knowledge City, KC 12345</span>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-info">
                  <strong>Phone</strong>
                  <span>(555) 123-BOOK<br />(555) 123-2665</span>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-info">
                  <strong>Email</strong>
                  <span>info@citylibrary.org<br />reference@citylibrary.org</span>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <div className="contact-info">
                  <strong>Website</strong>
                  <span>www.citylibrary.org</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section links-section">
            <h3>🔗 Quick Links</h3>
            <div className="quick-links">
              <div className="link-group">
                <h4>Services</h4>
                <ul>
                  <li><a href="#book-catalog">Book Catalog</a></li>
                  <li><a href="#digital-books">Digital Books</a></li>
                  <li><a href="#research-help">Research Help</a></li>
                  <li><a href="#community-programs">Programs</a></li>
                </ul>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <ul>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#policies">Library Policies</a></li>
                  <li><a href="#accessibility">Accessibility</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Emergency & Special Services */}
          <div className="footer-section services-section">
            <h3>🚨 Important Services</h3>
            <div className="services-info">
              <div className="service-item">
                <span className="service-icon">🆘</span>
                <div className="service-details">
                  <strong>Emergency Contact</strong>
                  <span>Campus Safety: (555) 911-HELP</span>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">♿</span>
                <div className="service-details">
                  <strong>Accessibility Services</strong>
                  <span>ADA compliant facilities<br />Special assistance available</span>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">🔄</span>
                <div className="service-details">
                  <strong>Book Return</strong>
                  <span>24/7 Drop Box Available<br />Located at main entrance</span>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">💻</span>
                <div className="service-details">
                  <strong>WiFi & Computers</strong>
                  <span>Free WiFi: LibraryGuest<br />Public computers available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {new Date().getFullYear()} City Library Management System. All rights reserved.</p>
            </div>
            <div className="social-links">
              <span>Follow us:</span>
              <div className="social-icons">
                <a href="#facebook" aria-label="Facebook">📘</a>
                <a href="#twitter" aria-label="Twitter">🐦</a>
                <a href="#instagram" aria-label="Instagram">📷</a>
                <a href="#linkedin" aria-label="LinkedIn">💼</a>
              </div>
            </div>
            <div className="footer-policies">
              <a href="#privacy">Privacy Policy</a>
              <span>|</span>
              <a href="#terms">Terms of Service</a>
              <span>|</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
