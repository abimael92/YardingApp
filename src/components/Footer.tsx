import { motion } from "framer-motion"
import { RiLeafLine, RiFacebookFill, RiInstagramFill, RiTwitterFill, RiLinkedinFill, RiTwitterXFill } from "react-icons/ri"

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Social */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center text-emerald-500">
                <RiLeafLine className="w-6 h-6" />
              </div>
              <span className="font-pacifico text-xl text-emerald-500">Chochue Landscaping</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional landscaping and yardwork services across Arizona. Transforming outdoor spaces with expertise and care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <RiFacebookFill className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <RiInstagramFill className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <RiTwitterXFill className="w-6 h-6" />
              </a>
              {/* <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <RiLinkedinFill className="w-6 h-6" />
              </a> */}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {["Lawn Care", "Tree Services", "Landscaping", "Irrigation", "Hardscaping"].map((service) => (
                <li key={service}>
                  <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">{service}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter wiv-nqxD54Mc73V*/}
   <div>
  <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
  <p className="text-gray-400 mb-4">Stay updated with landscaping tips and offers.</p>
  
        <form
          action="https://formspree.io/f/mldwkber" // your Formspree endpoint
          method="POST"
          className="space-y-3"
        >
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white text-sm"
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Chochue Landscaping. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service", "Contact"].map((link) => (
                <a key={link} href="#" className="text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
