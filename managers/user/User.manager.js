const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = class UserManager { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.httpExposed         = ['login'];
    }

    async createUser({email, password, role, school}) {
        let result = await this.validators.user.createUser({email, password, role});
        if(result) return { ok: false, code: 400, errors: result };

        const encryptedPassword     = await this.encryptPassword(password);
        const user                  = {email, password: encryptedPassword, role, school};

        let dbUser = await this.mongomodels.user.findOne({ email });
        if (dbUser) {
            return { ok: false, code: 400, errors: 'bad request', message: 'email is already registered' };
        }
        
        dbUser = await this.mongomodels.user.create(user);        

        return {
            id: dbUser._id, email: dbUser.email, role: dbUser.role
        };
    }

    async encryptPassword(password) {
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * @swagger
     * /user/login:
     *   post:
     *     summary: Login to the system
     *     description: Authenticates a user and returns a token
     *     tags:
     *       - Users
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
     *         description: Login successful
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
     *                     longToken:
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
     *         description: Invalid email or password
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
    async login({email, password}) {
        let result = await this.validators.user.login({email, password});
        if(result) return { ok: false, code: 400, errors: result };

        const user = await this.mongomodels.user.findOne({ email });

        if (!user) {
            return { ok: false, code:400, errors: 'bad request', message: 'there is no user registered with this email' };
        }
        
        if (!await bcrypt.compare(password, user.password)) {
            return { ok: false, code:401, errors: 'unauthorized', message: 'incorrect email or password' };
        }

        let longToken = this.tokenManager.genLongToken({userId: user._id, email: user.email, role: user.role, userKey: user.key });

        return { longToken };
    }

}
