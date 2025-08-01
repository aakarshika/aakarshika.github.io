import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { getCachedFingerprint } from '../utils/fingerprintUtils';

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

export const useVisitorPortfolio = () => {
  const [picturesList, setPicturesList] = useState([]);
  // const [fingerprint] = useState(() => Math.random().toString(36).slice(2));

  const [fingerprint, setFingerprint] = useState(null);

  // Initialize fingerprint on component mount
  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await getCachedFingerprint();
      setFingerprint(fp);
    };
    initFingerprint();
  }, []);

  const getPublicUrl = (filePath) => {
    if (!filePath) return null;
    const { data: { publicUrl } } = supabase.storage
      .from('aakarshika-visitors')
      .getPublicUrl(filePath);
    return publicUrl;
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_fingerprints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      const d = data.map(pic => ({ 
        src: getPublicUrl(pic.object_name), 
        filter: pic.filter,
        fingerprint: pic.fingerprint,
        object_name: pic.object_name,
        id: pic.id,
        message: pic.message || ''
      }));
      Array(5).fill(0).forEach(() => {
        d.push({ src: 'heart', filter: 'none' });
      });
      Array(40-d.length).fill(0).forEach(() => {
        d.push({ src: 'blank', filter: 'none' });
      });
      Array((15*5)-d.length).fill(0).forEach(() => {
        d.push(d[Math.floor(Math.random() * d.length)]);
      });
      setPicturesList(d.sort((a, b) => Math.random() - 0.5));
    } catch (err) {
      console.error('Error fetching visitor images:', err);
    }
  };

  const handleCapture = async (imageSrc, filter, message = '') => {
    console.log('🖼️ handleCapture called with:', { 
      imageSrcLength: imageSrc?.length, 
      filter, 
      message, 
      fingerprint 
    });
    
    // Save image locally instead of uploading
    try {
      const imageBlob = dataURLtoBlob(imageSrc);
      const fileName = `capture_${Date.now()}.jpg`;
      
      // Create a download link
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('✅ Image saved locally as:', fileName);
      console.log('📦 Image blob size:', imageBlob.size);
      
      // Show success message
      alert(`Image saved as ${fileName}! Check your Downloads folder.`);
      
    } catch (err) {
      console.error('Error saving image locally:', err);
      alert('Error saving image. Check console for details.');
    }
  };

  const handleDelete = async (objectName, id) => {
    if (!fingerprint) {
      console.warn('Fingerprint not ready yet');
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('aakarshika-visitors')
        .remove([objectName]);
      
      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('visitor_fingerprints')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;

      // Refresh the portfolio
      await fetchPortfolio();
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return {
    picturesList,
    handleCapture,
    handleDelete,
    fingerprint
  };
}; 