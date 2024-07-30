import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simple Bank API - BE FSW',
            version: '1.0.0',
            description: '[/api/v3/api-docs](http://35.208.108.76/api/v3/api-docs)',
        },
        servers: [
            {
                url: 'http://35.208.108.76',
            },
        ],
    },
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;