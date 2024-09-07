import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parseISO, format, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import CSVUpload from './CSVUpload';
import ErrorBoundary from './ErrorBoundary';
import CurrentWeightCard from './CurrentWeightCard';
import EditWeightModal from './EditWeightModal';
import { auth } from '../firebase';
import { loadData, saveData, updateData } from '../services/databaseService';

const WeightTracker = () => {
  const [weightData, setWeightData] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyAverages, setWeeklyAverages] = useState([]);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('kg');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    const fetchData = async () => {
      const loadedWeightData = await loadData('weightData', []);
      setWeightData(loadedWeightData);
      if (loadedWeightData.length > 0) {
        setSelectedMonth(startOfMonth(parseISO(loadedWeightData[loadedWeightData.length - 1].date)));
      }
      const loadedUnit = await loadData('weightUnit', 'kg');
      setUnit(loadedUnit);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const saveWeightData = async () => {
      if (weightData.length > 0) {
        await saveData('weightData', weightData);
        calculateWeeklyAverages();
      }
    };
    saveWeightData();
  }, [weightData]);

  const handleDataUploaded = async (data) => {
    console.log("Received data from CSV:", data);
    setWeightData(data);
    saveData('weightData', data);
  };

  const addWeight = async (e) => {
    e.preventDefault();
    setError('');
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0 || weight > 1000) {
      setError('Please enter a valid weight');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    if (weightData.some(entry => entry.date === dateStr)) {
      setError('An entry for this date already exists');
      return;
    }
    const newEntry = { 
      date: dateStr, 
      weight: unit === 'lbs' ? weight / 2.20462 : weight // Convert to kg if needed
    };
    const updatedData = [...weightData, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    setWeightData(updatedData);
    await saveData('weightData', updatedData);
    setNewWeight('');
    setSelectedDate(new Date());
  };

  const editWeight = async (date, newWeight) => {
    const updatedData = weightData.map(entry => 
      entry.date === date ? { ...entry, weight: newWeight } : entry
    );
    setWeightData(updatedData);
    await saveData('weightData', updatedData);
    setEditModalOpen(false);
    setEditingEntry(null);
  };

  const calculateWeeklyAverages = () => {
    const weekMap = new Map();
    
    weightData.forEach(entry => {
      const date = parseISO(entry.date);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
      
      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, { sum: 0, count: 0 });
      }
      
      const week = weekMap.get(weekStart);
      week.sum += entry.weight;
      week.count += 1;
    });

    const averages = Array.from(weekMap, ([date, { sum, count }]) => ({
      weekStart: date,
      average: sum / count
    })).sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    // Calculate difference from previous week
    averages.forEach((week, index) => {
      if (index > 0) {
        week.difference = week.average - averages[index - 1].average;
      }
    });

    setWeeklyAverages(averages);
  };

  const formatXAxis = (tickItem) => {
    return format(parseISO(tickItem), 'MMM dd');
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Weight\n"
      + weightData.map(row => `${row.date},${row.weight}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weight_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleUnit = async () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    setUnit(newUnit);
    await saveData('weightUnit', newUnit);
  };

  const convertWeight = (weight) => {
    return unit === 'lbs' ? weight * 2.20462 : weight;
  };

  const getMonthOptions = () => {
    const options = [];
    if (weightData.length > 0) {
      let currentMonth = startOfMonth(new Date(weightData[0].date));
      const lastMonth = startOfMonth(new Date(weightData[weightData.length - 1].date));

      while (currentMonth <= lastMonth) {
        options.push(currentMonth);
        currentMonth = startOfMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
      }
    }
    return options.reverse();
  };

  const filteredWeightData = weightData.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= startOfMonth(selectedMonth) && entryDate < endOfMonth(selectedMonth);
  });

  const currentWeight = weightData.length > 0 
    ? convertWeight(weightData[weightData.length - 1].weight)
    : null;

    return (
      <ErrorBoundary>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Weight Tracker</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <CurrentWeightCard weight={currentWeight} unit={unit} />
            <div>
            <h2 className="text-xl font-semibold mb-2">Add New Weight</h2>
            <form onSubmit={addWeight} className="flex flex-col space-y-2">
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                className="border p-2"
              />
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={`Enter weight in ${unit}`}
                className="border p-2"
              />
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Weight</button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </div>
        </div>

        <div className="mb-4">
          <CSVUpload onDataUploaded={handleDataUploaded} existingData={weightData} />
          <button onClick={exportData} className="mt-2 bg-green-500 text-white p-2 rounded mr-2">
            Export Data
          </button>
          <button onClick={toggleUnit} className="mt-2 bg-purple-500 text-white p-2 rounded">
            Toggle Unit ({unit})
          </button>
        </div>

        {weightData.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Daily Weight Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData.map(entry => ({...entry, weight: convertWeight(entry.weight)}))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatXAxis} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Weekly Average Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyAverages.map(entry => ({
                  ...entry,
                  average: convertWeight(entry.average),
                  difference: entry.difference ? convertWeight(entry.difference) : null
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekStart" tickFormatter={formatXAxis} />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip content={<CustomTooltip unit={unit} />} />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Edit Entries</h2>
              <div className="mb-4">
                <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Select Month:</label>
                <select
                  id="month-select"
                  value={selectedMonth.toISOString()}
                  onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {getMonthOptions().map((date) => (
                    <option key={date.toISOString()} value={date.toISOString()}>
                      {format(date, 'MMMM yyyy')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight ({unit})</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWeightData.map(entry => (
                      <tr key={entry.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{convertWeight(entry.weight).toFixed(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              setEditingEntry(entry);
                              setEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p>No weight data available. Please upload a CSV file or add a weight entry.</p>
        )}

        {editModalOpen && (
          <EditWeightModal
            entry={editingEntry}
            onSave={editWeight}
            onClose={() => setEditModalOpen(false)}
            unit={unit}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded shadow">
        <p>{`Week of ${format(parseISO(label), 'MMM dd, yyyy')}`}</p>
        <p>{`Average: ${payload[0].value.toFixed(2)} ${unit}`}</p>
        {payload[0].payload.difference && (
          <p>{`Difference: ${payload[0].payload.difference.toFixed(2)} ${unit}`}</p>
        )}
      </div>
    );
  }
  return null;
};

export default WeightTracker;