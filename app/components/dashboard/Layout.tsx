"use client";

import React, { useState } from "react";
import { NavbarDash } from "./Navbar/NavbarDash";
import { SidebarDash } from "./Sidebar/SidebarDash";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`${darkMode && "dark"}`}>
      <NavbarDash
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        toggleSidebar={toggleSidebar}
      />
      <SidebarDash isSidebarOpen={isSidebarOpen} />
      <main className="p-4 sm:ml-64 pt-20">
        {children}
      </main>
    </div>
  );
};
