const express = require("express");
const router = express.Router();
const handler = require('./handlers');


router.get("/", (req, res) => {
    res.send("API Working")
});

router.post("/customerAuth", handler.tokenize);
router.post("/MerchantAuth", handler.setMerchant, handler.tokenize);
router.post("/setMerchantTokenomics", handler.auth, handler.setMerchantTokenomics);
router.get("/getMerchantTokenomics", handler.auth, handler.getMerchantTokenomics);
router.post("/setDecayDays", handler.auth, handler.setDecayDays);
router.get("/getDecayDays", handler.auth, handler.getDecayDays);

router.post("/addReward", handler.auth, handler.addReward);
router.post("/deleteReward", handler.auth, handler.deleteReward);
router.post("/fetchAllReward", handler.auth, handler.fetchAllReward);
router.post("/fetchRedeemableReward", handler.auth, handler.fetchRedeemableReward);
router.post("/redeemReward", handler.auth, handler.redeemReward);

router.get("/customerBalance", handler.auth, handler.customerBalance);
router.get("/customerTransaction", handler.auth, handler.customerTransaction);
router.post("/purchase", handler.auth, handler.purchase); // on purchase page -- cart
router.post("/getOrders", handler.auth, handler.getOrders);
router.post("/cancelOrder", handler.auth, handler.cancelOrder);

module.exports = router;