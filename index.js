const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fastify = require('fastify')({
    logger: {
        level: "info",
        prettyPrint: true
    }
})
const figlet = require('figlet')
const colors = require('colors')
const fs = require("fs")
const vm = require('vm')
const chokidar = require('chokidar');

const argv = yargs(hideBin(process.argv)).argv

const start = async () => {
    figlet.text('Beta CLI', {
        font: "Star Wars",
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    }, function(err, data) {
        if (err) {
            console.log('Something went wrong...')
            console.dir(err)
            return
        }
        console.log(data)
        console.log('Running with Fastly'.green)
        console.log("\n")
    })

    try {
        if (argv.port) {
            await fastify.listen(argv.port)
        }
        else {
            await fastify.listen(5000)
        }
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

fs.readFile("serverless/main.js", "utf-8", (err, data) => {
    if (err) {
        console.log('BETA: File `main.js` does not exist'.red)
        process.exit(1)
    }

    const run = routes => {
        routes.forEach(route => {
            switch (route.method) {
                case "get":
                    fastify.get(route.endpoint, async (request, reply) => route.action(request, reply))
                case "post": 
                    fastify.post(route.endpoint, async (request, reply) => route.action(request, reply))
            }
        })

        start()
    }

    const env = {
        run,
        routes: [],
        require
    }

    const script = new vm.Script(data)
    const context = new vm.createContext(env)
    script.runInContext(context)
})

chokidar.watch('serverless').on('change', (path) => {
    fastify.close()
    .then(() => {
        fs.readFile("serverless/main.js", "utf-8", (err, data) => {
            if (err) {
                console.log('BETA: File `main.js` does not exist'.red)
                process.exit(1)
            }
        
            const run = routes => {
                routes.forEach(route => {
                    switch (route.method) {
                        case "get":
                            fastify.get(route.endpoint, async (request, reply) => route.action(request, reply))
                        case "post": 
                            fastify.post(route.endpoint, async (request, reply) => route.action(request, reply))
                    }
                })
        
                start()
            }
        
            const env = {
                run,
                routes: [],
                require
            }
        
            const script = new vm.Script(data)
            const context = new vm.createContext(env)
            script.runInContext(context)
        })
    })
})