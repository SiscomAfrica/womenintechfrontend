import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserMultiSelectProps {
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  users: User[];
  placeholder?: string;
}

export const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
  selectedUserIds,
  onSelectionChange,
  users,
  placeholder = "Select users..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const removeUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedUserIds.filter(id => id !== userId));
  };

  const selectAll = () => {
    onSelectionChange(users.map(u => u.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Users Display */}
      <div 
        className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {selectedUsers.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            selectedUsers.map(user => (
              <div
                key={user.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
              >
                <span className="max-w-[150px] truncate">{user.name}</span>
                <button
                  onClick={(e) => removeUser(user.id, e)}
                  className="hover:bg-purple-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
          <ChevronDown 
            className={`h-4 w-4 ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[300px] flex flex-col">
          {/* Search Bar */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 p-2 border-b bg-gray-50">
            <button
              onClick={selectAll}
              className="flex-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Clear All
            </button>
          </div>

          {/* User List */}
          <div className="overflow-y-auto flex-1">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedUserIds.includes(user.id) ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Count */}
          <div className="p-2 border-t bg-gray-50 text-xs text-gray-600 text-center">
            {selectedUsers.length} of {users.length} users selected
          </div>
        </div>
      )}
    </div>
  );
};
