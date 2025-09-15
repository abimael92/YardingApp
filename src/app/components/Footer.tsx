// app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="ri-leaf-line text-2xl text-emerald-500"></span>
              </div>
              <span className="font-poppins text-xl text-emerald-500 font-semibold">AZ Landscapes</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional landscaping and yardwork services across Arizona. 
              Transforming outdoor spaces with expertise and care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <span className="ri-facebook-fill text-xl"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <span className="ri-instagram-fill text-xl"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <span className="ri-twitter-fill text-xl"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <span className="ri-linkedin-fill text-xl"></span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a className="text-gray-400 hover:text-emerald-500 transition-colors" href="#">Lawn Care</a></li>
              <li><a className="text-gray-400 hover:text-emerald-500 transition-colors" href="#">Tree Services</a></li>
              <li><a className="text-gray-400 hover:text-emerald-500 transition-colors" href="#">Landscaping</a></li>
              <li><a className="text-gray-400 hover:text-emerald-500 transition-colors" href="#">Irrigation</a></li>
              <li><a className="text-gray-400 hover:text-emerald-500 transition-colors" href="#">Hardscaping</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Stay updated with landscaping tips and offers.</p>
            <form className="space-y-3">
              <input 
                placeholder="Enter your email" 
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white text-sm"
                type="email" 
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 AZ Landscapes. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a className="text-gray-400 hover:text-emerald-500 text-sm transition-colors" href="#">Privacy Policy</a>
              <a className="text-gray-400 hover:text-emerald-500 text-sm transition-colors" href="#">Terms of Service</a>
              <a className="text-gray-400 hover:text-emerald-500 text-sm transition-colors" href="#">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}