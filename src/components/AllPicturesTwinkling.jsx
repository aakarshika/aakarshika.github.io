import React from 'react';
import { Heart, Trash2 } from 'lucide-react';

const IMG_SIZE = 100; // px

const AllPicturesTwinkling = ({ pictures, progress = 0, size = { width: 210, height: 190 }, currentFingerprint, onDelete }) => {
  if (!pictures || pictures.length === 0) {
    return <div className="text-white text-sm">No pictures yet.</div>;
  }
  // console.log("currentFingerprint", currentFingerprint);
  return (
    <div className="relative w-full h-full "
    style={{
      scale: 0.8
    }}
    >
      <div className="w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)' }}>
        {pictures.slice(0, 15*5).map((pic, idx) => 
          { 
            const sign = (1-(idx%2)*2);
            const rot = 5*sign*(idx%3);
            const isOwnImage = currentFingerprint && pic?.fingerprint === currentFingerprint;
            
            return(<div
              key={idx + '-' + (pic?.src || pic)}
              className={`${pic?.src === 'blank' ? '' : ''}`}
              style={{ 
                zIndex: isOwnImage ? 999 : 2,
                position: 'relative',
                transform: 
                (sign == -1?'scale(1.2)': 'scale(1)') + ' ' +
                (' rotate('+rot+'deg)')
              }}
            >
              {pic?.src && pic?.src !== 'blank' && pic?.src !== 'heart' && (
                <div className='bg-white p-2 border border-gray-400 shadow-lg shadow-black-500/50 relative group'
                  style={{ 
                    position: 'relative'
                  }}
                >
                  <img
                    src={pic?.src}
                    style={{
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.log("Error loading image", e, pic);
                    }}
                    alt={`Captured ${idx + 1}`}
                    loading="lazy"
                  />
                  <h4 className='text-xs text-blue-900'>{pic.message}</h4>
                  {isOwnImage && (
                    <button
                      onClick={(e) => {
                        console.log("Deleting image", pic.object_name, pic.id);
                        // e.stopPropagation();
                        onDelete(pic.object_name, pic.id);
                      }}
                      className="absolute top-1 right-1 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-1 opacity-100 transition-opacity duration-200 z-10"
                      title="Delete your image"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
              {pic?.src && pic?.src === 'heart' && (
                <div className='p-2 relative group'
                  style={{ 
                    position: 'relative'
                  }}
                >
                  <Heart size={50} color='transparent' fill='rgb(249, 119, 143)' />
                </div>
              )}
            </div>)}
        )}
      </div>
    </div>
  );
};

export default AllPicturesTwinkling; 