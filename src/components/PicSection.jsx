import React, { useState, useEffect } from 'react';
import TandLPictureSection from './TandLPictureSection';

import { supabase } from '../../supabase';

const PicSection = ({progress, pictures, onCapture, currentFingerprint, onDelete}) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 ">
    
      <div className="absolute top-0 left-0 w-full h-full tlan">
      <TandLPictureSection 
        pictures={pictures} 
        progress={progress} 
        onCapture={onCapture}
        currentFingerprint={currentFingerprint}
        onDelete={onDelete}
      />
      </div>
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 text-center">
        <div className=" px-6 py-2 rounded-lg mb-4">
          <h2 className="text-6xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
            If you want to, 
          </h2>
        </div>
        <div className=" px-6 py-2 rounded-lg">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
            leave a heart
          </h2>
        </div>
    </div>
  </div>
  );
};

export default PicSection; 