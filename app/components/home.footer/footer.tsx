"use client"
import Image from "next/image";
import "aos/dist/aos.css";
import { useEffect } from "react";

const Footer = () => {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        const AOS = require('aos');
        AOS.init({
            once: true,
            duration: 800,
        });
    }, []);

    return (
      <footer 
        className="main-footer style-three bg-cover bg-gradient-to-br from-blue-600 to-blue-900" 
        style={{ backgroundImage: "url(/3.png)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-52 sm:py-16" data-aos='fade-up' data-aos-delay="500" data-aos-once="true">
          <div className="text-center mb-10 sm:mb-16 mt-8 sm:mt-20">
            <h2 className="text-xl sm:text-2xl font-semibold text-white font-sans">Subscribe Our Newsletter</h2>
            <p className="text-xs sm:text-sm text-gray-200 mb-4 sm:mb-8">We don't send spam so don't worry.</p>
            
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4">
              <div className="relative flex flex-col sm:flex-row items-center">
                <input
                  type="email"
                  placeholder="Your e-mail"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3 sm:mb-0"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:absolute sm:right-2 px-6 sm:px-8 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-10">
            {/* Company Info */}
            <div className="text-center sm:text-left">
              <div className="mb-6 flex justify-center sm:justify-start">
                <Image
                  width={154}
                  height={50}
                  src="/AIfree.webp"
                  alt="AIfree Logo"
                />
              </div>
              <div className="text-white space-y-4">
                <div>
                  <p className="text-gray-300">Call us</p>
                  <p className="text-lg">+62 851-5661-9369</p>
                </div>
                <div>
                  <p className="text-sm">Jl. Tegalsari, Krajan 2 RT 4 RW 1 Tegalsari, Banyuwangi 68485</p>                  
                  <a href="mailto:support@bigkreatif.com" className="hover:text-gray-300 transition-colors text-sm">
                    support@bigkreatif.com
                  </a>
                </div>
              </div>
            </div>

            {/* For Candidates */}
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">For Users</h3>
              <ul className="text-white space-y-2">
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">Browse AI Solutions</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">Explore AI Categories</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">My AI Bookmarks</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">AI Alerts</a></li>                
              </ul>
            </div>

            {/* For Employers */}
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">For Developers/Businesses</h3>
              <ul className="text-white space-y-2">
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">Browse AI Talent</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">AI Developer Dashboard</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">Add AI</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors text-sm">AI Service Packages</a></li>
              </ul>
            </div>

            {/* Mobile Apps */}
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Mobile Apps</h3>
              <p className="text-xs sm:text-sm text-white mb-4">Click and Get started in seconds</p>
              <div className="space-y-3 flex flex-col items-center sm:items-start">
                <a href="#" className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors w-full max-w-xs">
                  <span className="text-2xl text-white">
                    <i className="fab fa-apple"></i>
                  </span>
                  <div className="text-white">
                    <p className="text-xs text-gray-400">Download on the</p>
                    <p className="font-semibold">Apple Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors w-full max-w-xs">
                  <span className="text-2xl text-white">
                    <i className="fab fa-google-play"></i>
                  </span>
                  <div className="text-white">
                    <p className="text-xs text-gray-400">Get it on</p>
                    <p className="font-semibold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-white text-center md:text-left">
                © {new Date().getFullYear()} Develop by{' '}
                <a href="https://www.instagram.com/bigkreatif/" className="text-gray-300 hover:text-white transition-colors">
                  bigkreatif
                </a>
                . All Right Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>    
    )
}

export default Footer