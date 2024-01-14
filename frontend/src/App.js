
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [numberOfStocks, setNumberOfStocks] = useState(0);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/stocks?limit=${numberOfStocks}`);
      const newStocks = response.data.map(newStock => {
        const existingStock = stocks.find(stock => stock.symbol === newStock.symbol);
        return existingStock ? { ...existingStock, ...newStock } : newStock;
      });
      setStocks(newStocks);
    } catch (error) {
      console.error('Error fetching stocks:', error.message);
    }
  };

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/stocks?limit=${numberOfStocks}`);
        const newStocks = response.data.map(newStock => {
          const existingStock = stocks.find(stock => stock.symbol === newStock.symbol);
          return existingStock ? { ...existingStock, ...newStock } : newStock;
        });
        setStocks(newStocks);
      } catch (error) {
        console.error('Error fetching stocks:', error.message);
      }
    };
  
    fetchStocks();  // Fetch stocks immediately
  
    const intervalId = setInterval(fetchStocks, 1000); // Fetch every 1 second
  
    return () => clearInterval(intervalId);
  }, [numberOfStocks, stocks]);

  const handleInputChange = (e) => {
    const inputNumber = parseInt(e.target.value, 10);
    setNumberOfStocks(isNaN(inputNumber) ? 0 : Math.min(inputNumber, 20));
  };

  const handleButtonClick = () => {
    fetchStocks();
  };

  const renderStocks = () => {
    return (
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.symbol}: {stock.currentPrice ? `$${stock.currentPrice.toFixed(2)}` : 'Price not available'}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="App">
      <h1>Stock Watcher</h1>
      <label>
        Number of Stocks:
        <input
          type="number"
          value={numberOfStocks}
          onChange={handleInputChange}
          min="0"
          max="20"
        />
      </label>
      <button onClick={handleButtonClick}>Fetch Stocks</button>
      {renderStocks()}
    </div>
  );
}

export default App;
