import { Request, Response, NextFunction } from "express"
import { verifyJWT } from "../utils/jwt"
import User from "../models/User"

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization
    if(!bearer) {
      const error = new Error("Usuario no autorizado")
      res.status(401).json({error: error.message})
      return
    }
    const [, token ] = bearer.split(" ")
    if(!token) {
      const error = new Error("Usuario no autorizado")
      res.status(401).json({error: error.message})
      return
    }
    try {
      const payload = verifyJWT(token)
      if(typeof payload === "object" && payload.id) {
        const user = await User.findByPk(payload.id, {
          attributes: ["id", "name", "email"]
        })
        if(user){
          req.user = user
        }
        next()
      }
    } catch (error) {
      res.status(500).json({error: error.message})
    }
}