import { useState } from 'react';
import axios from 'axios';


function Homepage() {
  const [partNumber, setPartNumber] = useState('CC0402KRX7R7BB104');
  const [volume, setVolume] = useState(20000);
  const [results, setResults] = useState([]);
  const [order, setOrder] = useState(null);

  async function handleSubmit (e){
    e.preventDefault();
    const response = await axios.post('http://localhost:5000/getPrices', { partNumber, volume });
    setResults(response.data);
  }


  return (
    <div>
        {!order && (
            <div className='bg-white min-h-screen pt-20 py-10'>
            <form onSubmit={handleSubmit} className='text-center my-10 flex flex-col gap-5 items-center border w-1/2 mx-auto py-10 shadow-md bg-gray-300'>
                <h1 className='text-3xl font-semibold text-center mb-5'>Part Price Comparison</h1>
                <div className='text-lg'>
                <label>Part Number :</label>
                <input className='px-4 py-2 rounded-lg mx-2' type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} />
                </div>
                <div className='text-lg'>
                <label >Volume :</label>
                <input className='px-4 py-2 rounded-lg mx-2' type="number" value={volume} onChange={(e) => setVolume(e.target.value)} />
                </div>
                <button className='bg-blue-500 text-white w-1/5 py-2 rounded-lg text-lg' type="submit">Enter</button>
            </form>
            <div className='px-20 '>
                {results.length > 0 && (
                <div className="container mx-auto px-4">
                <h2 className="text-2xl font-semibold text-gray-800 my-4">Price Comparison for part {partNumber}</h2>
                <table className="min-w-full bg-gray-200 border border-gray-300">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border-b border-r border-white border-solid">Part Number</th>
                        <th className="py-2 px-4 border-b border-r border-white">Manufacturer</th>
                        <th className="py-2 px-4 border-b border-r border-white">Data Provider</th>
                        <th className="py-2 px-4 border-b border-r border-white">Volume</th>
                        <th className="py-2 px-4 border-b border-r border-white">Unit Price</th>
                        <th className="py-2 px-4 border-b border-r border-white">Total Price</th>
                        <th className='py-2 px-4 border-b border-r border-white'></th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((result, index) => (
                        <tr key={index}>
                        <td className="py-2 px-4 border-b border-r border-white">{result.manufacturerPartNumber}</td>
                        <td className="py-2 px-4 border-b border-r border-white">{result.manufacturer}</td>
                        <td className="py-2 px-4 border-b border-r border-white">{result.dataProvider}</td>
                        <td className="py-2 px-4 border-b border-r border-white">{result.volume}</td>
                        <td className="py-2 px-4 border-b border-r border-white">{result.unitPrice.toFixed(4)}</td>
                        <td className="py-2 px-4 border-b border-r border-white">{result.totalPrice.toFixed(2)}</td>
                        {index === 0 && (
                            <td className='py-2 px-4 border-b border-white text-center'>
                            <button className='bg-orange-400 text-center text-white text-lg py-1 px-3 rounded-lg' onClick={() => setOrder(result)}>Add To Cart</button>
                            </td>
                        )}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            
                )}
            </div>
            </div>
        )}
        {!!order && (
            <div className='bg-gray-300 min-h-screen py-40 flex items-center'>
                <div className='mx-auto flex flex-col gap-7 border border-black p-12 bg-white rounded-lg shadow-md'>
                    <button className='bg-red-400 w-1/5 py-1 px-2 text-white rounded-lg' onClick={() => setOrder(null)}>Go back</button>
                    <h2 className='text-2xl font-semibold'>Added to the cart</h2>
                    <h2 className='text-lg font-semibold'>order for part number : {results[0].manufacturerPartNumber}</h2>
                    <div className=''>
                        <h2 className='inline-block text-lg'>Volume : </h2>
                        <input className='inline-block ml-3 text-center py-1 rounded-lg border border-blue-400' type="number" value={volume} onChange={(e) => setVolume(e.target.value)}/>
                    </div>
                    <h2 >Data Provider : {results[0].dataProvider}</h2>
                    <h2>Unit price : {results[0].unitPrice.toFixed(4)} INR</h2>
                    <h2 className='text-xl font-semibold'>Total Price : {results[0].totalPrice.toFixed(2)} INR</h2>
                    <button className='bg-orange-400 py-2 rounded-lg' onClick={handleSubmit}>Check for changed volume</button>
                </div>
            </div>
        )}
    </div>
  );
}

export default Homepage;
