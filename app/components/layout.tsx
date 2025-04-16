"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./home.navbar/navbar";
import { useSearchParams } from "next/navigation";
import Footer from "./home.footer/footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const loginModal = searchParams.get('loginModal');
    if (loginModal === 'true') {
      setShowLoginModal(true);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="absolute top-0 left-0 right-0 w-full h-full z-0"
        style={{
          backgroundImage: "url('/2 copy.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        }}
      />

      {/* Content Container */}
      <div className="relative z-auto flex flex-col min-h-screen">
        <Navbar 
          showLoginModal={showLoginModal} 
          setShowLoginModal={setShowLoginModal} 
        />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer/>
      </div>
    </div>
  );
};