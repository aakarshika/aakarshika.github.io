import HorizontalScrollWrapper from './HorizontalScrollWrapper';

const VeeSection = ({ isActive, onScrollHandoff, content }) => {
  return (
    <HorizontalScrollWrapper 
      isActive={isActive}
      onScrollHandoff={onScrollHandoff}
      slideCount={4} // 4 slides: title + 3 testimonials
      className="h-screen  relative overflow-hidden"
    >
      {content}
    </HorizontalScrollWrapper>
  );
};
  
export default VeeSection; 