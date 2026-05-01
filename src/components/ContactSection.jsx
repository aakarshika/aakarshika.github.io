import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useSectionScrollProgress } from '../hooks/useSectionScrollProgress';

const ContactSection = React.memo(() => {

  const { sectionRef } = useSectionScrollProgress();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  console.log("ContactSection");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setSubmitStatus(null); // Reset status when opening form
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({ name: '', email: '', message: '' });
    setSubmitStatus(null);
  };

  const handleOpenResume = () => {
    window.open(`${window.location.origin}${window.location.pathname}#/custom-resume`, '_blank', 'noopener,noreferrer');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Insert the contact message into Supabase
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            message: formData.message.trim()
          }
        ]);

      if (error) {
        console.error('Error submitting form:', error);
        setSubmitStatus('error');
        throw error;
      }

      // console.log('Contact message saved successfully:', data);
      setSubmitStatus('success');
      
      // Clear form and close after a short delay
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setIsFormOpen(false);
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={sectionRef} className="min-h-screen bg-gradient-to-b from-blue-900 to-black py-14 sm:py-20 flex items-center">
      <div className="contact-section container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-10 sm:mb-12 py-6 sm:py-10 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
           Ready to give me a call,<br></br> a challenge or money?
        </h2>
        
        {!isFormOpen ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
            <button 
              onClick={handleOpenForm}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Let's Work Together
            </button>
            <button 
              onClick={handleOpenResume}
              className="border border-gray-600 px-8 py-4 rounded-full text-white hover:border-white hover:text-white transition-all duration-300"
            >
              View Resume
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-left sm:text-center">
            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-900 border border-green-500 rounded-lg text-green-300">
                Thank you {formData.name}! Your message is sent.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg text-red-300">
                Sorry, there was an error sending your message. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  placeholder="Your name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              {/* email input */}
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  placeholder="Email"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                  placeholder="Message..."
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-6 py-3 border border-gray-600 rounded-lg text-white hover:border-white hover:text-white transition-all duration-300 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.message.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection; 