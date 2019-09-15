import { VerifyAuthController } from "../../../src/api/verify-auth";

describe("Unit: verify-auth controller", () => {
  let controller: VerifyAuthController;

  beforeEach(() => {
    controller = new VerifyAuthController();
  });

  describe("verify()", () => {
    it("returns a valid verification", async () => {
      const response = await controller.verify();
      expect(response).toHaveProperty("verification", true);
    });
  });

  describe("getRoutes", () => {
    it("has routes defined", () => {
      const routes = controller.registerRoutes();
      expect(routes.length).toBeGreaterThan(0);
    });
  });
});
