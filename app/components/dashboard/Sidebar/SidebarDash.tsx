import React from 'react';
import { FaChartBar, FaListAlt } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import Link from 'next/link';
import { logout } from '@/app/api/login/route'; // Import the logout function from your server actions

export const SidebarDash = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  // Handle sign out click
  const handleSignOut = async () => {
    try {
      await logout();
      // The logout function already handles the redirect to home page
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback redirect if the server action fails
      window.location.href = '/';
    }
  };

  return (
    <aside className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700 transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full px-3 pb-4 overflow-y-auto flex flex-col">
            {/* Bagian Menu Utama */}
            <ul className="space-y-2 font-medium flex-grow">
                <li>
                    <Link href="/page/dashboard">
                        <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 hover:bg-gray-100">
                            <FaChartBar className="mr-3" />
                            <span>Dashboard</span>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link href="/page/dashboard/Manage">
                        <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 hover:bg-gray-100">
                            <FaListAlt className="mr-3" />
                            <span>Manage AI</span>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link href="/page/dashboard/addUser">
                        <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 hover:bg-gray-100">
                            <FaListAlt className="mr-3" />
                            <span>Add User</span>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link href="/page/dashboard/logActivity">
                        <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 hover:bg-gray-100">
                            <FaListAlt className="mr-3" />
                            <span>Log Activity</span>
                        </div>
                    </Link>
                </li>
            </ul>

            <div className="mt-auto">
                {/* Change from Link to button with onClick handler */}
                <button 
                    onClick={handleSignOut}
                    className="w-full text-left"
                >
                    <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 hover:bg-gray-100">
                        <IoIosLogOut className="mr-3" />
                        <span>Sign Out</span>
                    </div>
                </button>
            </div>
        </div>
    </aside>
  );
};