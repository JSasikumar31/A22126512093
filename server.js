const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const AUTH_URL = 'http://20.244.56.144/test/auth';
const DATA_URL = 'http://20.244.56.144/test/primes';

const authPayload = {
    companyName: "ANITS",
    clientID: "70c84037-5f64-4035-a337-08f299442ac2",
    clientSecret: "hZSMELQmNyXBfWDt",
    ownerName: "sasi kumar",
    ownerEmail: "sasijanapareddy31@gmail.com",
    rollNo: "A22126512093"
};

let accessToken = null;
let tokenExpiry = 0;

const getToken = async () => {
    try {
        console.log(" Fetching new token");
        const response = await axios.post(AUTH_URL, authPayload);

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + response.data.expires_in * 1000;

        console.log(" Access token received ");
        return accessToken;
    } catch (error) {
        console.error(" Error getting token:", error.response?.data || error.message);
        return null;
    }
};

const fetchData = async () => {
    try {
        if (!accessToken || Date.now() >= tokenExpiry) {
            await getToken();
        }

        console.log("Fetching data from API");
        const response = await axios.get(DATA_URL, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log(" Data fetched successfully!");
        return response.data;
    } catch (error) {
        console.error(" Error fetching data:", error.response?.data || error.message);
        return null;
    }
};

app.get('/fetch-data', async (req, res) => {
    const data = await fetchData();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
});