const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
let swaggerDocument = require("./swagger.json");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// override Swagger “host” from an env var (e.g. SWAGGER_HOST=fin.fit-byte.com)
swaggerDocument.host = process.env.SWAGGER_HOST || swaggerDocument.host;

// SMC ACE API Credentials
const API_KEY    = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// new API endpoints
const BASE_URL                 = "https://openapi.smctradeonline.com/portfolio";
const HOLDINGS_URL             = `${BASE_URL}/holdings`;
const POSITIONS_URL            = `${BASE_URL}/positions`;
const POSITION_CONVERSION_URL  = `${BASE_URL}/position-conversion`;

// allow JSON bodies for PUT
app.use(express.json());

// GET /holdings → retrieve holding
app.get("/holdings", async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res
      .status(400)
      .json({ error: "Missing required query param: clientId" });
  }
  try {
    const { data } = await axios.get(HOLDINGS_URL, {
      headers: {
        "x-api-key":    API_KEY,
        "x-api-secret": API_SECRET,
      },
      params: { clientId }
    });
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch holdings:", err.response?.data || err);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Unknown error" });
  }
});

// GET /positions → retrieve position
app.get("/positions", async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res
      .status(400)
      .json({ error: "Missing required query param: clientId" });
  }
  try {
    const { data } = await axios.get(POSITIONS_URL, {
      headers: {
        "x-api-key":    API_KEY,
        "x-api-secret": API_SECRET,
      },
      params: { clientId }
    });
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch positions:", err.response?.data || err);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Unknown error" });
  }
});

// PUT /position‐conversion → convert position
app.put("/position-conversion", async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res
      .status(400)
      .json({ error: "Missing required query param: clientId" });
  }
  try {
    const payload = req.body;
    const { data } = await axios.put(
      `${POSITION_CONVERSION_URL}?clientId=${clientId}`,
      payload,
      {
        headers: {
          "x-api-key":    API_KEY,
          "x-api-secret": API_SECRET,
          "Content-Type": "application/json"
        }
      }
    );
    res.json(data);
  } catch (err) {
    console.error("Failed to convert position:", err.response?.data || err);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Unknown error" });
  }
});

// Setup Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
