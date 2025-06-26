import React from 'react';

const TestimonialsSection = () => {
  return (
    <>
      {/* Project 1 - Title Slide */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="max-w-4xl">
          <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Testimonials
          </h2>
          <p className="text-2xl text-white mb-4">Swipe through my latest work</p>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto"></div>
        </div>
      </div>

      {/* Project 2 */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div>
            <h3 className="text-5xl font-bold mb-6 text-cyan-400">Project One</h3>
            <p className="text-xl text-white mb-6">
              [Detailed description of your first project - the challenge, 
              your approach, technologies used, and the impact.]
            </p>
            <div className="flex space-x-4 mb-6">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Node.js</span>
              <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">MongoDB</span>
            </div>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              View Live Site →
            </a>
          </div>
          <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-500">[Project Screenshot Here]</span>
          </div>
        </div>
      </div>

      {/* Project 3 */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-500">[Project Screenshot Here]</span>
          </div>
          <div>
            <h3 className="text-5xl font-bold mb-6 text-pink-400">Project Two</h3>
            <p className="text-xl text-white mb-6">
              [Description of your second project - highlighting different 
              skills and technologies than the first project.]
            </p>
            <div className="flex space-x-4 mb-6">
              <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Vue.js</span>
              <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Python</span>
              <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">PostgreSQL</span>
            </div>
            <a href="#" className="text-pink-400 hover:text-pink-300 font-semibold">
              View Live Site →
            </a>
          </div>
        </div>
      </div>

      {/* Project 4 */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div>
            <h3 className="text-5xl font-bold mb-6 text-green-400">Project Three</h3>
            <p className="text-xl text-white mb-6">
              [Your third project showcase - maybe a mobile app, 
              AI project, or something completely different.]
            </p>
            <div className="flex space-x-4 mb-6">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">React Native</span>
              <span className="px-3 py-1 bg-orange-600 rounded-full text-sm">Firebase</span>
              <span className="px-3 py-1 bg-teal-600 rounded-full text-sm">TensorFlow</span>
            </div>
            <a href="#" className="text-green-400 hover:text-green-300 font-semibold">
              View Live Site →
            </a>
          </div>
          <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-500">[Project Screenshot Here]</span>
          </div>
        </div>
      </div>
    </>
  );
};
export default TestimonialsSection; 