const express = require("express");
const router = express.Router();
const handler = require('./handlers');


router.get("/", (req, res) => {
    res.send("API Working")
});

router.post("/auth", handler.setMerchant, handler.tokenize);

router.post("/setMerchantTokenomics", handler.auth, handler.setMerchantTokenomics);
router.get("/getMerchantTokenomics", handler.auth, handler.getMerchantTokenomics);
router.post("/setOwnerTokenomics", handler.auth, handler.setOwnerTokenomics);
router.get("/getOwnerTokenomics", handler.auth, handler.setOwnerTokenomics);
router.post("/setDecayDays", handler.auth, handler.setOwnerTokenomics);
router.get("/getDecayDays", handler.auth, handler.setOwnerTokenomics);

router.post("/addReward", handler.auth, handler.setOwnerTokenomics);
router.post("/deleteReward", handler.auth, handler.setOwnerTokenomics);
router.post("/fetchAllReward", handler.auth, handler.setOwnerTokenomics);
router.post("/fetchRedeemableReward", handler.auth, handler.setOwnerTokenomics);
router.post("/redeemReward", handler.auth, handler.setOwnerTokenomics);

router.get("/customerBalance", handler.auth, handler.setOwnerTokenomics);
router.get("/customerTransaction", handler.auth, handler.setOwnerTokenomics);
router.post("/purchase", handler.auth, handler.setOwnerTokenomics);

module.exports = router;