const jwt = require("jsonwebtoken");
const contract = require("./contract");
const errorLog = require("./responseHandler").error;


module.exports.auth = async function(req, res, next){
    const token = req.header('Authorization');
    if(!token){
        return res.status(401).json({
            msg:"Authenticate to gain access"
        });
    }
    try{
        jwt.verify(token, process.env.jwtUserSecret, (err, decoded) =>{
            if(err){
                res.status(401).json({
                    msg:"Authentication not valid"
                });
            }else{
                req.user = decoded.user;
                next();
            }
        });
    }catch(err){
        errorLog(res, err);
    }
}

module.exports.setMerchant = async function (req, res, next) {
    try {
        if(!req.body.isMerchant) {
            next();
        }
        const Contract = await contract(req.body.privateKey);
        const output = await Contract.setMerchant();
        await output;
        
        next();
    } catch (err) {
        errorLog(res, err);
    }
}