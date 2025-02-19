import React from "react";
import { FaFacebookF, FaXTwitter, FaYoutube, FaLinkedin } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-10 mt-12">
      <div className="container mx-auto px-6">
        {/* Grid Layout for Responsive Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left - Contact Info */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold">Howard University School of Business</h2>
            <p className="mt-2">2600 6th St NW</p>
            <p>Washington, D.C. 20059</p>
            <p>Phone: <a href="tel:2028061500" className="hover:underline">202-806-1500</a></p>
          </div>

          {/* Center - Social Icons */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/HowardHUSB" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF className="text-white text-2xl hover:text-gray-300 transition duration-300" />
              </a>
              <a href="https://x.com/howardhusb" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaXTwitter className="text-white text-2xl hover:text-gray-300 transition duration-300" />
              </a>
              <a href="https://www.youtube.com/channel/UCBKWq7Um5jUyNWluOIpk0vA" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube className="text-white text-2xl hover:text-gray-300 transition duration-300" />
              </a>
              <a href="https://www.linkedin.com/school/howard-university-school-of-business/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin className="text-white text-2xl hover:text-gray-300 transition duration-300" />
              </a>
            </div>
          </div>

          {/* Right - Quick Links */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-gray-300">
              <li><a href="https://www.linkedin.com/school/howard-university-school-of-business/" className="hover:underline">LinkedIn</a></li>
              <li><a href="https://giving.howard.edu/" className="hover:underline">Giving to Howard</a></li>
              <li><a href="https://admission.howard.edu/" className="hover:underline">Admissions</a></li>
              <li><a href="https://www.aacsb.edu/" className="hover:underline">AACSB Accredited</a></li>
              <li><a href="https://howard.edu/accessibility-statement" className="hover:underline">Web Accessibility Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="mt-8 border-t border-blue-800 pt-4 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()} Howard University. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
