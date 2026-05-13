import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.jolpi.ca/ergast/f1/',
  headers: {
    'Content-Type': 'application/json',
  }
});