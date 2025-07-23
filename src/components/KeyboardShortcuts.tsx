import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      keys: ['⌘', 'C'],
      description: 'Copy selected nodes',
      category: 'Edit'
    },
    {
      keys: ['⌘', 'V'],
      description: 'Paste copied nodes',
      category: 'Edit'
    },
    {
      keys: ['Shift', 'Click'],
      description: 'Multi-select nodes',
      category: 'Selection'
    },
    {
      keys: ['Double Click'],
      description: 'Edit node parameters',
      category: 'Edit'
    },
    {
      keys: ['Drag'],
      description: 'Move nodes',
      category: 'Navigation'
    },
    {
      keys: ['Mouse Wheel'],
      description: 'Zoom in/out',
      category: 'Navigation'
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        title="Keyboard Shortcuts"
      >
        <Keyboard size={16} />
        <span className="text-sm">Shortcuts</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Keyboard Shortcuts</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{shortcut.description}</span>
            <div className="flex items-center space-x-1">
              {shortcut.keys.map((key, keyIndex) => (
                <React.Fragment key={keyIndex}>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="text-gray-400 text-xs">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Select nodes with Shift+Click, then use ⌘+C to copy and ⌘+V to paste
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
