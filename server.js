const request = require('request');
const rp = require('request-promise-native');
const parseString = require('xml2js').parseString;
const path = require('path');

module.exports = function (options) {
  const { loginUrl, emailPostfix, loginToken } = options;

  this.bindHook('third_login', (ctx) => {
    
    const query = ctx.query.ticket ? ctx.query.ticket : '';
    return reqValidate(ctx, loginUrl, emailPostfix);

  })
}

async function reqValidate(ctx, loginUrl, emailPostfix, next){

  // console.log("ctx.protocol:",ctx.protocol);
  // console.log("ctx.url:",ctx.url);
  // console.log("ctx.origin:",ctx.origin);
  // console.log("ctx.href:",ctx.href);
  // console.log("ctx.hostname:",ctx.hostname);
  // console.log("ctx.originalUrl:",ctx.originalUrl)
  // console.log("ctx.origin:",ctx.origin)
  const serviceUrl = ctx.origin + '/api/user/login_by_token';
  const query = ctx.query.ticket ? ctx.query.ticket : '';
  if(query){
    let reqOpt = {
      uri: loginUrl,
      qs: {
        ticket: query,
        service: serviceUrl
      },
    }
    let resBody = await rp(reqOpt);  

    let result = await new Promise((resolve, reject)=>{
      parseString (resBody, {trim: true, explicitRoot: false}, (err, res)=>{
        if(err){
          reject(err);
        } else {
          resolve(res);
        }
      })
    })

    if(result['cas:authenticationSuccess']){
      
      let infoData = result['cas:authenticationSuccess'][0]['cas:attributes'][0];
      let user = {
        // email: infoData['cas:userId'] + emailPostfix,
        email: infoData['cas:userId'] + emailPostfix,
        username: infoData['cas:userName']
      };

      return user;
    }
  }
}