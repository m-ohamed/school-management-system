module.exports = {
    createClassroom: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'description'
        },
        {
            model: 'school',
            required: true
        },
        {
            model: 'students'
        },
    ],
    updateClassroom: [
        {
            model: 'name',
        },
        {
            model: 'description'
        },
        {
            model: 'school',
        },
        {
            model: 'students'
        },
    ],
}