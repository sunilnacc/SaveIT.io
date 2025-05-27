'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl items-center space-x-2">
      <Input
        type="text"
        placeholder="Search for products like 'Aata', 'Milk', 'Bread'..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-base"
        disabled={isLoading}
      />
      <Button type="submit" variant="default" size="lg" disabled={isLoading}>
        <Search className="mr-2 h-5 w-5" />
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
