module.exports.error = function (res, err){
    res.status(500).json({
        msg: `Server Error: ${err}`
    })
}
module.exports.success = function (res, code, result){
    res.status(code).json({
        msg: 'Success!',
        result: result
    });
}