const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

const AUTH_URL = "http://20.244.56.144/test/auth";
const BASE_URL = "http://20.244.56.144/test";

const authPayload = {
  companyName: "ANITS",
  clientID: "70c84037-5f64-4035-a337-08f299442ac2",
  clientSecret: "hZSMELQmNyXBfWDt",
  ownerName: "sasi kumar",
  ownerEmail: "sasijanapareddy31@gmail.com",
  rollNo: "A22126512093",
};

let accessToken = null;
let tokenExpiry = 0;
const windowSize = 10;
let numberWindow = [];

const getToken = async () => {
  try {
    console.log("Fetching new token...");
    const response = await axios.post(AUTH_URL, authPayload);
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    console.log("Access token received!");
    return accessToken;
  } catch (error) {
    console.error("Error getting token:", error.response?.data || error.message);
    return null;
  }
};

const fetchData = async (type) => {
  try {
    if (!accessToken || Date.now() >= tokenExpiry) {
      await getToken();
    }

    const url = `${BASE_URL}/${type === "p" ? "primes" : type === "f" ? "fibo" : type === "e" ? "even" : "rand"}`;
    console.log(`Fetching data from: ${url}`);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 500,
    });

    console.log("Data fetched successfully!");
    return response.data.numbers || [];
  } catch (error) {
    console.error("Error fetching data:", error.response?.data || error.message);
    return [];
  }
};

app.get("/numbers/:type", async (req, res) => {
  const { type } = req.params;

  if (!["p", "f", "e", "r"].includes(type)) {
    return res.status(400).json({ error: "Invalid number type. Use 'p', 'f', 'e', or 'r'." });
  }

  const windowPrevState = [...numberWindow];

  const newNumbers = await fetchData(type);

  const uniqueNumbers = newNumbers.filter((num) => !numberWindow.includes(num));

  numberWindow.push(...uniqueNumbers);

  if (numberWindow.length > windowSize) {
    numberWindow = numberWindow.slice(-windowSize);
  }

  
  const avg = numberWindow.length ? numberWindow.reduce((sum, num) => sum + num, 0) / numberWindow.length : 0;

  res.json({
    windowPrevState,
    windowCurrState: numberWindow,
    numbers: uniqueNumbers, 
    avg: avg.toFixed(2),
});

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
