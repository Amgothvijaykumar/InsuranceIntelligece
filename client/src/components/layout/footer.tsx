import { Github, MessageCircle, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto w-full max-w-screen-xl p-6 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-primary">
                InsureTech
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              Intelligent insurance solutions powered by AI. Providing personalized policy recommendations for families across India.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">Resources</h2>
              <ul className="text-gray-500 font-medium">
                <li className="mb-2">
                  <a href="/docs" className="hover:underline">Documentation</a>
                </li>
                <li>
                  <a href="/faq" className="hover:underline">FAQs</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">Legal</h2>
              <ul className="text-gray-500 font-medium">
                <li className="mb-2">
                  <a href="/privacy" className="hover:underline">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" className="hover:underline">Terms &amp; Conditions</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">Contact</h2>
              <ul className="text-gray-500 font-medium">
                <li className="mb-2">
                  <a href="mailto:support@insuretech.com" className="hover:underline">support@insuretech.com</a>
                </li>
                <li>
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2025 <a href="/" className="hover:underline">InsureTech</a>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0 space-x-5 rtl:space-x-reverse">
            <a href="#" className="text-gray-500 hover:text-gray-900">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              <MessageCircle className="h-4 w-4" />
              <span className="sr-only">Discord</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}