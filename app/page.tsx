import Link from 'next/link';
import Image from 'next/image';

const MenuIcon = ({ path, className = "w-6 h-6" }: { path: string, className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={path}></path>
  </svg>
);

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* 1. Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
        <div className="mb-8">
          <MenuIcon path="M10 20l-6-6 6-6M4 14h14" className="w-8 h-8 text-green-700 inline-block mr-2" />
          <span className="text-2xl font-bold text-green-700">wise</span>
        </div>

        <nav className="space-y-1">
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon path="M3 12h18" />
            <span>Home</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon path="M3 10h18M7 15h1m4 0h1m-7-4h12a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v5a3 3 0 003 3z" />
            <span>Cards</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon path="M15 15l-2 5L9 9l11 4-5 2z" />
            <span>Transactions</span>
          </div>
          <div className="flex items-center justify-between p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <MenuIcon path="M17 9l4 4m0 0l-4 4m4-4H3" />
              <span>Payments</span>
            </div>
            <MenuIcon path="M19 9l-7 7-7-7" className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon path="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" />
            <span>Team</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon path="M18 10a8 8 0 10-16 0 8 8 0 0016 0zm-8 4v-4m0 0h4m-4 0v4m0-4h-4" />
            <span>Recipients</span>
          </div>
          <div className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon path="M9 19V6l12-3v13M9 19c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3-3.134 3-7 3zm0 0v-4" />
            <span>Insights</span>
          </div>
          <Link
            href="/plans"
            className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer font-bold"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <Image
                  src="/exchange.png"
                  alt="Currency Exchange Icon"
                  width={24}
                  height={24}
                />
              </div>
            <span>Convert Wisely</span>
          </Link>
        </nav>
      </aside>

      {/* 2. Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Top Bar / Profile Placeholder */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center space-x-3 p-2 bg-white rounded-full shadow-md border border-gray-200">
            <span className="text-sm font-semibold text-gray-800">Wise Business</span>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">N</div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700">Total balance</h2>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-4xl font-extrabold text-gray-900">35,531.22 GBP</p>
            <MenuIcon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex space-x-3 mt-4">
            <button className="px-5 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600">Send</button>
            <button className="px-5 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300">Add money</button>
            <button className="px-5 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 flex items-center">
              Get paid
              <MenuIcon path="M19 9l-7 7-7-7" className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Main Accounts & Payroll Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Main Account */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Accounts</h3>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">UK</div>
                <div className="text-gray-900">British Pound (GBP)</div>
              </div>
              <div className="text-right">
                <p className="font-semibold">23,152.00 GBP</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs">US</div>
                <div className="text-gray-900">US Dollar (USD)</div>
              </div>
              <div className="text-right">
                <p className="font-semibold">5,239.00 USD</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">AU</div>
                <div className="text-gray-900">Australian Dollar (AUD)</div>
              </div>
              <div className="text-right">
                <p className="font-semibold">1,200.00 AUD</p>
              </div>
            </div>

            <div className="mt-4">
              <button className="text-blue-600 font-medium text-sm hover:underline">Account details</button>
            </div>
          </div>

          {/* Payroll Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll</h3>
            <div className="flex items-center space-x-3 py-3">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">UK</div>
              <div className="text-gray-900">British Pound</div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full text-sm hover:bg-gray-300">Set up payroll</button>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Transactions</h3>
            <a href="#" className="text-blue-600 font-medium hover:underline">See all</a>
          </div>

          {/* Transaction Item 1 */}
          <div className="flex justify-between items-center py-4 border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <MenuIcon path="M8 7l4-4m0 0l4 4m-4-4v16" className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Vendor Design</p>
                <p className="text-sm text-gray-500">By Jimmy - Sending</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">250.21 GBP</p>
          </div>

          {/* Transaction Item 2 */}
          <div className="flex justify-between items-center py-4 border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <MenuIcon path="M16 17l-4 4m0 0l-4-4m4 4V3" className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Alex Main</p>
                <p className="text-sm text-gray-500">Received</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">8,000.00 GBP</p>
          </div>

          {/* Transaction Item 3 */}
          <div className="flex justify-between items-center py-4 border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <MenuIcon path="M8 7l4-4m0 0l4 4m-4-4v16" className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Software Subscription</p>
                <p className="text-sm text-gray-500">USD Account - Debit</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">59.99 USD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
