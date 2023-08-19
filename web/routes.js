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

router.post("/addReward", handler.auth, handler.addReward);
router.post("/deleteReward", handler.auth, handler.deleteReward);
router.post("/fetchAllReward", handler.auth, handler.fetchAllReward);
router.post("/redeemReward", handler.auth, handler.redeemReward);

router.post("/customerBalance", handler.auth, handler.customerBalance);
router.get("/customerTransaction", handler.auth, handler.customerTransaction);
router.post("/purchase", handler.auth, handler.purchase); // on purchase page -- cart

module.exports = router;