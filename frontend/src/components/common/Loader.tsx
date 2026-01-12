import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Loader;
