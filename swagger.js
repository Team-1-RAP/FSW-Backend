import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simple Bank API - BE FSW',
            version: '1.0.0',
            description: '[/api/v3/api-docs](http://localhost:5000/api/v3/api-docs)',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
    },
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;