import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("API funcionando");
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});