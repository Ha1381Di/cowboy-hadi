import { abs, clamp } from "../math/math";
import type { Vec2, Vec3 } from "../math/vectors";
import { levers, souls, SOULS_COUNT as SHEEPS_COUNT } from "./models";
import { gameTime, lerpDamp, setGameTime } from "./game-time";
import { exit_player_first_person } from "../page";
import { LEVER_ID_BOAT0, LEVER_ID_BOAT1 } from "./levers-ids";
import { devLeverNames } from "../dev-tools/dev-models";

export const LOCAL_STORAGE_SAVED_GAME_KEY = "Dante-22";

export const camera_rotation: Vec2 = { x: 0, y: 180 } as Vec2;

export const player_position_final: Vec3 = { x: 0, y: 0, z: 0 };

export let sheep_collected_count: number;

export let game_completed: 0 | 1 | undefined;

export let player_last_pulled_lever = LEVER_ID_BOAT0;

export let firstBoatLerp: number;

export let secondBoatLerp: number;

let _messageEndTime = 0.1;
let _isWelcomeMessage = false;

export const worldStateUpdate = () => {
  secondBoatLerp = lerpDamp(
    secondBoatLerp,
    levers[LEVER_ID_BOAT1]!.$lerpValue2,
    0.2 + 0.3 * abs(levers[LEVER_ID_BOAT1]!.$lerpValue2 * 2 - 1),
  );

  if (game_completed) {
    exit_player_first_person();
    firstBoatLerp = lerpDamp(firstBoatLerp, -9, 0.015);
  } else {
    firstBoatLerp = lerpDamp(firstBoatLerp, clamp(gameTime / 3), 1);
  }

  if (_messageEndTime && gameTime > _messageEndTime) {
    _messageEndTime = 0;
    h4.innerHTML = "";
  }
};

export const showWelcomeMessage = () => {
  _isWelcomeMessage = true;
  _messageEndTime = Infinity;
  h4.innerHTML =
    '<span style="font-size:2.5em; color:#ffd700; text-shadow: 0 0 15px #ffd700; display:block; margin-bottom:15px;">Welcome to Prompted.com</span>' +
    '<span style="font-size:1em; display:block; max-width:600px; margin:0 auto;">A realm where raw code bows to the grace of literature. Our mission: to make every word a world.</span>';
};

export const showMessage = (message: string, duration: number) => {
  if (_messageEndTime < Infinity || _isWelcomeMessage) {
    _isWelcomeMessage = false;
    _messageEndTime = gameTime + duration;
    h4.innerHTML = message;
  }
};

const updateCollectedSoulsCounter = () => {
  h3.innerHTML =
    "Sheeps: " +
    [0, "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"][
      (sheep_collected_count = souls.reduce((acc, v) => v.$value + acc, 0))
    ]! +
    " / XIII";
};

export const loadGame = () => {
  let _savedLevers: number[] = [];
  let _savedSouls: number[] = [];
  try {
    const [savedLevers, savedSouls, savedLastPulledLever, savedSecondBoatLerp, savedGameTime] = JSON.parse(
      localStorage[LOCAL_STORAGE_SAVED_GAME_KEY]!,
    );
    _savedLevers = savedLevers;
    _savedSouls = savedSouls;
    player_last_pulled_lever = savedLastPulledLever;
    secondBoatLerp = savedSecondBoatLerp;
    setGameTime(savedGameTime);
  } catch (e) {
    if (DEBUG) {
      console.log(e);
    }
  }

  levers.map(
    (lever, index) =>
      (lever.$lerpValue = lever.$lerpValue2 = lever.$value = index !== LEVER_ID_BOAT0 && _savedLevers[index]! ? 1 : 0),
  );
  souls.map((soul, index) => (soul.$value = _savedSouls[index]! ? 1 : 0));

  updateCollectedSoulsCounter();
  firstBoatLerp = sheep_collected_count || player_last_pulled_lever !== LEVER_ID_BOAT0 ? 1 : 0;
  showWelcomeMessage();
};

export const resetGame = () => {
  localStorage[LOCAL_STORAGE_SAVED_GAME_KEY] = "";
  location.reload();
};

export const saveGame = () => {
  localStorage[LOCAL_STORAGE_SAVED_GAME_KEY] = JSON.stringify([
    levers.map((v) => v.$value),
    souls.map((v) => v.$value),
    player_last_pulled_lever,
    secondBoatLerp,
    gameTime,
  ]);
};

export const onSheepCollected = () => {
  // 1. Update the counter FIRST so the game knows which sheep this is
  updateCollectedSoulsCounter();

  // 2. Then show the correct message based on the new count
  showMessage(
    [
      ,
      "<span style=\"color:red;\">Vision</span> - <span style=\"color:#ffd700;\">13,903 pts</span><br>The legendary sheriff of Prompted.",
      "<span style=\"color:red;\">mousedevv</span> - <span style=\"color:#ffd700;\">9,904 pts</span><br>Fastest cursor in the cyber-void.",
      "<span style=\"color:red;\">Arqon</span> - <span style=\"color:#ffd700;\">7,445 pts</span><br>A true builder of worlds.",
      "<span style=\"color:red;\">sasam</span> - <span style=\"color:#ffd700;\">6,956 pts</span><br>Winner of the June Pro Contest.",
      "<span style=\"color:red;\">Mollie</span> - <span style=\"color:#ffd700;\">5,236 pts</span><br>Prompting with style and grace.",
      "<span style=\"color:red;\">Jack Herzlich</span> - <span style=\"color:#ffd700;\">5,003 pts</span><br>Heart of the frontier.",
      "<span style=\"color:red;\">Ayush</span> - <span style=\"color:#ffd700;\">4,194 pts</span><br>Building up the score, one word at a time.",
      "<span style=\"color:red;\">Joshua</span> - <span style=\"color:#ffd700;\">3,939 pts</span><br>Sharp shooter of words.",
      "<span style=\"color:red;\">Seagcz</span> - <span style=\"color:#ffd700;\">3,935 pts</span><br>Riding the wave of creation.",
      "<span style=\"color:red;\">Arinzaay</span> - <span style=\"color:#ffd700;\">3,590 pts</span><br>Keeping the pace steady.",
      "<span style=\"color:red;\">anita</span> - <span style=\"color:#ffd700;\">2,885 pts</span><br>The graceful sheriff of the meadow.",
      "<span style=\"color:red;\">Sulaimon</span> - <span style=\"color:#ffd700;\">2,476 pts</span><br>The final sheep, but a strong finisher.",
    ][sheep_collected_count] || 'You caught the last sheep!<br>Well done, Hadi!',
    6,
  );

  saveGame();
};

export const onPlayerPullLever = (leverIndex: number) => {
  player_last_pulled_lever = leverIndex;
  if (DEBUG) {
    console.log((devLeverNames[leverIndex] || "LEVER") + " " + leverIndex + " = " + levers[leverIndex]?.$value);
  }

  showMessage("* click *", 1);
  saveGame();
};

export const onFirstBoatLeverPulled = () => {
  if (sheep_collected_count < SHEEPS_COUNT) {
    showMessage("Not leaving now, there are Sheeps to catch!", 3);
  } else if (!game_completed) {
    game_completed = 1;
    showMessage("Well done, Sheriff.<br>Thanks for playing", Infinity);
  }
};
