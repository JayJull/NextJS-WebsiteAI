import { Layout } from "@/app/components/dashboard/Layout";
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartLine } from "react-icons/fa";

const DashboardPage = () => {
  return (
    <Layout>
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</h3>
            <FaDollarSign className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,231.89</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">+20.1% from last month</p>
          </div>
        </div>

        {/* Customers Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">New Customers</h3>
            <FaUsers className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+2,350</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">+180.1% from last month</p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</h3>
            <FaShoppingCart className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+12,234</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">+19% from last month</p>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</h3>
            <FaChartLine className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+573</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">+201 since last hour</p>
          </div>
        </div>
      </div>     

      {/* Recent Orders Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Order ID</th>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                <td className="px-6 py-4">#12345</td>
                <td className="px-6 py-4">iPhone 13 Pro</td>
                <td className="px-6 py-4">John Doe</td>
                <td className="px-6 py-4">$999.00</td>
                <td className="px-6 py-4">
                  <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                <td className="px-6 py-4">#12346</td>
                <td className="px-6 py-4">MacBook Pro</td>
                <td className="px-6 py-4">Jane Smith</td>
                <td className="px-6 py-4">$1,299.00</td>
                <td className="px-6 py-4">
                  <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default DashboardPage;