const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const app               = express();
const swaggerUi         = require('swagger-ui-express');
const swaggerJsdoc      = require('swagger-jsdoc');


const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: 'School Management System API',
            version: '1.0.0',
        },
        servers: [{ url: '/api' }],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'token',
                },
            },
        },
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
    },
    apis: ["./**/*.manager.js"],
};
const specs = swaggerJsdoc(options);

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    /** server configs */
    run(){
        app.use(cors({origin: '*'}));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
        app.use('/static', express.static('public'));
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });
        
        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);
        app.all('/api/:moduleName/:fnName/:id', this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}