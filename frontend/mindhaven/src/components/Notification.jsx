import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const Notification = ({ notification, onMarkAsRead }) => {
  const [expanded, setExpanded] = useState(false);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const toggleExpansion = () => setExpanded(!expanded);

  const renderContent = () => {
    if (notification.type === 'video_call') {
      const linkStart = notification.content.indexOf('http');
      const linkEnd = notification.content.indexOf(' ', linkStart);
      const link = notification.content.slice(linkStart, linkEnd > -1 ? linkEnd : undefined);
      const textBefore = notification.content.slice(0, linkStart);
      const textAfter = linkEnd > -1 ? notification.content.slice(linkEnd) : '';

      return (
        <>
          {textBefore}
          <Link to={link} className="text-blue-600 hover:text-blue-800">Join Call</Link>
          {textAfter}
        </>
      );
    }
    return expanded ? notification.content : truncateText(notification.content, 48);
  };

  return (
    <li className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
      <div className="px-4 py-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <p className={`text-sm text-gray-800 ${!expanded && 'cursor-pointer'}`} onClick={toggleExpansion}>
              {renderContent()}
            </p>
            {notification.content.length > 48 && (
              <button 
                onClick={toggleExpansion}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
              >
                {expanded ? (
                  <>Show less <ChevronUp size={14} className="ml-1" /></>
                ) : (
                  <>Read more <ChevronDown size={14} className="ml-1" /></>
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>
    </li>
  );
};

export default Notification;