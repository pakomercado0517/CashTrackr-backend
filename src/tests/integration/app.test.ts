import request from "supertest"
import server from "../../server"
import { db } from "../../config/db"
import { AuthController } from "../../controllers/AuthController"
import User from "../../models/User"
import * as authUtils from "../../utils/auth"
import * as jwtUtils from "../../utils/jwt"
import Budget from "../../models/Budget"

afterAll(async () => {
  await db.close()
  server.off
})

describe("Authentication - Create Account", () => {
  it("should display errors when form is empty", async() =>{
    const response = await request(server)
      .post("/api/auth/create_account")
      .send({});
    
    const createAccountMock = jest.spyOn(AuthController, "createAccount")

    expect(response.status).toBe(400)
    expect(createAccountMock).not.toHaveBeenCalled()
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(3)
    expect(response.status).not.toBe(200)
    expect(response.body.errors).not.toHaveLength(2)
  })

  it("should return status 400 when the email is invalid", async() =>{
    const response = await request(server)
      .post("/api/auth/create_account")
      .send({
        "name": "Pako",
        "password": "12345678",
        "email": "pako"
      });
    
    const createAccountMock = jest.spyOn(AuthController, "createAccount")

    expect(response.status).toBe(400)
    expect(createAccountMock).not.toHaveBeenCalled()
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(1)
    expect(response.status).not.toBe(200)
    expect(response.body.errors).not.toHaveLength(2)
  })

  it("should return status 400 when the password is less than 8 characteres", async() =>{
    const response = await request(server)
      .post("/api/auth/create_account")
      .send({
        "name": "Pako",
        "password": "1234567",
        "email": "pako@email.com"
      });
    
    const createAccountMock = jest.spyOn(AuthController, "createAccount")

    expect(response.status).toBe(400)
    expect(createAccountMock).not.toHaveBeenCalled()
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors[0].msg).toBe("El password es muy corto, mínimo es de 8 caracteres")
    expect(response.body.errors).toHaveLength(1)
    expect(response.status).not.toBe(200)
    expect(response.body.errors).not.toHaveLength(2)
  })

  it("should return status 400 when the name is empty", async() =>{
    const response = await request(server)
      .post("/api/auth/create_account")
      .send({
        "name": "",
        "password": "12345678",
        "email": "pako@email.com"
      });
    
    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(createAccountMock).not.toHaveBeenCalled();
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.status).not.toBe(200);
    expect(response.body.errors).not.toHaveLength(2);
  })

  it("should return success message when register is done", async() =>{
    const response = await request(server)
      .post("/api/auth/create_account")
      .send({
        "name": "Pako2",
        "password": "password",
        "email": "pako2@email.com"
      });
    

    expect(response.status).toBe(201);
    expect(response.status).not.toBe(400)
    expect(response.status).not.toHaveProperty("errors")

  })
  it("should return 409 conflict when a user is already registered", async() =>{
    const response = await request(server)
      .post("/api/auth/create_account")
      .send({
        "name": "Pako2",
        "password": "password",
        "email": "pako2@email.com"
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error")
    expect(response.body).toEqual({error: "El email ya está registrado en el sistema"})
    expect(response.status).not.toBe(201)
    expect(response.status).not.toBe(400)
    expect(response.status).not.toHaveProperty("errors")

  })
})

describe("Authentication - Confirm account", () => {
  it("should display errors when token is empty", async() =>{
    const response = await request(server)
      .post("/api/auth/confirm_account")
      .send({token:"not_valid"});
    
    const confirmAccountMock = jest.spyOn(AuthController, "confirmAccount")

    expect(response.status).toBe(400)
    expect(confirmAccountMock).not.toHaveBeenCalled()
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].msg).toBe("Token no válido")
    expect(response.status).not.toBe(200)
    expect(response.body.errors).not.toHaveLength(2)
  })

  it("should return status 401 if token is incorrect", async() =>{
    const response = await request(server)
      .post("/api/auth/confirm_account")
      .send({token:"123456"});
    
    const confirmAccountMock = jest.spyOn(AuthController, "confirmAccount")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "El token es incorrecto"})
    expect(confirmAccountMock).not.toHaveBeenCalled()
    expect(response.body).not.toHaveProperty("errors")
    expect(response.status).not.toBe(200)
  })

  it("should display errors when token is empty", async() =>{
    const response = await request(server)
      .post("/api/auth/confirm_account")
      .send({token:"not_valid"});
    
    const confirmAccountMock = jest.spyOn(AuthController, "confirmAccount")

    expect(response.status).toBe(400)
    expect(confirmAccountMock).not.toHaveBeenCalled()
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].msg).toBe("Token no válido")
    expect(response.status).not.toBe(200)
    expect(response.body.errors).not.toHaveLength(2)
  })

  it("should return status 200 and succes message if token confirmation is done", async() =>{
    const token = globalThis.cashTrackrConfirmationToken
    const response = await request(server)
      .post("/api/auth/confirm_account")
      .send({token});
    
    const confirmAccountMock = jest.spyOn(AuthController, "confirmAccount")

    
    expect(response.status).toBe(200)
    expect(response.body).toEqual({message: "Usuario confirmado, ya puedes iniciar sesión"})
    expect(response.status).not.toBe(401)
  })
})

