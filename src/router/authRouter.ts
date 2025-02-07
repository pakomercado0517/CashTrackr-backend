import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import handleInputErrors from "../middlewares/validation";
import { limiter } from "../controllers/limiter";
import { authenticate } from "../middlewares/auth";

const router = Router()

router.use(limiter)

//GET Methods
router.get("/user", authenticate, AuthController.user)

//POST Methods
router.post("/create_account",
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("password").isLength({min:8}).withMessage("El password es muy corto, mínimo es de 8 caracteres"),
  body("email").isEmail().withMessage("Email no válido"),
  handleInputErrors,
  AuthController.createAccount)

router.post("/confirm_account",
  body("token").isLength({min: 6, max: 6}).withMessage("Token no válido"),
  handleInputErrors,
  AuthController.confirmAccount)

router.post("/login", 
  body("email").isEmail().withMessage("Email no válido"),
  body("password").notEmpty().withMessage("El password es obligatorio"),
  handleInputErrors,
  AuthController.login
)

router.post("/forgot_password", 
  body("email").isEmail().withMessage("Email no válido"),
  handleInputErrors,
  AuthController.forgotPassword
)

router.post("/validate_token",
  body("token").notEmpty().isLength({min: 6, max: 6}).withMessage("Token no válido"),
  handleInputErrors,
  AuthController.validateToken
)

router.post("/reset_password/:token",
  param("token").notEmpty().isLength({min: 6, max: 6}).withMessage("Token no válido"),
  body("password").isLength({min:8}).withMessage("El password es muy corto, mínimo es de 8 caracteres"),
  handleInputErrors,
  AuthController.resetPasswordWithToken
)

router.post("/update_password", 
  authenticate, 
  body("current_password").notEmpty().withMessage("El password es obligatorio"),
  body("newPassword").isLength({min:8}).withMessage("La nueva contraseña es muy corta, mínimo es de 8 caracteres"),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
)

router.post("/check_password",
  authenticate,
  body("password").notEmpty().withMessage("El password no puede ir vacio"),
  handleInputErrors,
  AuthController.checkPassword
)
//PUT Methods
//DELETE Methods

export default router