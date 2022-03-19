import { ApolloServer, gql } from 'apollo-server';

import pg from 'pg'
const { Pool } = pg;

const users = [
    
];

//schema
const typeDefs = gql`
    type Query {
        users: [User]
        user(numroom: String): User
    }
    type User {
        numroom: String
        name: String
        last: String
        gender: String
        phone: String
        address: String
        date: String
    }
    type Mutation{
        addUser(numroom: String, name: String, last: String, gender: String, phone: String, address: String, date: String): User
    }
`;

//resolve
const resolvers = {
    Query: {
        //all user
        users: async(parent, args, {db}, info) => {
            const sql = 'SELECT * FROM users ORDER BY numroom ASC';
            try{
                const result = await db.query(sql);
                console.log(result.rows)
                return result.rows
            }catch(err){
                console.log(err.stack)
            }
            return null;
        },
        //some user
        user: async(parent, {numroom}, {db}, info) => {
            const values = [numroom];

            const query = {
                text: 'SELECT * FROM users WHERE numroom = $1',
                values: values,
            };
            const res = await db.query(query);
            const {name,last,gender,phone,address,date} = res.rows[0];
            return res.rows[0];
        },

    },
    Mutation: {
        addUser: async(parent, args,{db}, info) => {
            const { numroom , name ,last,gender,phone,address,date} = args;
            const sql = 'INSERT INTO users VALUES($1,$2,$3,$4,$5,$6,$7)'
            const values = [numroom,name,last,gender,phone,address,date]

            await db.query(sql,values,(err, res) => {
                console.log(err, res)
            })
            return { numroom: numroom, name: name, last: last, gender: gender, phone: phone, address: address, date: date };

        }
    }
};

//function apollo-server
const startApolloServer = async (typeDefs, resolvers) => {
    const db = new Pool({
        host: 'db',
        user: 'postgres',
        password: 'example',
        database: 'pornthip'
    });
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers,
        //addnew
        context: ({req})=>{
            return {users,db};
        }
    });
    const { url } = await server.listen();
    console.log(`Server ready at ${url}`);
};
//
//call function
startApolloServer(typeDefs, resolvers);
