import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

@Resolver(User)
export class UserResolver {
    usersRepository = getRepository(User);

    constructor() { }

    @Authorized(['admin'])
    @Query(returns => [User])
    async users() {
        return this.usersRepository.find();
    }

    @Mutation(returns => String, { nullable: true })
    public async signout() {

    }

    @Mutation(returns => String, { nullable: true })
    public async activateAccount() {

    }

    @Mutation(returns => String, { nullable: true })
    public async signin(
        @Ctx() ctx,
        @Arg("email") email: string,
        @Arg("password") password: string,
    ) {
        const user = await this.usersRepository.findOne({
            email
        });

        if (user) {
            try {
                if (await argon2.verify(user.password, password)) {
                    // password match
                    const token = jwt.sign(
                        { userId: user.id },
                        process.env.JWT_SECRET,
                        { expiresIn: 300 }
                    );
                    
                    // set in cookie
                    ctx.res.cookie('token', token);

                    // and return the token for localstorage/asyncstorage if needed
                    return token;
                } else {
                    return null;
                }
            } catch (err) {
                return null;
            }
        } else {
            return null;
        }
    }

    @Mutation(returns => User)
    public async createUser(
        @Arg("email") email: string,
        @Arg("password") password: string,
    ): Promise<User> {
        const newUser = new User();

        try {
            const hash = await argon2.hash(password);
            newUser.password = hash;
            newUser.email = email;
            newUser.state = 'active'; // pending, active, banned
            newUser.role = 'admin';
            newUser.createdAt = new Date().toISOString();

            await newUser.save();

            //return UserController.createUser(email, password);
            return newUser;
        } catch (err) {
            return null;
        }
    }
}