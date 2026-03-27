import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(express.json());



app.listen(3000, () => {
    console.log("server is running");
});