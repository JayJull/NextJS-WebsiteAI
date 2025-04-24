"use client";

import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { PopoverGroup, Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import LoginPopUp from "./loginpop";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  showLoginModal?: boolean;
  setShowLoginModal?: (show: boolean) => void;
}

const Navbar = ({
  showLoginModal: initialShowLoginModal = false,
  setShowLoginModal: externalSetShowLoginModal,
}: NavbarProps) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setLocalShowLoginModal] = useState(
    initialShowLoginModal
  );
  const [, setIsLoggedIn] = useState(false);

  // Use the external state setter if provided, otherwise use the local one
  const handleSetShowLoginModal = (value: boolean) => {
    if (externalSetShowLoginModal) {
      externalSetShowLoginModal(value);
    } else {
      setLocalShowLoginModal(value);
    }
  };

  useEffect(() => {
    setLocalShowLoginModal(initialShowLoginModal);
  }, [initialShowLoginModal]);

  const handleScroll = () => {
    if (window.scrollY >= 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogin = () => {
    handleSetShowLoginModal(true);
  };

  // The actual showLoginModal value to use in the component
  const currentShowLoginModal = externalSetShowLoginModal
    ? initialShowLoginModal
    : showLoginModal;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 mx-auto flex items-center justify-between p-6 lg:px-8 z-40 ${
          scrolled ? "bg-blue-800 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <Image
              alt="Logo"
              src="/AIfree.webp"
              width={128}
              height={64}
              priority
            />
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-blue-700 transition-colors"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="size-6" aria-hidden="true" />
          </button>
        </div>

        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/page/home"
            className="text-sm font-semibold text-white"
          >
            Home
          </Link>
          <Link
            href="/page/About"
            className="text-sm font-semibold text-white"
          >
            About
          </Link>
        </PopoverGroup>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">        
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogin}
                className="text-white hover:text-blue-200 font-sans text-sm font-semibold px-4 py-2"
              >
                Login
              </button>
            </div>        
        </div>
      </nav>

      {/* Full-height Side Mobile menu */}
      <Transition.Root show={mobileMenu} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setMobileMenu}>
          {/* Background overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          {/* Slide-in panel */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-blue-900 to-blue-700 shadow-xl">
                      <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between">
                          <Link
                            href="/"
                            className="flex"
                            onClick={() => setMobileMenu(false)}
                          >
                            <Image
                              alt="Logo"
                              src="/AIfree.webp"
                              width={100}
                              height={50}
                              priority
                            />
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md text-white hover:text-gray-300 focus:outline-none"
                            onClick={() => setMobileMenu(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-7 w-7" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 divide-y divide-gray-100/20">
                        <div className="flex flex-col space-y-1 px-6 py-8">
                          {/* Menu Items */}
                          <Link
                            href="/home"
                            className="group flex items-center py-4 text-lg font-medium text-white"
                            onClick={() => setMobileMenu(false)}
                          >
                            <span className="relative overflow-hidden">
                              Home
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
                            </span>
                          </Link>
                          <Link
                            href="/pages/About"
                            className="group flex items-center py-4 text-lg font-medium text-white"
                            onClick={() => setMobileMenu(false)}
                          >
                            <span className="relative overflow-hidden">
                              About
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
                            </span>
                          </Link>
                        </div>

                        {/* Account Section */}
                        <div className="px-6 py-10 mt-auto">
                            <button
                              onClick={() => {
                                setMobileMenu(false);
                                handleSetShowLoginModal(true);
                              }}
                              className="flex w-full justify-center items-center bg-white text-blue-900 rounded-full px-6 py-3 text-base font-medium shadow-md hover:bg-gray-100 transition-colors"
                            >
                              Login
                            </button>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Login Modal */}
      {currentShowLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-xl font-semibold">Login</h3>
              <button
                onClick={() => handleSetShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <LoginPopUp
                onClose={() => handleSetShowLoginModal(false)}
                onLoginSuccess={() => {
                  setIsLoggedIn(true);
                  handleSetShowLoginModal(false);

                  // Add redirect after successful login if returnUrl is present
                  const urlParams = new URLSearchParams(window.location.search);
                  const returnUrl = urlParams.get("returnUrl");
                  if (returnUrl) {
                    window.location.href = decodeURIComponent(returnUrl);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
