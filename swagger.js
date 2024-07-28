import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simple Bank API - BE FSW',
            version: '1.0.0',
            description: '[/api/v3/api-docs](http://34.44.217.91/api/v3/api-docs)',
        },
        servers: [
            {
                url: 'http://34.44.217.91',
            },
        ],
    },
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;