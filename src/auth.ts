import { AuthChecker } from "type-graphql";
import { User } from "./entities/User";
import jwt from 'jsonwebtoken';
import { getRepository } from "typeorm";

export const customAuthChecker: AuthChecker<{ token: string | null, user: User | null }> = async (
    { root, args, context, info },
    roles,
) => {
    // here we can read the user from context
    // and check his permission in the db against the `roles` argument
    // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

    if (context.token) {
        try {
            const decoded: any = jwt.verify(context.token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            if(!userId) {
                return false;
            }

            const user = await getRepository(User).findOne(userId);

            if(!user) {
                return false;
            }

            // if no roles provided, just checking the connected state
            if(!roles || roles.length === 0) {
                context.user = user;
                return true;
            } else {
                // or we should match the mandatory roles
                if(roles.includes(user.role) === false) {
                    return false;
                } else {
                    context.user = user;
                    return true;
                }
            }
        } catch (err) {
            return false;
        }
    }

    return false;
};