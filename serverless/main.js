const api = require("./serverless/services/register")

routes.push({
    endpoint: "/api",
    action: api,
    method: "get"
})

run(routes)
