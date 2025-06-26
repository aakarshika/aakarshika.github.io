import React from 'react';

const IMG_SIZE = 100; // px

const AllPicturesTwinkling = ({ pictures, progress = 0, size = { width: 210, height: 190 } }) => {
  if (!pictures || pictures.length === 0) {
    return <div className="text-gray-400 text-sm">No pictures yet.</div>;
  }

  return (
    <div className="relative w-full h-full ">
      <div className="grid grid-cols-11 w-full ">
        {pictures.slice(0, 11*5).map((pic, idx) => 
          { 

            const sign = (1-(idx%2)*2);
            const rot = 5*sign*(idx%3);
            console.log(rot);
            return(<div
              key={idx + '-' + (pic?.src || pic)}

          className={`pointer-events-none   ${pic?.src === 'blank' ? '' : ''}`}
            style={{ zIndex: 2
              , transform: 
              (sign == -1?'scale(1.2)': 'scale(0.8)') + ' ' +
              (' rotate('+rot+'deg)')
            }}
            >
          {pic?.src && pic?.src !== 'blank' && (
            <div className='bg-white p-2 shadow-lg shadow-black-500/50'>
            <img
            src={pic?.src}
            style={{
              objectFit: 'cover',
            }}
            alt={`Captured ${idx + 1}`}
            loading="lazy"
          />
          </div>
          )}
          </div>)}
        )}
      </div>
    </div>
  );
};

export default AllPicturesTwinkling; 