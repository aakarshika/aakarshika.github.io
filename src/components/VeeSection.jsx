import HorizontalScrollWrapper from './HorizontalScrollWrapper';

const VeeSection = ({ id, isActive, onScrollHandoff, content, progress, handleHover }) => {
  return (
    <HorizontalScrollWrapper 
      id={id}
      isActive={isActive}
      progress={progress}
      onScrollHandoff={onScrollHandoff}
      slideCount={4} // 4 slides: title + 3 testimonials
      className="h-screen  relative overflow-hidden"
      handleHover={handleHover}
    >
      {content}
    </HorizontalScrollWrapper>
  );
};
  
export default VeeSection; 