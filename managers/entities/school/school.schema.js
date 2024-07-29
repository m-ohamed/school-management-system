module.exports = {
    createSchool: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'description',
        },
        {
            model: 'admin',
            required: true
        }
    ],
    updateSchool: [
        {
            model: 'name'
        },
        {
            model: 'description',
        },
        {
            model: 'admin',
        }
    ]
}