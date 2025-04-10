import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">InsureTech</span>
            </div>
            <p className="mt-2 text-gray-400">
              Revolutionizing insurance with AI-powered customer prominence detection and personalized government policy recommendations.
            </p>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Insurance</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Health Insurance</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Vehicle Insurance</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Life Insurance</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Property Insurance</a>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">About</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Careers</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Contact</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300">Terms & Conditions</a>
            <a href="#" className="text-gray-400 hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-300">Cookie Policy</a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; 2023 InsureTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
