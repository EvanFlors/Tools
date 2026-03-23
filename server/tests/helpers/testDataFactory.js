import bcrypt from "bcryptjs";

const createTestCustomer = async (Customer) => {

    const passwordHash = await bcrypt.hash("testPassword", 12);

    return Customer.create({
        name: "Test",
        address: "123 Test St",
        phone: "55-55-55-55-55",
        passwordHash: passwordHash,
    });

}