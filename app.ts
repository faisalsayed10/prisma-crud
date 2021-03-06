import { PrismaClient }  from "@prisma/client"
import express, { NextFunction, Request, Response } from "express"
import { body, validationResult }  from "express-validator"

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const userValidation = [
  body("email")
    .isLength({ min: 1 })
    .withMessage("Email must not be empty")
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("name").isLength({ min: 1 }).withMessage("Name must not be empty"),
  body("role")
    .isIn(["ADMIN", "USER", "SUPERADMIN", undefined])
    .withMessage("Role must be one of 'ADMIN', 'USER', 'SUPERADMIN'"),
];

const simpleValidationResult = validationResult.withDefaults({
  formatter: (err) => err.msg,
});

const checkForErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = simpleValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }
  next();
};

// CRUD Routes
//  Signup
app.post("/user", userValidation, checkForErrors, async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) throw { email: "Email already exists" };
    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Get all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Update user
app.put("/user/:uuid", userValidation, checkForErrors, async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  const uuid = req.params.uuid;
  try {
    let user = await prisma.user.findFirst({
      where: { uuid },
    });
    if (!user) throw { email: "User does not exists" };
    user = await prisma.user.update({
      where: { uuid },
      data: { name, email, role },
    });

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(404).json(err);
  }
});

// Delete
app.delete("/user/:uuid", async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { uuid: req.params.uuid } })
    return res.json({ message: "User deleted successfully"});
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Find
app.get("/user/:uuid", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { uuid: req.params.uuid  },
    });
    if (!user) throw { email: "User does not exists" };
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.listen(5000, () => console.log("Server running at http://localhost:5000"));
