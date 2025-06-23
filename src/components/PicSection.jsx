import React, { useState, useEffect } from 'react';
import TandLPictureSection from './TandLPictureSection';

import { supabase } from '../../supabase';

const PicSection = ({progress, picturesList}) => {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-10">
    <div className="custom-section container mx-auto px-6 text-center">
      <h2 className="text-6xl font-bold mb-16 bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
        Take a picture, leave a picture
      </h2>
    </div>
      <div className="tlan">
      <TandLPictureSection picturesList={picturesList} progress={progress} />
      </div>
  </div>
  );
};

export default PicSection; 