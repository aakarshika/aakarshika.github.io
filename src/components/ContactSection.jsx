import React from 'react';

const ContactSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-900 to-gray-900 py-20 flex items-center">
          <div className="contact-section container mx-auto px-6 text-center">
            <h2 className="text-6xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let's Work Together
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Ready to give me a chat, a challenge or money?
            </p>
            <div className="flex justify-center space-x-8">
              <a href="mailto:your@email.com" className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                Get In Touch
              </a>
              <a href="#" className="border border-gray-600 px-8 py-4 rounded-full text-gray-300 hover:border-white hover:text-white transition-all duration-300">
                View Resume
              </a>
            </div>
          </div>
        </div>
  );
};

export default ContactSection; 