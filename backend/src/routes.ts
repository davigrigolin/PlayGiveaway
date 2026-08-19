import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { SessionController } from "./controllers/SessionController";
import { RaffleController } from "./controllers/RaffleController";
import { ParticipantController } from "./controllers/ParticipantController";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticated";

const router = Router();
const userController = new UserController();
const sessionController = new SessionController();
const raffleController = new RaffleController();
const participantController = new ParticipantController();

router.post("/users", userController.create);
router.post("/sessions", sessionController.create);
router.get("/raffles/:slug", raffleController.show);
router.post(
  "/api/giveaways/:slug/participate",
  participantController.createPublic,
);

router.post("/raffles", ensureAuthenticated, raffleController.create);
router.get("/raffles", ensureAuthenticated, raffleController.index);
router.get(
  "/raffles/:id/details",
  ensureAuthenticated,
  raffleController.details,
);
router.patch("/raffles/:id/draw", ensureAuthenticated, raffleController.draw);
router.patch("/raffles/:id/close", ensureAuthenticated, raffleController.close);
router.delete("/raffles/:id", ensureAuthenticated, raffleController.delete);
router.get(
  "/raffles/:id/participants",
  ensureAuthenticated,
  participantController.index,
);

router.post(
  "/raffles/:raffle_id/participants",
  ensureAuthenticated,
  participantController.create,
);

export { router };
