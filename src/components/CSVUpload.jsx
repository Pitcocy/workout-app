import React, { useState } from 'react';
import Papa from 'papaparse';
import { parse, format } from 'date-fns';

const CSVUpload = ({ onDataUploaded, existingData }) => {
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setError(null);

    Papa.parse(file, {
      complete: (result) => {
        try {
          const processedData = result.data
            .filter(row => row.Date && row.Weight)
            .map(row => ({
              date: formatDate(row.Date),
              weight: parseFloat(row.Weight)
            }));
          
          // Merge new data with existing data
          const mergedData = [...existingData, ...processedData];
          
          // Remove duplicates based on date
          const uniqueData = mergedData.reduce((acc, current) => {
            const x = acc.find(item => item.date === current.date);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          // Sort data by date
          uniqueData.sort((a, b) => new Date(a.date) - new Date(b.date));

          onDataUploaded(uniqueData);
        } catch (err) {
          console.error("Error processing CSV data:", err);
          setError("Error processing CSV file. Please check the file format and try again.");
        }
      },
      header: true,
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setError("Error parsing CSV file. Please check the file format and try again.");
      }
    });
  };

  const formatDate = (dateString) => {
    try {
      const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
      return format(parsedDate, 'yyyy-MM-dd');
    } catch (err) {
      console.error("Error parsing date:", dateString, err);
      throw new Error(`Invalid date format: ${dateString}`);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CSVUpload;