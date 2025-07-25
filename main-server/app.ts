import express from "express";
import cors from "cors"
import morgan from "morgan";

import orderRoutes from "./src/routes/orderRoutes";
import deliveryHeroRoutes from "./src/routes/deliveryHeroRoutes";


export const app = express();


app.use(cors())
app.use(morgan("dev"));
app.use(express.json());   // json post isteklerini çözer


// route


app.use("/orders", orderRoutes)
app.use("/delivery-hero", deliveryHeroRoutes)


export default app;