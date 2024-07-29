module.exports = class StudentManager {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.validators = validators;
        this.usersManager = managers.user;
        this.mongomodels = mongomodels;
        this.httpExposed = ['createStudent', 'get=getStudent', 'get=getStudentsByClassroomId', 'patch=updateStudent', 'delete=deleteStudent'];
    }

    /**
     * @swagger
     * /student/createStudent:
     *   post:
     *     summary: Create a new student
     *     description: Creates a new student with the provided email, password, and school
     *     tags:
     *       - Students
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 format: password
     *               school:
     *                 type: string
     *                 format: objectId
     *     responses:
     *       200:
     *         description: Student created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     email:
     *                       type: string
     *                     role:
     *                       type: string
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Invalid request body
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     */
    async createStudent({ __longToken, __admin, email, password, school }) {
        let result = await this.validators.student.createStudent({ school });
        if (result) return { ok: false, code: 400, errors: result };

        return this.usersManager.createUser({ email, password, school, role: 'student' });
    }

    /**
     * @swagger
     * /student/getStudent/{studentId}:
     *   get:
     *     summary: Get a student by ID
     *     description: Retrieves a student by its ID
     *     tags:
     *       - Students
     *     parameters:
     *       - in: path
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: Student retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     email:
     *                       type: string
     *                     role:
     *                       type: string
     *                     school:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         name:
     *                           type: string
     *                         description:
     *                           type: string
     *                         admin:
     *                           type: string
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Student not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     */
    async getStudent({ __longToken, __objectid }) {
        const studentId = __objectid;

        const studentDb = await this.mongomodels.user.findById(studentId).populate('school');
        if (!studentDb ||
             (__longToken.role !== 'superadmin' && __longToken.userId !== studentDb.school?.admin.toString())
             || (studentDb._id.toString() !== __longToken.userId && __longToken.role === 'student')
           ) {
            return { ok: false, code: 400, errors: 'bad request', message: 'student not found' };
        }

        studentDb.password = undefined;

        return studentDb;
    }

    /**
     * @swagger
     * /student/getStudentsByClassroomId/{classroomId}:
     *   get:
     *     summary: Get a student by classroom ID
     *     description: Retrieves a student by their classroom ID
     *     tags:
     *       - Students
     *     parameters:
     *       - in: path
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: Students retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                       email:
     *                         type: string
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Students not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       403:
     *         description: Insufficient access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     */
    async getStudentsByClassroomId({ __longToken, __admin, __objectid }) {
        const classroomId = __objectid;
        const classroomDb = await this.mongomodels.classroom.findById(classroomId).populate([{ path: 'students', select: '_id email' }, { path: 'school', type: 'School' }]);

        if (!classroomDb || !classroomDb.school) {
            return { ok: false, code: 400, errors: 'bad request', message: 'incorrect classroom id' };
        }

        if (classroomDb.school?.admin?.toString() !== __longToken.userId && __longToken.role !== 'superadmin') {
            return { ok: false, code: 403, errors: 'forbidden', message: 'access denied' };
        }

        return classroomDb.students;
    }

    /**
     * @swagger
     * /student/updateStudent/{studentId}:
     *   patch:
     *     summary: Update a student's information
     *     description: Updates a student's email, password, and/or school affiliation
     *     tags:
     *       - Students
     *     parameters:
     *       - in: path
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               school:
     *                 type: string
     *                 format: objectId
     *     responses:
     *       200:
     *         description: Student updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     email:
     *                       type: string
     *                     role:
     *                       type: string
     *                     school:
     *                       type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Invalid request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     */
    async updateStudent({ __longToken, __objectid, email, password, school }) {
        const studentId = __objectid;

        let result = await this.validators.student.updateStudent({ email, password, school });
        if (result) return { ok: false, code: 400, errors: result };

        const studentDb = await this.mongomodels.user.findById(studentId).populate('school');
        if (!studentDb ||
            (__longToken.role !== 'superadmin' && __longToken.userId !== studentDb.school?.admin.toString())
            || (studentDb._id.toString() !== __longToken.userId && __longToken.role === 'student')
          ) {
            return { ok: false, code: 400, errors: 'bad request', message: 'student not found' };
        }

        if (password) {
            password = await this.usersManager.encryptPassword(password);
        }

        if (email) {
            const student = await this.mongomodels.user.findOne({ email });
            if (student) {
                return { ok: false, code: 400, errors: 'bad request', message: 'a student with this email already exists' };
            }
        }

        return this.mongomodels.user.findByIdAndUpdate(studentId, {
            $set: { email, password, school }
        }, { new: true, select: { password: 0 } });
    }

    /**
     * @swagger
     * /student/deleteStudent/{studentId}:
     *   delete:
     *     summary: Delete a student
     *     description: Deletes a student by their ID
     *     tags:
     *       - Students
     *     parameters:
     *       - in: path
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: Student deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     acknowledged:
     *                       type: boolean
     *                     deletedCount:
     *                       type: number
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Student not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       403:
     *         description: Insufficient access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     */
    async deleteStudent({ __longToken, __admin, __objectid }) {
        const studentId = __objectid;

        const studentDb = await this.mongomodels.user.findById(studentId).populate('school');
        if (!studentDb || studentDb.role !== 'student') {
            return { ok: false, code: 400, errors: 'bad request', message: 'student not found' };
        }

        if (!studentDb ||
            (__longToken.role !== 'superadmin' && __longToken.userId !== studentDb.school?.admin.toString())
          ) {
            return { ok: false, code: 403, errors: 'forbidden', message: 'access denied' };
        }

        return this.mongomodels.user.deleteOne({ _id: studentId });
    }
}