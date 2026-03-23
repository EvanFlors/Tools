import { jest } from "@jest/globals";

// Mock the UserService BEFORE importing
jest.unstable_mockModule(
  "../../../src/application/services/user.service.js",
  () => ({
    default: {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    },
  })
);

// Dynamic imports AFTER mocking
const { default: UserService } = await import(
  "../../../src/application/services/user.service.js"
);

const { default: userController } = await import(
  "../../../src/interfaces/controllers/user.controller.js"
);

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a user", async () => {
    const req = {
      body: {
        name: "John",
        email: "john@test.com",
      },
    };

    const res = mockResponse();

    const fakeUser = {
      id: "1",
      name: "John",
      email: "john@test.com",
    };

    UserService.create.mockResolvedValue(fakeUser);

    await userController.createUser(req, res);

    expect(UserService.create).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test("should return error when create fails", async () => {
    const req = { body: {} };
    const res = mockResponse();

    UserService.create.mockRejectedValue(new Error("Invalid user"));

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user",
    });
  });

  test("should return all users", async () => {
    const req = {};
    const res = mockResponse();

    const users = [
      { id: "1", name: "John" },
      { id: "2", name: "Anna" },
    ];

    UserService.findAll.mockResolvedValue(users);

    await userController.getUsers(req, res);

    expect(UserService.findAll).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  test("should handle error when getting users", async () => {
    const req = {};
    const res = mockResponse();

    UserService.findAll.mockRejectedValue(new Error("Database error"));

    await userController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "Database error",
    });
  });

  test("should return a user by id", async () => {
    const req = {
      params: { id: "123" },
    };

    const res = mockResponse();

    const user = { id: "123", name: "John" };

    UserService.findById.mockResolvedValue(user);

    await userController.getUser(req, res);

    expect(UserService.findById).toHaveBeenCalledWith("123");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  test("should return error when user not found", async () => {
    const req = {
      params: { id: "123" },
    };

    const res = mockResponse();

    UserService.findById.mockRejectedValue(new Error("User not found"));

    await userController.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  test("should update a user", async () => {
    const req = {
      params: { id: "123" },
      body: { name: "Updated John" },
    };

    const res = mockResponse();

    const updatedUser = {
      id: "123",
      name: "Updated John",
    };

    UserService.updateById.mockResolvedValue(updatedUser);

    await userController.updateUser(req, res);

    expect(UserService.updateById).toHaveBeenCalledWith("123", req.body);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });

  test("should return error when update fails", async () => {
    const req = {
      params: { id: "123" },
      body: {},
    };

    const res = mockResponse();

    UserService.updateById.mockRejectedValue(new Error("User not found"));

    await userController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  test("should delete a user", async () => {
    const req = {
      params: { id: "123" },
    };

    const res = mockResponse();

    UserService.deleteById.mockResolvedValue();

    await userController.deleteUser(req, res);

    expect(UserService.deleteById).toHaveBeenCalledWith("123");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
    });
  });

  test("should return error when delete fails", async () => {
    const req = {
      params: { id: "123" },
    };

    const res = mockResponse();

    UserService.deleteById.mockRejectedValue(new Error("User not found"));

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });
});
