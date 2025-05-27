import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-primary-600">
              When To Visit
            </Link>
            <p className="text-gray-600 mt-2">
              A smart place-crowd tracker to help you avoid crowds.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Categories</h3>
              <ul className="space-y-2">
                <li className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                  Health
                </li>
                <li className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                  Food
                </li>
                <li className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                  Fitness
                </li>
                <li className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                  Shopping
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} When To Visit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
