const PROXY_CONFIG = {
  "/api/data": {
    "target": process.env.BFF_URL,
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  },
  "/api/tweets": {
    "target": process.env.BFF_URL,
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  }
}

module.exports = PROXY_CONFIG;