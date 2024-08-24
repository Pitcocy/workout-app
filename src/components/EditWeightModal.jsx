import React, { useState } from 'react';

const EditWeightModal = ({ entry, onSave, onClose, unit }) => {
  const [editedWeight, setEditedWeight] = useState(unit === 'lbs' ? entry.weight * 2.20462 : entry.weight);

  const handleSave = () => {
    const newWeight = unit === 'lbs' ? editedWeight / 2.20462 : editedWeight;
    onSave(entry.date, newWeight);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit Weight Entry</h2>
        <p>Date: {entry.date}</p>
        <input
          type="number"
          step="0.1"
          value={editedWeight}
          onChange={(e) => setEditedWeight(parseFloat(e.target.value))}
          className="border p-2 mb-4 w-full"
        />
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-300 text-black p-2 rounded mr-2">Cancel</button>
          <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditWeightModal;