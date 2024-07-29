module.exports = class ClassroomManager {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config                 = config;
        this.validators             = validators; 
        this.mongomodels            = mongomodels;
        this.classroomsCollection   = "classrooms";
        this.httpExposed            = ['createClassroom', 'get=getClassroom', 'get=getAllClassroomsBySchoolId', 'patch=updateClassroom', 'delete=deleteClassroom'];
    }

    /**
     * @swagger
     * /classroom/createClassroom:
     *   post:
     *     summary: Create a new classroom
     *     description: Creates a new classroom with the provided name, description, school, and students
     *     tags:
     *       - Classrooms
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               school:
     *                 type: string
     *                 format: objectId
     *               students:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: objectId
     *     responses:
     *       200:
     *         description: Classroom created successfully
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
     *                     name:
     *                       type: string
     *                     description:
     *                       type: string
     *                     school:
     *                       type: string
     *                     students:
     *                       type: array
     *                       items:
     *                         type: string
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
     *       403:
     *         description: Insufficient Access
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
    async createClassroom({__longToken, __admin, name, description, school, students}) {
        let result = await this.validators.classroom.createClassroom({name, description, school, students});
        if (result) return { ok: false, code: 400, errors: result };

        const schoolDb = await this.mongomodels.school.find({ _id: school });
        if (!schoolDb || (schoolDb.admin !== __longToken.userId && __longToken.role !== 'superadmin')) {
            return { ok: false, code: 403, errors: 'forbidden', message: 'access denied' };
        }

        const classroomDb = await this.mongomodels.classroom.findOne({school, name});
        if (classroomDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'a classroom in this school with this name already exists' };
        }


        return this.mongomodels.classroom.create({name, description, school, students});
    }

    /**
     * @swagger
     * /classroom/getClassroom/{classroomId}:
     *   get:
     *     summary: Get a classroom by ID
     *     description: Retrieves a classroom by its ID
     *     tags:
     *       - Classrooms
     *     parameters:
     *       - in: path
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: Classroom retrieved successfully
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
     *                     name:
     *                       type: string
     *                     description:
     *                       type: string
     *                     school:
     *                       type: object
     *                     students:
     *                       type: array
     *                       items:
     *                         type: string
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
     *       403:
     *         description: Insufficient Access
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
    async getClassroom({__longToken, __admin, __objectid}) {
        const classroomId = __objectid;
        
        const classroomDb = await this.mongomodels.classroom.find({ _id: classroomId }).populate('school');
        if (!classroomDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'invalid classroom id' };
        }

        if (classroomDb.school?.admin !== __longToken.userId && __longToken.role !== 'superadmin') {
            return { ok: false, code: 403, errors: 'forbidden', message: 'access denied' };
        }

        return classroomDb;
    }

    /**
     * @swagger
     * /classroom/getAllClassroomsBySchoolId/{schoolId}:
     *   get:
     *     summary: Get all classrooms for a school
     *     description: Retrieves all classrooms for a school by its ID
     *     tags:
     *       - Classrooms
     *     parameters:
     *       - in: path
     *         name: schoolId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: Classrooms retrieved successfully
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
     *                       name:
     *                         type: string
     *                       description:
     *                         type: string
     *                       school:
     *                         type: object
     *                       students:
     *                         type: array
     *                         items:
     *                           type: string
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: School not found
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
     *         description: Access denied
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
    async getAllClassroomsBySchoolId({__longToken, __admin, __objectid}) {
        const schoolId = __objectid;
        
        const schoolDb = await this.mongomodels.school.find({ school: schoolId });
        if (!schoolDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'invalid school id' };
        }

        if (schoolDb.admin !== __longToken.userId && __longToken.role !== 'superadmin') {
            return { ok: false, code: 403, errors: 'forbidden', message: 'access denied' };
        }

        return this.mongomodels.classroom.find({school: schoolId});
    }

    /**
     * @swagger
     * /classroom/updateClassroom/{classroomId}:
     *   patch:
     *     summary: Update a classroom
     *     description: Updates a classroom with the provided name, description, school, and students
     *     tags:
     *       - Classrooms
     *     parameters:
     *       - in: path
     *         name: classroomId
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
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               school:
     *                 type: string
     *                 format: objectId
     *               students:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: objectId
     *     responses:
     *       200:
     *         description: Classroom updated successfully
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
     *                     name:
     *                       type: string
     *                     description:
     *                       type: string
     *                     school:
     *                       type: string
     *                     students:
     *                       type: array
     *                       items:
     *                         type: string
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
     */
    async updateClassroom({__longToken, __admin, __objectid, name, description, school, students}) {
        const classroomId = __objectid;

        let result = await this.validators.classroom.updateClassroom({name, description, school, students});
        if (result) return { ok: false, code: 400, errors: result };

        const classroomDb = await this.mongomodels.classroom.findById(classroomId);
        if (!classroomDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'no classroom with this id exists' };
        }

        if (name) {
            const classroom = await this.mongomodels.classroom.findOne({ name, school: __longToken.schoolId });
            if (classroom) {
                return { ok: false, code: 400, errors: 'bad request', message: 'a school with this name already exists' };
            }
        }

        return this.mongomodels.classroom.findByIdAndUpdate(classroomId, {
            $set: {name, description, school, students}
        }, { new: true });
    }

    /**
     * @swagger
     * /classroom/deleteClassroom/{classroomId}:
     *   delete:
     *     summary: Delete a classroom
     *     description: Deletes a classroom by its ID
     *     tags:
     *       - Classrooms
     *     parameters:
     *       - in: path
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: Classroom deleted successfully
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
    async deleteClassroom({__longToken, __admin, __objectid}) {
        const classroomId = __objectid;

        const classroomDb = await this.mongomodels.classroom.findById(classroomId);
        if (!classroomDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'no classroom with this id exists' };
        }

        return this.mongomodels.classroom.deleteOne({_id: classroomId});
    }
}