import HorizontalScrollWrapper from './HorizontalScrollWrapper';

const VeeSection = ({ isActive, onScrollHandoff, content, progress }) => {
  return (
    <HorizontalScrollWrapper 
      isActive={isActive}
      progress={progress}
      onScrollHandoff={onScrollHandoff}
      slideCount={4} // 4 slides: title + 3 testimonials
      className="h-screen  relative overflow-hidden"
    >
      {content}
    </HorizontalScrollWrapper>
  );
};
  
export default VeeSection; 