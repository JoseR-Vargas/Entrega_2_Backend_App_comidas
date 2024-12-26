import passport from "passport";
import crypto from "crypto";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { createHashUtil, verifyHashUtil } from "../utils/hash.util.js";
import { createTokenUtil } from "../utils/token.util.js";
import { usersRepository } from "../repositories/index.js";
import sendSms from "../utils/twilio.util.js";
import { sendVerifyEmail } from "../utils/nodemailer.utils.js";

passport.use(
  "register",
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    async (req, email, password, done) => {
      try {
        const one = await usersRepository.readByEmail(email);
        if (one) {
          const info = { message: "User already exists!", statusCode: 401 };
          return done(null, false, info);
        }
        const hashedPassword = createHashUtil(password);
        const verifyCode = crypto.randomBytes(12).toString("hex")
        const user = await usersRepository.createOne({
          email,
          password: hashedPassword,
          name: req.body.name || "Default Name",
          verifyCode
        });
        await sendVerifyEmail({ to: email, verifyCode })
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await usersRepository.readByEmail(email);
        if (!user) {
          // const error = new Error("USER NOT FOUND");
          // error.statusCode = 401;
          // return done(error);
          const info = { message: "User not found!", statusCode: 401 };
          return done(null, false, info);
        }
        if (!user.verify){
          const info = {message: "You need to verify your account"}
          return done(null, false,info);
        }
        const passwordForm = password; /* req.body.password */
        const passwordDb = user.password;
        const verify = verifyHashUtil(passwordForm, passwordDb);
        if (!verify) {
          // const error = new Error("INVALID CREDENTIALS");
          // error.statusCode = 401;
          // return done(error);
          const info = { message: "Invalid credentials", statusCode: 401 };
          return done(null, false, info);
        }
        const data = {
          user_id: user._id,
          role: user.role,
        };
        const token = createTokenUtil(data);
        user.token = token;
        await usersRepository.updateOne(user._id, { isOnline: true });
        return done(null, user);
      } catch (error) {
        console.log(error);
        
        return done(error);
      }
    }
  )
);
passport.use(
  "online",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.token]),
      secretOrKey: process.env.SECRET_KEY,
    },
    async (data, done) => {
      try {
        const { user_id } = data;
        const user = await usersRepository.readOne(user_id);
        const { isOnline } = user;
        if (!isOnline) {
          // const error = new Error("USER IS NOT ONLINE");
          // error.statusCode = 401;
          // return done(error);
          const info = { message: "User is not online", statusCode: 401 };
          return done(null, false, info);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.use(
  "signout",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.token]),
      secretOrKey: process.env.SECRET_KEY,
    },
    async (data, done) => {
      try {
        const { user_id } = data;
        await usersRepository.updateOne(user_id, { isOnline: false });
        return done(null, { user_id: null });
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;