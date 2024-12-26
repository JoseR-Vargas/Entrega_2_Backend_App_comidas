import Controller from "./index.js";
import { usersService } from "../services/index.js";
import { verifyUser } from "../services/sessions.service.js"

class AuthController extends Controller {
  constructor(service) { super(service) }
  register = async (req, res) => {
    const { _id } = req.user;
    const message = "User Registered!";
    return res.json201(_id, message);
  };
  login = async (req, res) => {
    const { token } = req.user;
    const opts = { maxAge: 60 * 60 * 24 * 7 * 1000, httpOnly: true };
    const message = "User logged in!";
    return res.cookie("token", token, opts).json200("OK", message);
  };
  signout = (req, res) => {
    const message = "User signed out!";
    return res.clearCookie("token").json200("OK", message);
  };
  onlineToken = (req, res) => {
    return res.status(200).json({
      message: req.user.email.toUpperCase() + " IS ONLINE",
      online: true,
    });
  };
  verify = async (req, res) => {
      const { email, verifyCode } = req.body
      const response = await verifyUser(email, verifyCode)
      if(response) {
        const message = "User Verified"
        return res.json200("Ok", message)
      } else {
        return res.json401()
      }
      
  }
}

const controller = new AuthController(usersService);
const { createOne, readOne, readAll, updateOne, destroyOne, register, login, signout, onlineToken, verify } = controller;
export { createOne, readOne, readAll, updateOne, destroyOne, register, login, signout, onlineToken, verify };