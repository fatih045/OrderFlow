import express from "express";
import cors from "cors"
import morgan from "morgan";
import webhookRoutes from "./src/routes/webhookRoutes";
import authRoutes from "./src/routes/authRoutes";



export  const  app=express();


app.use(cors())
app.use(morgan("dev"));
app.use(express.json());   // json post isteklerini çözer


// route


app.use("/webhook",webhookRoutes)
app.use("/auth", authRoutes)

export  default  app;