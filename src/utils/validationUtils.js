import Customer from "../models/Customers.js";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_FORMAT = /^(?!\d+$)[A-Za-z0-9]{6,}$/;
const PASSWORD_FORMAT = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
const PIN_FORMAT = /^[0-9]{6}$/;
const NIK_FORMAT = /^[0-9]{16}$/;

export const validateEmail = (email) => EMAIL_FORMAT.test(email);

export const validateUsername = (username) => USERNAME_FORMAT.test(username);

export const validatePassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return { valid: false, message: 'Password and confirm password do not match' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!PASSWORD_FORMAT.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter, one number, and one special character or symbol' };
    }
    return { valid: true };
};

export const validatePin = (pin, confirmPin) => {
    if (pin !== confirmPin) {
        return { valid: false, message: 'Pin and confirm pin do not match' };
    }
    if (!PIN_FORMAT.test(pin)) {
        return { valid: false, message: 'Pin must be at least 6 digits' };
    }
    return { valid: true };
};

export const validateNik = async (nik) => {
    if (nik.length !== 16) {
        return { valid: false, message: 'NIK must be exactly 16 digits', status: false, data: null };
    }
    if (!NIK_FORMAT.test(nik)) {
        return { valid: false, message: 'NIK must only number', status: false, data: null };
    }

    const existingNik = await Customer.findOne({ where: { nik } });
    if (existingNik) {
        return { valid: false, message: 'NIK already exists', status: false, data: null };
    }
    return { valid: true };
};