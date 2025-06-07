import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Branding */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Smart Cleaning</h2>
          <p className="text-sm">Efficient cleaning management for a cleaner tomorrow.</p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/report" className="hover:text-white">Report Waste</a></li>
            <li><a href="/dashboard" className="hover:text-white">Staff Dashboard</a></li>
            <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact & Socials */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Contact</h3>
          <p className="text-sm">Email: support@smartcleaning.com</p>
          <p className="text-sm">Phone: +91-98765-43210</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-white"><FaFacebookF /></a>
            <a href="#" className="hover:text-white"><FaTwitter /></a>
            <a href="#" className="hover:text-white"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 mt-8">
        &copy; {new Date().getFullYear()} Smart Cleaning Management System. All rights reserved.
      </div>
    </footer>
  );
}
