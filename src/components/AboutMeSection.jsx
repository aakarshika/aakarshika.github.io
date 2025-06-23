import React from 'react';

const AboutMeSection = () => {
  return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-20">
          <div className="about-section container mx-auto px-6">
            <h2 className="text-6xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About Me
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                I'm building intelligent, cross-platform apps. 
                Trying to combine real-time systems, elegant UX, and AI-driven features, hoping for clean code and bold experiences.
                </p>
                <p className="text-lg text-gray-400">
                Engineer, system thinker, and AI whisperer.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8 h-80 flex items-center justify-center">
                <span className="text-gray-500 text-lg">[Your Photo/Avatar Here]</span>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 pt-40">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Frontend</h3>
                <p className="text-gray-400">React, Kotlin, Angular</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Backend</h3>
                <p className="text-gray-400">Node.js, Python, APIs, Java</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Database</h3>
                <p className="text-gray-400">MongoDB, PostgreSQL, MySQL</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Cloud</h3>
                <p className="text-gray-400">AWS, Vercel, Supabase</p>
              </div>
            </div>
          </div>
        </div>
  );
};

export default AboutMeSection; 