describe("Authentication - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it("should display validation errors if form is empty or invalid value", async ()=> {

    const response = await request(server)
      .post("/api/auth/login")
      .send({email:"pako_email", password: ""});
    
    const loginMock = jest.spyOn(AuthController, "login")

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(2)
    expect(loginMock).not.toHaveBeenCalled()
    expect(response.status).not.toBe(200)
    expect(response.body.errors).not.toHaveLength(3)
  })

  it("should return status 404 if email is not registered", async ()=> {

    const response = await request(server)
      .post("/api/auth/login")
      .send({email:"pk@email.com", password: "password"});
    
    const loginMock = jest.spyOn(AuthController, "login")

    expect(response.status).toBe(404)
    expect(response.body).toEqual({error: "Usuario no registrado en el sistema"})
    expect(response.body).not.toHaveProperty("errors")
    expect(loginMock).not.toHaveBeenCalled()
    expect(response.status).not.toBe(200)
  })
  
  it("should return status 403 if user account is not confirmed", async ()=> {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id:1,
      confirmed: false,
      password: "hashedPassword",
      email: "pako@email.com"
    })
    
    const response = await request(server)
      .post("/api/auth/login")
      .send({email:"pako2@email.com", password: "hashedPassword"});
    
    const loginMock = jest.spyOn(AuthController, "login")

    expect(response.status).toBe(403)
    expect(response.body).toEqual({error: "Necesitas confirmar tu cuenta para poder iniciar sesión"})
    expect(response.body).not.toHaveProperty("errors")
    expect(loginMock).not.toHaveBeenCalled()
    expect(response.status).not.toBe(200)
  })
  it("should return status 403 if user account is not confirmed with another way to test", async ()=> {
    const userData= {
      name: "Test",
      email: "pako2@email.com",
      password: "hashedPassword"
    };

    await request(server).post("/api/auth/create_account").send(userData)
    
    const response = await request(server)
      .post("/api/auth/login")
      .send({email:userData.email, password: userData.password});
    
    const loginMock = jest.spyOn(AuthController, "login")

    expect(response.status).toBe(403)
    expect(response.body).toEqual({error: "Necesitas confirmar tu cuenta para poder iniciar sesión"})
    expect(response.body).not.toHaveProperty("errors")
    expect(loginMock).not.toHaveBeenCalled()
    expect(response.status).not.toBe(200)
  })

  it("should return status 401 if password is wrong", async ()=> {
    const findOne =(jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id:1,
      confirmed: true,
      password: "hashedPassword",
      email: "pako@email.com"
    });

    const comparePassword = (jest.spyOn(authUtils, "comparePassword") as jest.Mock).mockResolvedValue(false);
    
    const response = await request(server)
      .post("/api/auth/login")
      .send({email:"pako2@email.com", password: "password"});
    
    const loginMock = jest.spyOn(AuthController, "login")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "La contraseña es incorrecta"})
    expect(response.body).not.toHaveProperty("errors")
    expect(loginMock).not.toHaveBeenCalled()
    expect(response.status).not.toBe(200)
    expect(findOne).toHaveBeenCalledTimes(1)
    expect(comparePassword).toHaveBeenCalledTimes(1)
  })

  it("should return a success message and token if login is correct", async ()=> {
    const fakeJWT = "fake_token";
    
    const findOne = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id:1,
      confirmed: true,
      password: "hashedPassword",
      email: "pako@email.com"
    });

    const comparePassword = (jest.spyOn(authUtils, "comparePassword") as jest.Mock).mockResolvedValue(true);

    const generateJWT = (jest.spyOn(jwtUtils, "generateJWT") as jest.Mock).mockReturnValue(fakeJWT)
    
    const response = await request(server)
      .post("/api/auth/login")
      .send({email:"pako2@email.com", password: "password"});

    expect(response.status).toBe(200)
    expect(response.body).toEqual({message: "Inicio de sesión correcto", token: fakeJWT})
    expect(findOne).toHaveBeenCalled()
    expect(findOne).toHaveBeenCalledTimes(1)

    expect(comparePassword).toHaveBeenCalled()
    expect(comparePassword).toHaveBeenCalledTimes(1)
    expect(comparePassword).toHaveBeenCalledWith("password", "hashedPassword")

    expect(generateJWT).toHaveBeenCalled()
    expect(generateJWT).toHaveBeenCalledTimes(1)
    expect(generateJWT).toHaveBeenCalledWith(1)
    
    expect(response.body).not.toHaveProperty("errors")
    expect(response.status).not.toBe(401)
  })

})

let jwt: string
async function authenticateUser () {
  const response = await request(server)
      .post("/api/auth/login")
      .send({
        email: "pako2@email.com",
        password: "password"
      })
      jwt = response.body.token

      expect(response.status).toBe(200)
}

