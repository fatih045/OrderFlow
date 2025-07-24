import express from "express";
import cors from "cors"
import morgan from "morgan";

import orderRoutes from "./src/routes/orderRoutes";


export  const  app=express();


app.use(cors())
app.use(morgan("dev"));
app.use(express.json());   // json post isteklerini çözer


// route


app.use("/orders", orderRoutes)


export  default  app;