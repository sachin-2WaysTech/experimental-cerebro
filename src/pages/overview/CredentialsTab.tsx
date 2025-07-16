import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import Button from '@/components/Button';

interface Credential {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialsTab: React.FC = () => {
  const [credentials] = useState<Credential[]>([]); // This will be connected to a store later
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCredential, setNewCredential] = useState({
    name: '',
    type: '',
    description: ''
  });

  const credentialTypes = [
    { value: 'http', label: 'HTTP Authentication', icon: Icons.Globe },
    { value: 'database', label: 'Database', icon: Icons.Database },
    { value: 'api_key', label: 'API Key', icon: Icons.Key },
    { value: 'oauth', label: 'OAuth', icon: Icons.Shield },
    { value: 'smtp', label: 'SMTP', icon: Icons.Mail },
    { value: 'ssh', label: 'SSH', icon: Icons.Terminal },
  ];

  const handleCreateCredential = () => {
    if (newCredential.name.trim() && newCredential.type) {
      // TODO: Implement credential creation logic
      console.log('Creating credential:', newCredential);
      setShowCreateModal(false);
      setNewCredential({ name: '', type: '', description: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Credentials</h2>
          <p className="text-gray-400 mt-1">Manage your authentication credentials securely</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Icons.Plus size={20} />
          New Credential
        </Button>
      </div>

      {/* Credentials List */}
      {credentials.length > 0 ? (
        <div className="space-y-4">
          {credentials.map((credential) => (
            <div
              key={credential.id}
              className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 hover:bg-[#333] transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Icons.Key size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{credential.name}</h3>
                    <p className="text-gray-400 text-sm">{credential.type}</p>
                    {credential.description && (
                      <p className="text-gray-500 text-sm mt-1">{credential.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-white p-2">
                    <Icons.Edit2 size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-red-400 p-2">
                    <Icons.Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span>Created {new Date(credential.createdAt).toLocaleDateString()}</span>
                <span>Updated {new Date(credential.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icons.Key size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No credentials yet</h3>
          <p className="text-gray-400 mb-6">Add credentials to connect your workflows to external services</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Add Your First Credential
          </Button>
        </div>
      )}

      {/* Create Credential Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Credential</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Credential Name
                </label>
                <input
                  type="text"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter credential name..."
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Credential Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {credentialTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewCredential(prev => ({ ...prev, type: type.value }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${newCredential.type === type.value
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-gray-600 bg-[#2a2a2a] text-gray-300 hover:bg-[#333]'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent size={16} />
                          <span className="text-sm">{type.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newCredential.description}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCredential({ name: '', type: '', description: '' });
                  }}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCredential}
                  disabled={!newCredential.name.trim() || !newCredential.type}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                >
                  Add Credential
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsTab;
