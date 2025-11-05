import express from "express";

const app = express();
const port = 3001;

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`backend running on port ${port}`);
});