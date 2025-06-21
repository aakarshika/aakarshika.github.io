import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          NotAResume
        </h1>
        <button
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          { '☀️'}
        </button>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to NotAResume
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your modern resume builder application.
        </p>
        
        {/* Navigation to 3D Timeline */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-2xl font-bold text-white mb-4">
            🚀 Interactive 3D Skills Timeline
          </h3>
          <p className="text-blue-100 mb-6">
            Explore your career journey through an immersive 3D visualization. 
            See how your skills evolved across different companies and projects.
          </p>
          <Link 
            to="/skills-timeline"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-md"
          >
            View 3D Timeline →
          </Link>
        </div>

        {/* Navigation to Animated Skills Chart */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-4">
            🎯 Animated Skills Chart
          </h3>
          <p className="text-green-100 mb-6">
            Watch your skills merge and evolve with smooth animations. 
            Scroll to see skills combine into categories in real-time.
          </p>
          <Link 
            to="/animated-skills"
            className="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 shadow-md"
          >
            View Animated Chart →
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home; 