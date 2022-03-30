import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { customAuthChecker } from "./auth";
import cookie from 'cookie';

const PORT = process.env.PORT || 4000;

const initialize = async () => {
    await createConnection({
        type: "mysql",
        host: "mysql",
        port: 3306,
        username: "root",
        password: "supersecret",
        database: "test",
        entities: [
            __dirname + "/entities/*.js"
        ],
        synchronize: true,
    });

    const schema = await buildSchema({
        resolvers: [__dirname + "/resolvers/*.{ts,js}"],
        authChecker: customAuthChecker
    });

    const server = new ApolloServer({
        schema,
        playground: true,
        context: ({ req, res }) => {
            const authorization = req.headers['authorization'];
            // Bearer ...token
            const cookies = req.headers['cookie'];
            const parsedCookies = cookie.parse(cookies);
            
            let token = null;

            if(authorization && authorization?.startsWith('Bearer ')) {
                token = authorization.replace('Bearer ', '');
            } else if(parsedCookies.token) {
                token = parsedCookies.token;
            }

            console.log(token)
            
            return {
                token,
                user: null,
                res
            };
        }
    });

    const { url } = await server.listen(PORT);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
};

initialize();
