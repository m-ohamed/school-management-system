module.exports = {
    createStudent: [
        {
            model: 'school',
            required: true,
        }
    ],
    updateStudent: [
        {
            model: 'email',
        },
        {
            model: 'password',
        },
        {
            model: 'school'
        },
    ]
}