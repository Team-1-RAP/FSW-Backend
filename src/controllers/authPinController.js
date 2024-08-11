import Account from '../models/account.js';
import FlagUser from '../models/flagUser.js';
import Customer from '../models/customer.js';
import { formatToJakartaTime } from '../utils/dateUtils.js';

export const changePin = async (req, res) => {
  const { atm_card_no, pin, confirmPin } = req.body;

  try {
    if (!atm_card_no || !pin || !confirmPin) {
      return res.status(400).json({
        code: 400,
        message: 'Atm card number, new pin and confirmation your new pin needed',
        data: null,
      });
    }

    if (pin !== confirmPin) {
      return res.status(400).json({
        code: 400,
        message: 'Pin does not match',
        data: null,
      });
    }
    const account = await Account.findOne({ where: { atm_card_no: atm_card_no } });

    if (!account) {
      return res.status(400).json({
        code: 400,
        message: 'Account not found',
        data: null,
      });
    }

    const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

    if (!flagUser || flagUser.is_verified !== true) {
      return res.status(400).json({
        code: 400,
        message: 'OTP verification not completed or failed',
        data: null,
      });
    }
    const customer = await Customer.findOne({ where: { id: account.userId } });

    await FlagUser.update(
      {
        is_card_valid: null,
        is_birth_valid: null,
        is_email_valid: null,
        is_verified: null,
        is_new_password: null,
        otp: null,
        otp_expired_date: null,
        is_new_pin: null,
      },
      { where: { customer_id: account.userId } }
    );
    await Account.update(
      {
        pin: pin,
        pin_attempts: 0
      },
      { where: { user_id: flagUser.customer_id } }
    );

    const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

    const { updated_at: updatedFlagUserUpdatedAt } = updatedFlagUser;
    const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);

    return res.status(200).json({
      code: 200,
      message: 'New pin succes, please use your new PIN for transactions',
      data: {
        atm_card_no: account.atm_card_no,
        account_no: account.no,
        customer_id: customer.id,
        account_type: account.accountType,
        balance: account.balance,
        customer_data: {
          id: customer.id,
          username: customer.username,
          fullname: customer.fullname,
          email: customer.email,
          born_date: customer.bornDate,
        },
        flag_user: {
          is_card_valid: updatedFlagUser.is_card_valid,
          is_birth_valid: updatedFlagUser.is_birth_valid,
          is_email_valid: updatedFlagUser.is_email_valid,
          is_verified: updatedFlagUser.is_verified,
          is_new_pin: updatedFlagUser.is_new_pin,
          updated_at: updatedAtFormatted,
        },
        otp_code: {
          otp: updatedFlagUser.otp,
          otp_expired_date: null,
        },
      },
      stepValidation: 5,
      created_date: account.createdDate,
    });
  } catch (error) {
    console.error('Error during saving password:', error);
    return res.status(500).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
};
