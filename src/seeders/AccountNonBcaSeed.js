import AccountNonBca from "../models/AccountNonBca.js";

const AccountNonBcaSeed = async () => {
    try {
        await AccountNonBca.destroy({ where: {} });

        await AccountNonBca.bulkCreate([
            {
                no_non_bca: '239047281',
                created_date: new Date(),
                updated_date: new Date(),
                deleted_date: null,
                account_type: 'Silver',
                balance: 3250000,
                atm_card_no: '290174221',
                exp_date: new Date('2025-12-31'),
                bank_id: 2,
            },
            {
                no_non_bca: '729418712',
                created_date: new Date(),
                updated_date: new Date(),
                deleted_date: null,
                account_type: 'Platinum',
                balance: 3250000,
                atm_card_no: '6739299230',
                exp_date: new Date('2025-12-31'),
                bank_id: 3,
            },
            {
                no_non_bca: '561102836',
                created_date: new Date(),
                updated_date: new Date(),
                deleted_date: null,
                account_type: 'Silver',
                balance: 3250000,
                atm_card_no: '902461833',
                exp_date: new Date('2025-12-31'),
                bank_id: 4,
            },
            {
                no_non_bca: '921753015',
                created_date: new Date(),
                updated_date: new Date(),
                deleted_date: null,
                account_type: 'Gold',
                balance: 3250000,
                atm_card_no: '732115920',
                exp_date: new Date('2025-12-31'),
                bank_id: 5,
            },
            {
                no_non_bca: '179203482',
                created_date: new Date(),
                updated_date: new Date(),
                deleted_date: null,
                account_type: 'Gold',
                balance: 3250000,
                atm_card_no: '551892041',
                exp_date: new Date('2025-12-31'),
                bank_id: 6,
            },
            {
                no_non_bca: '309271375',
                created_date: new Date(),
                updated_date: new Date(),
                deleted_date: null,
                account_type: 'Silver',
                balance: 3250000,
                atm_card_no: '621238199',
                exp_date: new Date('2025-12-31'),
                bank_id: 7,
            },

        ]);
        
        console.log('Data seeding completed successfully');
    } catch (error){
        console.log('Error seeding data:', error);
    }
};

AccountNonBcaSeed();