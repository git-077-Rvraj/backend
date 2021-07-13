const functions = require("firebase-functions");
const admin = require("firebase-admin");
const PaytmChecksum = require("./PaytmChecksum");

admin.initializeApp();

exports.getCheckSum = functions.https.onRequest((request, response) => {
    var paytmParams = {};
const CHECKSUM_VALUE = "";
paytmParams["MID"] = "wRkmOe59237351879270";
paytmParams["ORDERID"] = request.query.oId;
paytmParams["WEBSITE"] = "WEBSTAGING";
paytmParams["CHANNEL_ID"] = "WAP";
paytmParams["INDUSTRY_TYPE_ID"] = "Retail";
paytmParams["TXN_AMOUNT"]=request.query.amount;
paytmParams["CALLBACK_URL"]= "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID="+request.query.oId;

var paytmChecksum = PaytmChecksum.generateSignature(paytmParams, "Jf&eno32UcBVZ@ZY");
paytmChecksum.then(function(result){
	console.log("generateSignature Returns: " + result);
    CHECKSUM_VALUE = result;
	var verifyChecksum =  PaytmChecksum.verifySignature(paytmParams, "Jf&eno32UcBVZ@ZY",result);
	console.log("verifySignature Returns: " + verifyChecksum);
    response.json({
        result:result,
    })
}).catch(function(error){
	console.log(error);
});

const  paytmChecksum = CHECKSUM_VALUE;

const isVerifySignature = PaytmChecksum.verifySignature(body, config.PAYTM_MERCHANT_KEY, paytmChecksum);
if (isVerifySignature) {
	console.log("Checksum Matched");
} else {
	console.log("Checksum Mismatched");
}
});
