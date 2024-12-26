import { usersRepository } from "../repositories/index.js"
import Service from "./index.js"

class SessionsService extends Service {
    constructor (repository){
        super(repository)
    }
    verifyUser = async (email, verifyCodeFromClient) => {
        const user = await this.repository.readByEmail(email)
        const verifyCodeFromDatabase = user.verifyCode
        if(verifyCodeFromClient === verifyCodeFromDatabase) {
            await this.repository.updateOne(user._id, { verify: true })
            return true
        }
        return false
    }
}

const service = new SessionsService(usersRepository)
const { verifyUser } = service
export { verifyUser};