import axios from 'axios';

const API_URL = 'http://localhost:5555/api/books'; 

export const auctionService = {
  createAuction(auctionData: any) {
    return axios.post(`${API_URL}/auctions`, auctionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
