"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaPhone, FaSearch } from "react-icons/fa";
import Fuse from 'fuse.js';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useAuth } from '../../context/AuthContext';

interface Category {
  _id: string;
  name: string;
  img: string;
}

interface Product {
  name: string;
  price: number;
  images: string[];
  showProduct: string;
  normalizedName: string;
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const Navbar7 = ({ phoneNumber = "+1987654321" }: { phoneNumber?: string }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(true);

  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [fuse, setFuse] = useState<Fuse<Product> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const { apiBaseUrl } = useApiConfig();
  const { user } = useAuth();
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const url = user?._id 
        ? `${apiBaseUrl}categories?userId=${user._id}`
        : `${apiBaseUrl}categories`;
      const response = await fetch(url);
      if (response.ok) {
        const data: Category[] = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [apiBaseUrl, user?._id]);

  const fetchLogo = useCallback(async () => {
    try {
      const url = user?._id 
        ? `${apiBaseUrl}getmedia?userId=${user._id}`
        : `${apiBaseUrl}getmedia`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.logo) {
        setLogoUrl(data.logo);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    } finally {
      setLoadingLogo(false);
    }
  }, [apiBaseUrl, user?._id]);

  const fetchProducts = useCallback(async () => {
    try {
      const url = user?._id 
        ? `${apiBaseUrl}products?userId=${user._id}`
        : `${apiBaseUrl}products`;
      const response = await fetch(url);
      const data: Product[] = await response.json();

      const normalizedProducts = data.map(product => ({
        ...product,
        normalizedName: normalizeString(product.name)
      })).filter(product => product.showProduct === 'On');

      const fuseInstance = new Fuse(normalizedProducts, {
        keys: ['normalizedName'],
        threshold: 0.2,
        distance: 200,
        minMatchCharLength: 2,
        shouldSort: true
      });

      setFuse(fuseInstance);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [apiBaseUrl, user?._id]);

  const handleResize = useCallback(() => {}, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarOpen(false);
    }
    if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    handleResize();
    fetchCategories();
    fetchLogo();
    fetchProducts();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleResize, fetchCategories, fetchLogo, fetchProducts, handleClickOutside]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() && fuse) {
      const normalizedQuery = normalizeString(value);
      const fuzzyResults = fuse.search(normalizedQuery);
      const filteredSuggestions = fuzzyResults.map(result => result.item);
      setSuggestions(filteredSuggestions);
      router.push(`/products?q=${encodeURIComponent(value.trim())}`);
    } else {
      setSuggestions([]);
      router.push(`/products`);
    }
  }, [fuse, router]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      router.push(`/products?q=${encodeURIComponent(query)}`);
      setSuggestions([]);
    }
  }, [query, router]);

  const handleSuggestionClick = useCallback((suggestion: Product) => {
    const firstTwoWords = suggestion.name.split(' ').slice(0, 2).join(' ');
    const encodedQuery = encodeURIComponent(firstTwoWords);
    setQuery(firstTwoWords);
    setSuggestions([]);
    router.push(`/products?q=${encodedQuery}`);
  }, [router]);

  const handleSearchButtonClick = useCallback(() => {
    router.push(`/products?q=${encodeURIComponent(query)}`);
    setSuggestions([]);
  }, [query, router]);

  return (
    <header className="bg-gradient-to-r from-gray-50 to-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 group">
          {loadingLogo ? (
            <div className="w-28 h-9 bg-gray-200 animate-pulse rounded-md" />
          ) : logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo"
              width={120}
              height={48}
              className="h-9 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              priority
            />
          ) : null}
        </Link>

        {/* Desktop Search & Contact */}
        <div className="hidden lg:flex flex-grow items-center justify-end gap-8">
          {/* Search Bar */}
          <div className="relative w-full max-w-md" ref={searchWrapperRef}>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-base placeholder-gray-400 rounded-l-lg"
                placeholder="Search products..."
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
              />
              <button onClick={handleSearchButtonClick} className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors duration-200">
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white border border-gray-200 mt-2 shadow-xl rounded-lg z-20 max-h-72 overflow-y-auto animate-fadeIn">
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Image
                        src={suggestion.images[0]}
                        alt={suggestion.name}
                        width={40}
                        height={40}
                        className="object-cover rounded-md border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{suggestion.name}</p>
                        <p className="text-xs text-gray-600">৳{suggestion.price} BDT</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact Phone */}
          <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
            <FaPhone className="text-base" />
            <span>{phoneNumber}</span>
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden flex items-center gap-4">
          {/* Mobile Search Icon */}
          <button onClick={() => router.push(`/products?q=${encodeURIComponent(query)}`)} className="p-2 text-gray-700 hover:text-blue-500 transition-colors">
            <FaSearch className="w-5 h-5" />
          </button>
          
          {/* Mobile Hamburger Menu */}
          <button onClick={toggleSidebar} className="p-2 text-gray-700 hover:text-blue-500 transition-colors">
            {isSidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={toggleSidebar} />
      )}

      {/* Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-white shadow-2xl transform transition-all duration-300 z-50 border-l border-gray-200 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-blue-500 text-white">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={toggleSidebar} className="text-white text-2xl font-bold">×</button>
        </div>

        {/* Mobile Categories */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 block rounded-full" />
            Categories
          </h3>
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => { router.push(`/category/${cat._id}`); toggleSidebar(); }}>
                  <Image 
                    src={cat.img && cat.img.trim() !== '' ? cat.img : '/placeholder.png'} 
                    alt={cat.name} 
                    width={28} 
                    height={28} 
                    className="object-cover rounded-full border border-gray-200" 
                  />
                  <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">No categories available</div>
          )}
        </div>

        {/* Mobile Contact */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 block rounded-full" />
            Contact
          </h3>
          <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 text-blue-500 hover:underline">
            <FaPhone className="text-lg" />
            <span className="font-medium">{phoneNumber}</span>
          </a>
        </div>
      </aside>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </header>
  );
};

export default Navbar7;
