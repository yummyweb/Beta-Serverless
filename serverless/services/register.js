const api = (request, reply) => {
    request.log.info(request.body)
    return {
        api: "api"
    }
}

module.exports = api