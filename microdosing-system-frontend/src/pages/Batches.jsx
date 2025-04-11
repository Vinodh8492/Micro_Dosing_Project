import React, { useState, useEffect } from 'react';

const Batches = () => {
  const [filters, setFilters] = useState({ status: '', recipe: '', startDate: '' });
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setBatches([
        {
          id: 'BAT-2024-001',
          orderNumber: 'ORD-2024-001',
          recipe: 'Formula A',
          // status: 'Completed', status should be released or not released
          status: 'Released',
          progress: 'of materials',
          startTime: '15/02/2024, 8:00:00 am',
          operator: 'Not assigned'
        },
        {
          id: 'BAT-2024-002',
          orderNumber: 'ORD-2024-002',
          recipe: 'Formula B',
          status: 'Not Released',
          progress: 'of materials',
          startTime: '15/02/2024, 11:00:00 am',
          operator: 'Not assigned'
        }
      ]);
    }, 300);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', recipe: '', startDate: '' });
  };

  const filteredBatches = batches.filter(b => {
    const matchesStatus = filters.status === '' || b.status.toLowerCase() === filters.status.toLowerCase();
    const matchesRecipe = filters.recipe === '' || b.recipe.toLowerCase().includes(filters.recipe.toLowerCase());
    const matchesDate = !filters.startDate || b.startTime.includes(filters.startDate);
    return matchesStatus && matchesRecipe && matchesDate;
  });

  const statusStyle = {
    Completed: 'bg-green-100 text-green-700',
    'In-Progress': 'bg-blue-100 text-blue-700',
    Pending: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10">
      <h1 className='text-2xl text-black font-bold p-3'>Reports</h1>
      <div className="mb-6 bg-gray-100 p-6 rounded-lg flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status</label>
          <select name="status" value={filters.status} onChange={handleChange} className="border p-2 rounded">
            <option value="">All Statuses</option>
            <option value="Released">Released</option>
            <option value="Not Released">Not Released</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Recipe</label>
          <select name="recipe" value={filters.recipe} onChange={handleChange} className="border p-2 rounded">
            <option value="">All Recipes</option>
            <option value="Formula A">Formula A</option>
            <option value="Formula B">Formula B</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="border p-2 rounded" />
        </div>
        <div className="flex items-end">
          <button onClick={clearFilters} className="border px-4 py-2 rounded bg-gray-300">Clear Filters</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm font-semibold">
            <tr>
              <th className="p-3">Batch ID</th>
              <th className="p-3">Order Number</th>
              <th className="p-3">Recipe</th>
              <th className="p-3">Status</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Start Time</th>
              <th className="p-3">Operator</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredBatches.map(batch => (
              <tr key={batch.id} className="border-t">
                <td className="p-3">{batch.id}</td>
                <td className="p-3">{batch.orderNumber}</td>
                <td className="p-3">{batch.recipe}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[batch.status]}`}>{batch.status}</span>
                </td>
                <td className="p-3">{batch.progress}</td>
                <td className="p-3">{batch.startTime}</td>
                <td className="p-3">{batch.operator}</td>
                <td className="p-3 space-x-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded">View</button>
                  {/* {batch.status === 'In-Progress' && (
                    <button className="bg-green-500 text-white px-3 py-1 rounded">Continue</button>
                  )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Batches;