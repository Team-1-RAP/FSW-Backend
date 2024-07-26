import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simple Bank API - BE FSW',
            version: '1.0.0',
            description: 'API',
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
