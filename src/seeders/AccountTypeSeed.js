import AccountTypes from "../models/AccountTypes.js";

const AccountTypeSeed = async () => {
    try {
        await AccountTypes.destroy({ where: {} });

        await AccountTypes.bulkCreate([
            {
                code: '10',
                type: 'BRONZE',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                code: '20',
                type: 'GOLD',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                code: '30',
                type: 'bronze',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);

        console.log('Data seeding completed successfully')
    } catch (error){
        console.log('Error seeding data', error);
    }
};

AccountTypeSeed();