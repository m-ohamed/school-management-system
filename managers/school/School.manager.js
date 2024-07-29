const { default: mongoose } = require("mongoose");

module.exports = class SchoolManager {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.schoolsCollection     = "schools";
        this.httpExposed         = ['createSchool', 'get=getSchool', 'patch=updateSchool', 'delete=deleteSchool'];
    }

    /**
     * @swagger
     * /school/createSchool:
     *   post:
     *     summary: Create a new school
     *     description: Creates a new school with the provided name, description, and admin
     *     tags:
     *       - Schools
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
     *               admin:
     *                 type: string
     *                 format: objectId
     *     responses:
     *       200:
     *         description: School created successfully
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
     *                     admin:
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
    async createSchool({__longToken, __superadmin, name, description, admin}) {
        let result = await this.validators.school.createSchool({name, description, admin});
        if (result) return { ok: false, code: 400, errors: result };

        let schoolDb = await this.mongomodels.school.findOne({ name });
        if (schoolDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'a school with this name already exists' };
        }

        let adminDb = await this.mongomodels.user.findById(admin);
        if (!adminDb || (adminDb.role !== 'admin' && adminDb.role !== 'superadmin')) {
            return { ok: false, code: 403, errors: 'forbidden', message: 'this user is not an admin' };
        }

        return this.mongomodels.school.create({name, description, admin});
    }

    /**
     * @swagger
     * /school/getSchool/{schoolId}:
     *   get:
     *     summary: Get a school by ID
     *     description: Retrieves a school by its ID
     *     tags:
     *       - Schools
     *     parameters:
     *       - in: path
     *         name: schoolId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: School retrieved successfully
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
     *                     admin:
     *                       type: string
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
    async getSchool({__longToken, __admin, __objectid}) {
        const schoolId = __objectid;

        let schoolDb = await this.mongomodels.school.findById(schoolId);
        if (!schoolDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'school not found' };
        } else if ((__longToken.role === 'admin' && schoolDb?.admin.toString() !== __longToken.userId) || __longToken.role !== 'superadmin') {
            return { ok: false, code: 403, errors: 'forbidden', message: 'access denied' };
        }

        return schoolDb;
    }

    /**
     * @swagger
     * /school/updateSchool/{schoolId}:
     *   patch:
     *     summary: Update a school
     *     description: Updates a school with the provided name, description, and admin
     *     tags:
     *       - Schools
     *     parameters:
     *       - in: path
     *         name: schoolId
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
     *               admin:
     *                 type: string
     *                 format: objectId
     *     responses:
     *       200:
     *         description: School updated successfully
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
     *                     admin:
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
    async updateSchool({__longToken, __superadmin, __objectid, name, description, admin}) {
        const schoolId = __objectid;
        const result = await this.validators.school.updateSchool({name, description, admin});
        if (result) return { ok: false, code: 400, errors: result };

        const schoolDb = await this.mongomodels.school.findById(schoolId).populate(['admin']);
        if (!schoolDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'no school with this id exists' };
        }

        if (admin) {
            let adminDb = await this.mongomodels.user.findById(admin);
            if (!adminDb || (adminDb.role !== 'admin' && adminDb.role !== 'superadmin')) {
                return { ok: false, code: 403, errors: 'forbidden', message: 'this user is not an admin' };
            }
        }

        if (name) {
            const school = await this.mongomodels.school.findOne({ name });
            if (school) {
                return { ok: false, code: 400, errors: 'bad request', message: 'a school with this name already exists' };
            }
        }
        
        return this.mongomodels.school.findByIdAndUpdate(schoolId, {
            $set: {name, description, admin}
        }, { new: true, runValidators: true });
    }

    /**
     * @swagger
     * /school/deleteSchool/{schoolId}:
     *   delete:
     *     summary: Delete a school
     *     description: Deletes a school by its ID
     *     tags:
     *       - Schools
     *     parameters:
     *       - in: path
     *         name: schoolId
     *         required: true
     *         schema:
     *           type: string
     *           format: objectId
     *     responses:
     *       200:
     *         description: School deleted successfully
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
     */
    async deleteSchool({__longToken, __superadmin, __objectid}) {
        const schoolId = __objectid;

        const schoolDb = await this.mongomodels.school.findById(schoolId);
        if (!schoolDb) {
            return { ok: false, code: 400, errors: 'bad request', message: 'no school with this id exists' };
        }

        return this.mongomodels.school.deleteOne({_id: schoolId});
    }
}