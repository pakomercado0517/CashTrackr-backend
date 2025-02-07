import { createRequest, createResponse } from "node-mocks-http";
import User from "../../../models/User";
import { AuthController } from "../../../controllers/AuthController";
import { comparePassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmails";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User")
jest.mock("../../../utils/auth")
jest.mock("../../../utils/token")
jest.mock("../../../utils/jwt")

describe("AuthController.createAccount", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should return a 409 status and an error message if the email is already registered", async ()=> {

    (User.findOne as jest.Mock).mockResolvedValue(true)
    
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create_account",
      body: { email: "test@email.com", poassword: "password"}
    })

    const res = createResponse()
    await AuthController.createAccount(req, res)
    const data = res._getJSONData()

    expect(res.statusCode).toBe(409)
    expect(data).toHaveProperty("error", "El email ya está registrado en el sistema")
    expect(User.findOne).toHaveBeenCalled()
    expect(User.findOne).toHaveBeenCalledTimes(1)
  })
  it("should register a new user and return a success message", async ()=> {
    
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create_account",
      body: { email: "test@email.com", poassword: "password", name: "test"}
    })

    const res = createResponse();

    const mockUser = {...req.body, save: jest.fn()};

    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockResolvedValue("hashedpassword");
    (generateToken as jest.Mock).mockReturnValue("123456")
    jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve())

    await AuthController.createAccount(req, res)
    const data = res._getJSONData()

    expect(res.statusCode).toBe(201)
    expect(data).toHaveProperty("message", "Usuario registrado con éxito")
    expect(mockUser.save).toHaveBeenCalled()
    expect(mockUser.password).toBe("hashedpassword")
    expect(mockUser.token).toBe("123456")
    expect(hashPassword).toHaveBeenCalled()
    expect(generateToken).toHaveBeenCalled()
    expect(User.create).toHaveBeenCalled()
    expect(User.create).toHaveBeenCalledWith(req.body)
    expect(User.create).toHaveBeenCalledTimes(1)
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      name: req.body.name,
      email: req.body.email,
      token:"123456"
    })
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
  })
})

describe("AuthController.login", ()=> {
  it("should handle not finded user and return an error message", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: { email: "test@email.com", password: "password"}
    });

    (User.findOne as jest.Mock).mockResolvedValue(null) 

    const res = createResponse();

    await AuthController.login(req, res)
    const data = res._getJSONData()

      expect(res.statusCode).toBe(404)
      expect(data).toEqual({error: "Usuario no registrado en el sistema"})
  })

  it("should return status 403 if user doesnt confirm his account", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: { email: "test@email.com", password: "password"}
    });

    const mockAuth = {...req.user, confirmed: false};
    (User.findOne as jest.Mock).mockResolvedValue(mockAuth)

    const res = createResponse();

    await AuthController.login(req, res)
    const data = res._getJSONData()

    expect(res.statusCode).toBe(403)
    expect(data).toHaveProperty("error", "Necesitas confirmar tu cuenta para poder iniciar sesión")
  })

  it("should return status 401 if user have wrong password", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: { email: "test@email.com", password: "password"}
    });
    
    const mockAuth =  {...req.body, confirmed: true};
    (User.findOne as jest.Mock).mockResolvedValue(mockAuth);
    (comparePassword as jest.Mock).mockResolvedValue(false);

    const res = createResponse();

    await AuthController.login(req, res)

    const data = res._getJSONData()

    expect(res.statusCode).toBe(401)
    expect(data).toEqual({error: "La contraseña es incorrecta"})
    expect(comparePassword).toHaveBeenCalled()
    expect(comparePassword).toHaveBeenCalledTimes(1)
    expect(comparePassword).toHaveBeenCalledWith(req.body.password, mockAuth.password)
  })

  it("should handle confirmed and gettin password correct, return token and success message", async ()=> {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: { email: "test@email.com", password: "password"}
    });
    
    const fakeJWT = "fake_JWT";
    const mockAuth =  {...req.body, confirmed: true};
    (User.findOne as jest.Mock).mockResolvedValue(mockAuth);
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fakeJWT)

    const res = createResponse();

    await AuthController.login(req, res)
    const data = res._getJSONData()

    expect(res.statusCode).toBe(200)
    expect(data).toEqual({message: "Inicio de sesión correcto", token: fakeJWT})
    expect(generateJWT).toHaveBeenCalled()
    expect(generateJWT).toHaveBeenCalledTimes(1)
    expect(generateJWT).toHaveBeenCalledWith(mockAuth.id)
  })
})