describe("GET /api/budgets", () => {
  
  beforeAll(() => {
    jest.restoreAllMocks()
  })
  
  beforeAll(async () => {
    await authenticateUser()
  })

  it("should reject unauthorized access to budgets without a jwt", async () => {
    const response = await request(server)
      .get("/api/budgets");

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: "Usuario no autorizado"})
  })

  it("should reject unauthorized access to budgets without a jwt not valid", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth("jwt_fake.wrong.not_valid", {type: "bearer"})

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: "invalid token"})
  })

  it("should return all budgets to user authorized", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth(jwt, {type: "bearer"})

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
      expect(response.status).not.toBe(401)
      expect(response.body).not.toEqual({error: "Usuario no autorizado"})
  })
})

describe("POST /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser()
  })

  it("should return an error status and message if user is not authenticated", async () => {
    const response = await request(server)
      .post("/api/budgets")

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty("error")
      expect(response.body).toEqual({error: "Usuario no autorizado"})
  })

  it("should return an error status if user sent a empty form", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwt, {type: "bearer"})
      .send({name:"", amount: ""})

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("errors")
      expect(response.body.errors).toHaveLength(3)
  })

  it("should user could create a new budget when is authorized", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwt, {type: "bearer"})
      .send({
        name: "Test budget",
        amount: 500
      });

      (jest.spyOn(Budget, "create") as jest.Mock).mockResolvedValue({
        name: "Test budget",
        amount: 500,
        budgetId: 1
      });

      expect(response.status).toBe(201)
      expect(response.body).toBe("Presupuesto creado correctamente")
  })
})

describe("GET /api/budgets/:budgetId", () => {
  beforeAll(async () => {
    await authenticateUser()
  })

  it("should return error 400 if user is not authenticated", async () => {
    const response = await request(server)
      .get("/api/budgets/1")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "Usuario no autorizado"})
  })

  it("should return error 500 if jwt is invalid", async () => {
    const response = await request(server)
      .get("/api/budgets/1")
      .auth("jwt_invalid.wrong.is_incorrect", {type: "bearer"})

    expect(response.status).toBe(500)
    expect(response.body).toEqual({error: "invalid token"})
  })

  it("should return an error 404 when id is not valid", async () => {
    const response = await request(server)
      .get("/api/budgets/hola")
      .auth(jwt, {type: "bearer"})

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0]).toHaveProperty("msg", "ID no válido")

    expect(response.status).not.toBe(200)

  })

  it("should return an error 404 when budget not exists", async () => {
    const response = await request(server)
      .get("/api/budgets/2")
      .auth(jwt, {type: "bearer"})

    expect(response.status).toBe(404)
    expect(response.body).toEqual({error: "Presupuesto no encontrado"})
  })

  it("should return status 200 and budget finded on BD", async () => {
    const response = await request(server)
      .get("/api/budgets/1")
      .auth(jwt, {type: "bearer"});

    expect(response.status).toBe(200);
    expect(response.status).not.toBe(404);
    expect(response.body).not.toEqual({error: "Presupuesto no encontrado"});
  })
})

describe("PUT /api/budgets/:budgetId", () => {
it("should return an error status when the user is not authorized", async () => {
  const response= await request(server)
    .put("/api/budgets/1")
    .send({})
    
    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty("error", "Usuario no autorizado")
    expect(response.status).not.toBe(200)
})

it("should return an error status when the form is empty", async () => {
  const response= await request(server)
    .put("/api/budgets/1")
    .auth(jwt, {type: "bearer"})
    .send({})

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("errors")
    expect(response.body.errors).toHaveLength(3)
    expect(response.status).not.toBe(200)
})
it("should update budget by id", async () => {
  const response= await request(server)
    .put("/api/budgets/1")
    .auth(jwt, {type: "bearer"})
    .send({
      name: "Test budget updated",
      amount: 1200
    });

    (jest.spyOn(Budget, "update") as jest.Mock).mockResolvedValue({
      name: "Test budget updated",
      amount: 1200
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("message", "Presupuesto actualizado con éxito")
    expect(response.status).not.toBe(401)
})
})
describe("DELETE /api/budgets/:budgetId", () => {
it("should return an error status when the user is not authorized", async () => {
  const response= await request(server)
    .delete("/api/budgets/1")
    
    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty("error", "Usuario no autorizado")
    expect(response.status).not.toBe(200)
})

it("should return an error status if id doesnt exist", async () => {
  const response= await request(server)
    .delete("/api/budgets/2")
    .auth(jwt, {type: "bearer"})

    console.log('response.body', response.body)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty("error", "Presupuesto no encontrado")
    expect(response.status).not.toBe(200)
})

it("should delete budget by id", async () => {
  const response= await request(server)
    .delete("/api/budgets/1")
    .auth(jwt, {type: "bearer"})


    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("message", "Presupuesto eliminado con éxito")
    expect(response.status).not.toBe(401)
})
})