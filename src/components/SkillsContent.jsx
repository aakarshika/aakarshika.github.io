import React from 'react';

const SkillsContent = () => {
  return (
    <>
      {/* Skills Title Slide */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="max-w-4xl">
          <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Skills
          </h2>
          <p className="text-2xl text-gray-300 mb-4">My technical expertise</p>
          <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto"></div>
        </div>
      </div>

      {/* Frontend Skills */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="max-w-6xl">
          <h3 className="text-5xl font-bold mb-8 text-center text-cyan-400">Frontend Development</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚛️</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">React</h4>
              <p className="text-gray-400">Advanced</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Vue.js</h4>
              <p className="text-gray-400">Intermediate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🅰️</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Angular</h4>
              <p className="text-gray-400">Intermediate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">CSS/SCSS</h4>
              <p className="text-gray-400">Advanced</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Skills */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="max-w-6xl">
          <h3 className="text-5xl font-bold mb-8 text-center text-purple-400">Backend Development</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Node.js</h4>
              <p className="text-gray-400">Advanced</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🐍</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Python</h4>
              <p className="text-gray-400">Intermediate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Firebase</h4>
              <p className="text-gray-400">Advanced</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🗄️</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Databases</h4>
              <p className="text-gray-400">Intermediate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools & Others */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="max-w-6xl">
          <h3 className="text-5xl font-bold mb-8 text-center text-pink-400">Tools & Others</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Git</h4>
              <p className="text-gray-400">Advanced</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Figma</h4>
              <p className="text-gray-400">Intermediate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Docker</h4>
              <p className="text-gray-400">Basic</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">☁️</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">AWS</h4>
              <p className="text-gray-400">Basic</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillsContent; 