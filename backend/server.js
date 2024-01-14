const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

const POLYGON_API_KEY = 'Dhlkpyfq7xy4SZPrp3XYG9WoajMQaQKs'; // Replace with your actual API key
const POLYGON_API_URL = 'https://api.polygon.io/v3/reference/tickers';

const STOCKS_FILE_PATH = './stocks.json';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.json());

app.get('/api/stocks', async (req, res) => {
  try {
    const stocksData = await getStocksData();
    res.json(stocksData);
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch and update stock prices periodically
setInterval(updateStockPrices, 1000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function getStocksData(maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.get(POLYGON_API_URL, {
        params: {
          apiKey: POLYGON_API_KEY,
        },
      });

      const stocksData = response.data.results.slice(0, 20).map(stock => {
        return {
          symbol: stock.ticker,
          openPrice: stock.lastQuote ? stock.lastQuote.p : 0,
          refreshInterval: Math.floor(Math.random() * (5 - 1 + 1)) + 1,
        };
      });

      await fs.writeFile(STOCKS_FILE_PATH, JSON.stringify(stocksData, null, 2));

      return stocksData;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        retries++;
        console.error(`Rate limited. Waiting before retrying (${retries}/${maxRetries})...`);

        if (retries < maxRetries) {
          // Implement a backoff mechanism, for example, wait for 10 seconds
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          console.error(`Reached maximum retry attempts (${maxRetries}). Giving up.`);
          throw new Error('Failed to fetch stocks');
        }
      } else {
        console.error('Error fetching stocks from Polygon API:', error.message);
        throw new Error('Failed to fetch stocks');
      }
    }
  }
}


async function updateStockPrices() {
  try {
    const stocksData = await getStocksData(3);

    const updatedStocks = stocksData.map(stock => {
      return {
        ...stock,
        currentPrice: stock.openPrice + Math.random(),
      };
    });

    await fs.writeFile(STOCKS_FILE_PATH, JSON.stringify(updatedStocks, null, 2));

    console.log('Stock prices updated:', updatedStocks);
  } catch (error) {
    console.error('Error updating stock prices:', error.message);
  }
}
