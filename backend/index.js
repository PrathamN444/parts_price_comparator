const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiUrls = {
  MOUSER: 'https://api.mouser.com/api/v1/search/?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560',
  RUTRONIK: 'https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=',
  ELEMENT14_part1: 'http://api.element14.com//catalog/products?term=manuPartNum:',
  ELEMENT14_part2: '&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u'
};

const currencyRates = {
  USD: 84,
  EUR: 90
};



const getPricesFromRutronik = async (partNumber, volume) => {
  try {
    const response = await axios.get(`${apiUrls.RUTRONIK}${partNumber}`);
    const items = response.data;

    if (!items || items.length === 0) {
      throw new Error('No results found');
    }

    return items.map(item => {

      let priceBreak = item.pricebreaks[0].price;
      for(let i=0; i<item.pricebreaks.length; i++){
        if(volume >= item.pricebreaks[i].quantity){
            priceBreak = item.pricebreaks[i].price;
        }
        else{
            break;
        }
      }
      const unitPrice = parseFloat(priceBreak);
      console.log(priceBreak, unitPrice, item.currency, volume);
      return {
        manufacturerPartNumber: item.mpn,
        manufacturer: item.manufacturer,
        dataProvider: 'RUTRONIK',
        volume,
        unitPrice: convertCurrency(unitPrice, item.currency), // Assuming Rutronik prices are in EUR
        totalPrice: convertCurrency(unitPrice, item.currency) * volume,
      };
    });
  } catch (error) {
    console.error('Error fetching data from Rutronik:', error);
    return [];
  }
};

// const getPricesFromMouser = async (partNumber, volume) => {
//   try {
//     const response = await axios.post(`${apiUrls.MOUSER}`, {
//       SearchByPartRequest: {
//         mouserPartNumber: partNumber
//       }
//     });

//     const items = response.data.SearchResults.Parts;
//     if (!items || items.length === 0) {
//       throw new Error('No results found');
//     }

//     return items.map(item => {
//       const priceBreaks = item.PriceBreaks;
//       const priceBreak = priceBreaks.find(breakPoint => breakPoint.Quantity <= volume) || priceBreaks[0];
//       const unitPrice = parseFloat(priceBreak.Price);

//       return {
//         manufacturerPartNumber: item.translatedManufacturerPartNumber,
//         manufacturer: item.brandName,
//         dataProvider: 'MOUSER',
//         volume,
//         unitPrice, // Assuming Mouser prices are in USD
//         totalPrice: unitPrice * volume,
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching data from Mouser:', error);
//     return [];
//   }
// };

const getPricesFromElement14 = async (partNumber, volume) => {
  try {
    const response = await axios.get(`${apiUrls.ELEMENT14_part1}${partNumber}${apiUrls.ELEMENT14_part2}`);

    const products = response.data.manufacturerPartNumberSearchReturn.products;
    if (!products || products.length === 0) {
      throw new Error('No results found');
    }

    return products.map(item => {
      const priceBreak = item.prices.find(price => (price.to >= volume && price.from <= volume));
      const unitPrice = parseFloat(priceBreak.cost);
        
      return {
        manufacturerPartNumber: item.translatedManufacturerPartNumber,
        manufacturer: item.brandName,
        dataProvider: 'ELEMENT14',
        volume,
        unitPrice: item.currency ? convertCurrency(unitPrice, item.currency) : unitPrice, // Assuming Element14 prices are in USD
        totalPrice: item.currency ? convertCurrency(unitPrice, item.currency) * volume : unitPrice * volume,
      };
    });
  } catch (error) {
    console.error('Error fetching data from Element14:', error);
    return [];
  }
};



const convertCurrency = (price, currency) => {
  if(currency === 'USD') {
    return price * currencyRates.USD;
  } 
  else if(currency === 'EUR') {
    return price * currencyRates.EUR;
  }
  return price;
};

app.post('/getPrices', async (req, res) => {
  const { partNumber, volume } = req.body;

//   const mouserResults = await getPricesFromMouser(partNumber, volume);
  const rutronikResults = await getPricesFromRutronik(partNumber, volume);
  const element14Results = await getPricesFromElement14(partNumber, volume);

  rutronikResults.sort((a,b) => a.totalPrice < b.totalPrice);
  element14Results.sort((a,b) => a.totalPrice < b.totalPrice);

    const results = [];
    results.push(rutronikResults[0]);
    results.push(element14Results[0]);
//   const results = [...mouserResults, ...rutronikResults, ...element14Results];

  results.sort((a, b) => a.totalPrice < b.totalPrice);

  res.json(results);
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});




