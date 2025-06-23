import React from 'react';

const ProjectsSection = () => {
  return (
    <>
      {/* Project 1 - Title Slide */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="max-w-4xl">
          <h2 className="text-7xl font-bold pb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Projects
          </h2>
          <p className="text-2xl text-gray-300 mb-4">that I spend late nights on</p>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto"></div>
        </div>
      </div>

      {/* Twirly App */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div>
            <h3 className="text-5xl font-bold mb-6 text-cyan-400">Twirly App</h3>
            <p className="text-xl text-gray-300 mb-6">
              A real-time social comparison platform for mobile and web. Built with live voting system, 
              TikTok-style infinite scroll, and mobile-first UI with smooth animations.
            </p>
            <div className="flex space-x-4 mb-6">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Supabase</span>
              <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">PostgreSQL</span>
              <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">Tailwind</span>
              <span className="px-3 py-1 bg-pink-600 rounded-full text-sm">Framer Motion</span>
            </div>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              View Live Site →
            </a>
          </div>
          <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-500">[Twirly App Screenshot]</span>
          </div>
        </div>
      </div>

      {/* Daywise */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-500">[Daywise App Screenshot]</span>
          </div>
          <div>
            <h3 className="text-5xl font-bold mb-6 text-pink-400">Daywise</h3>
            <p className="text-xl text-gray-300 mb-6">
              An ADHD-friendly To-Do mobile app using LLMs for predictive, personalized tasking. 
              Built with shared business logic for Android/iOS using Kotlin Multiplatform.
            </p>
            <div className="flex space-x-4 mb-6">
              <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Kotlin Multiplatform</span>
              <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Hugging Face</span>
              <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">GPT</span>
              <span className="px-3 py-1 bg-green-600 rounded-full text-sm">ML</span>
            </div>
            <a href="#" className="text-pink-400 hover:text-pink-300 font-semibold">
              View Live Site →
            </a>
          </div>
        </div>
      </div>

      {/* Coder Kids */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div>
            <h3 className="text-5xl font-bold mb-6 text-green-400">Coder Kids ML Platform</h3>
            <p className="text-xl text-gray-300 mb-6">
              Backend API for ML learning platform with drag-and-drop interface. Integrated scikit-learn, 
              Keras, and Caffe libraries for non-technical users to train and visualize ML models.
            </p>
            <div className="flex space-x-4 mb-6">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Django</span>
              <span className="px-3 py-1 bg-orange-600 rounded-full text-sm">PostgreSQL</span>
              <span className="px-3 py-1 bg-teal-600 rounded-full text-sm">Scikit-learn</span>
              <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">D3.js</span>
            </div>
            <a href="#" className="text-green-400 hover:text-green-300 font-semibold">
              View Live Site →
            </a>
          </div>
          <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-500">[Coder Kids Platform Screenshot]</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsSection; 