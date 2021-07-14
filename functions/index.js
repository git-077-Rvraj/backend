const functions = require("firebase-functions");
const admin = require("firebase-admin");
const PaytmChecksum = require("./PaytmChecksum");
const https = require("https");

admin.initializeApp();

exports.getCheckSum = functions.https.onRequest((request, res) => {
  var paytmParams = {};
  console.log(request.query.oId);

  paytmParams.body = {
    requestType: "Payment",
    mid: "wRkmOe59237351879270",
    websiteName: "WEBSTAGING",
    orderId: request.query.oId,
    callbackUrl: "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID="+request.query.oId,
    txnAmount: {
      value: request.query.amount,
      currency: "INR",
    },
    userInfo: {
      custId: request.query.custId,
    },

    enablePaymentMode:[{
      mode: "UPI",
      channels:["UPIPUSH","UPIPUSHEXPRESS","UPI"]
    },{
       mode : "CREDIT_CARD",
       channels:["VISA","MASTER","AMEX"]
    },{
      mode:"DEBIT_CARD",
      channels:["VISA","MASTER","AMEX"],
    }],
  
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    "Jf&eno32UcBVZ@ZY"
  )
    .then((checksum) => {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        /* for Staging */
        hostname: "securegw-stage.paytm.in",
        /* for Production */
        // hostname: 'securegw.paytm.in',
        port: 443,
        path: `/theia/api/v1/initiateTransaction?mid=wRkmOe59237351879270&orderId=${request.query.oId}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, (post_res) => {
        post_res.on("data", (chunk) => {
          response += chunk;
        });
        post_res.on("end", () => {
          console.log("Response: ", response);
          res.send(response);
        });
      });
      post_req.write(post_data);
      post_req.end();
    })
    .catch((err) => {
      console.error(err);
    });
}); 