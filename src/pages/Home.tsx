import { Link } from "react-router-dom";

export default function Home() {
  console.log("Home component rendered");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Cerebro Workflow Editor
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Build professional workflows with a powerful visual editor
        </p>
        <div className="space-y-4">
          <Link
            to="/flows"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            View Workflows
          </Link>
          {/* <Link
            to="/flows/demo"
            className='w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center'
          >
            Try Demo Editor
          </Link> */}
        </div>
      </div>
    </div>
  );
}
