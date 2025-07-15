import express from "express";
import {recieveOrder} from "../controllers/webhookController";


const  router =express.Router();


router.post("/order",recieveOrder)

export  default  router;