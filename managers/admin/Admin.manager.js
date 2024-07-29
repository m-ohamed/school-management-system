module.exports = class AdminManager { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersManager        = managers.user;
        this.httpExposed         = ['createAdmin'];
    }

    /**
     * @swagger
     * /admin/createAdmin:
     *   post:
     *     summary: Create a new admin user
     *     description: Creates a new admin user with the provided email and password
     *     tags:
     *       - Admins
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
     *     responses:
     *       200:
     *         description: Admin user created successfully
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
    createAdmin({__longToken, __superadmin, email, password}){
        return this.usersManager.createUser({email, password, role: 'admin'});
    }
}
