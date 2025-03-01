import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || '');

  // Ensure there's an active tab if the defaultTab is not in the items
  React.useEffect(() => {
    if (!items.some((item) => item.id === activeTab)) {
      setActiveTab(items[0]?.id || '');
    }
  }, [items, activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const commonTabClasses = 'flex items-center px-3 py-2 font-medium text-sm transition-colors';

  // Style variants
  const tabStyles = {
    underline: {
      list: 'flex border-b border-gray-200',
      tab: {
        active: `${commonTabClasses} border-b-2 border-primary-500 text-primary-600`,
        inactive: `${commonTabClasses} text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300`,
        disabled: `${commonTabClasses} text-gray-300 cursor-not-allowed`,
      },
    },
    pills: {
      list: 'flex space-x-2',
      tab: {
        active: `${commonTabClasses} bg-primary-100 text-primary-700 rounded-md`,
        inactive: `${commonTabClasses} text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md`,
        disabled: `${commonTabClasses} text-gray-300 cursor-not-allowed rounded-md`,
      },
    },
    enclosed: {
      list: 'flex',
      tab: {
        active: `${commonTabClasses} bg-white border-t border-l border-r border-gray-200 rounded-t-md -mb-px`,
        inactive: `${commonTabClasses} text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200 rounded-t-md`,
        disabled: `${commonTabClasses} text-gray-300 cursor-not-allowed`,
      },
    },
  };

  return (
    <div className={className}>
      <div className={tabStyles[variant].list} role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            className={
              item.disabled
                ? tabStyles[variant].tab.disabled
                : activeTab === item.id
                ? tabStyles[variant].tab.active
                : tabStyles[variant].tab.inactive
            }
            onClick={() => !item.disabled && handleTabClick(item.id)}
            disabled={item.disabled}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`panel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            className={activeTab === item.id ? 'block' : 'hidden'}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};