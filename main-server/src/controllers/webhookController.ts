import {orderService} from "../services/OrderService";
import {emitNewOrder} from "../websocket/socket";


export  const recieveOrder = async (req: any, res: any) => {


    try {
        const { restaurantId, customerName, items, totalPrice } = req.body;



        if (!restaurantId || !customerName || !items || !totalPrice) {
            return res.status(400).json({ error: "Eksik veri" });
        }


        const  newOrder =await  orderService.createOrder({
                restaurantId,
                customerName,
                items,
                totalPrice
            });

        emitNewOrder(newOrder);

           return  res.status(201).json(newOrder);

    }
    catch (error) {
        console.error("Webhook işleme hatası:", error);
        return res.status(500).json({error: "İşlem sırasında bir hata oluştu"});
    }
}