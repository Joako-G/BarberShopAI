import { describe, expect, it, vi } from "vitest";
import { serviceRepository } from "../repositories";
import { GetAdminServicesUseCase } from "../use-cases/get-admin-services.use-case";
import { GetServicesUseCase } from "../use-cases/get-services.use-case";

describe("service listing separation", () => {
  it("uses the active-only repository query for the public list", async () => {
    const findAllActive = vi
      .spyOn(serviceRepository, "findAllActive")
      .mockResolvedValue([]);
    const findAll = vi.spyOn(serviceRepository, "findAll").mockResolvedValue([]);

    await new GetServicesUseCase().execute();

    expect(findAllActive).toHaveBeenCalledOnce();
    expect(findAll).not.toHaveBeenCalled();
  });

  it("uses the complete repository query for the admin list", async () => {
    const findAll = vi.spyOn(serviceRepository, "findAll").mockResolvedValue([]);
    const findAllActive = vi
      .spyOn(serviceRepository, "findAllActive")
      .mockResolvedValue([]);

    await new GetAdminServicesUseCase().execute();

    expect(findAll).toHaveBeenCalledOnce();
    expect(findAllActive).not.toHaveBeenCalled();
  });
});
