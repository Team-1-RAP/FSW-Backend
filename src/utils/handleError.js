export const handleError = (error, defaultMessage = 'Internal server error') => {
    console.error('Error:', error);

    const message = error.message ? `${defaultMessage}: ${error.message}` : defaultMessage;

    return {
        error: true,
        status: 500,
        message: message,
    };
};