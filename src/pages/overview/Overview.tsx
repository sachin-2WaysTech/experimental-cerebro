import { useState } from 'react';
import SideBar from "../common/SideBar";
import WorkflowsTab from './WorkflowsTab';
import CredentialsTab from './CredentialsTab';
import ExecutionsTab from './ExecutionsTab';
import * as Icons from 'lucide-react';

type TabType = 'workflows' | 'credentials' | 'executions';

const Overview = () => {
  const [activeTab, setActiveTab] = useState<TabType>('workflows');

  const tabs = [
    {
      id: 'workflows' as TabType,
      label: 'Workflows',
      icon: Icons.Workflow,
      component: WorkflowsTab
    },
    {
      id: 'credentials' as TabType,
      label: 'Credentials',
      icon: Icons.Key,
      component: CredentialsTab
    },
    {
      id: 'executions' as TabType,
      label: 'Executions',
      icon: Icons.Activity,
      component: ExecutionsTab
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || WorkflowsTab;

  return (
    <div className="flex justify-start bg-[#1F1F1F] min-h-screen">
      <div>
        <SideBar />
      </div>
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
          <p className="text-gray-400">Manage your workflows, credentials, and executions</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-[#2a2a2a] p-1 rounded-lg w-fit">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#333]'
                    }`}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default Overview;