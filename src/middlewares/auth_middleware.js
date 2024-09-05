import { expressjwt } from 'express-jwt';

// middleware for validating jwt token
export default expressjwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] });