const express = require("express");
const router = express.Router();
const handler = require('./handlers');
const middleware = require('./middleware');

router.get("/", (req, res) => {
    res.send("API Working")
});

router.post("/customerAuth", handler.tokenize);
router.post("/MerchantAuth", middleware.setMerchant, handler.tokenize);
router.post("/setMerchantTokenomics", middleware.auth, handler.setMerchantTokenomics);
router.get("/getMerchantTokenomics", middleware.auth, handler.getMerchantTokenomics);

router.post("/addReward", middleware.auth, handler.addReward);
router.post("/deleteReward", middleware.auth, handler.deleteReward);
router.post("/fetchAllReward", middleware.auth, handler.fetchAllReward);
router.post("/redeemReward", middleware.auth, handler.redeemReward);

router.post("/customerBalance", middleware.auth, handler.customerBalance);
router.get("/customerTransaction", middleware.auth, handler.customerTransaction);
router.post("/purchase", middleware.auth, handler.purchase); // on purchase page -- cart

module.exports = router;