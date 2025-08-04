'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useAuth } from '../../context/AuthContext';

interface Category {
  _id: string;
  name: string;
  img: string;
  created_time: string;
  updated_time: string;
}

interface TopCategories2Props {
  onCategoryClick?: (categoryName: string) => void;
}

const TopCategories2 = ({ onCategoryClick }: TopCategories2Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiBaseUrl } = useApiConfig();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = user?._id 
          ? `${apiBaseUrl}categories?userId=${user._id}`
          : `${apiBaseUrl}categories`;
        const response = await axios.get(url);
        setCategories(response.data.slice(0, 5));
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [apiBaseUrl, user?._id]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-6">
        {error}
      </div>
    );
  }

  return (
    <section className="bg-white border-y border-gray-200">
      <div className="max-w-6xl mx-auto flex justify-center divide-x divide-gray-200">
        {categories.map((category) => (
          <Link
            key={category._id}
            href="/products"
            className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition"
            onClick={() => onCategoryClick?.(category.name)}
          >
            <div className="relative w-6 h-6 sm:w-8 sm:h-8">
              <Image
                src={category.img}
                alt={category.name}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <span className="text-gray-800 text-sm sm:text-base font-medium">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopCategories2;
