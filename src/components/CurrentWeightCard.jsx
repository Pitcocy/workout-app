import React from 'react';

const CurrentWeightCard = ({ weight, unit }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">Current Weight</h2>
      {weight ? (
        <p className="text-3xl font-bold text-blue-600">{weight.toFixed(1)} {unit}</p>
      ) : (
        <p className="text-gray-500">No data available</p>
      )}
    </div>
  );
};

export default CurrentWeightCard;