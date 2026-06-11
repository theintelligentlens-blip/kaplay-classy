// Keyboard, mouse, touch, gamepad and virtual button input,
// namespaced under `game.input`.

import type { Engine } from "../core/engine";
import type { ScopeHandlers } from "../events/scopeHandlers";

/**
 * Input state queries and input events. Available as `game.input`.
 *
 * Event handlers registered here live in the default lifetime scope
 * (cleared on scene change unless the game uses app scope).
 *
 * @group Input
 */
export class InputManager {
    constructor(
        private readonly app: Engine["app"],
        private readonly scope: ScopeHandlers,
    ) {}

    // #region Keyboard

    get onKeyDown() {
        return this.scope.onKeyDown;
    }
    get onKeyPress() {
        return this.scope.onKeyPress;
    }
    get onKeyPressRepeat() {
        return this.scope.onKeyPressRepeat;
    }
    get onKeyRelease() {
        return this.scope.onKeyRelease;
    }
    get onCharInput() {
        return this.scope.onCharInput;
    }
    get isKeyDown() {
        return this.app.isKeyDown;
    }
    get isKeyPressed() {
        return this.app.isKeyPressed;
    }
    get isKeyPressedRepeat() {
        return this.app.isKeyPressedRepeat;
    }
    get isKeyReleased() {
        return this.app.isKeyReleased;
    }
    get charInputted() {
        return this.app.charInputted;
    }

    // #endregion

    // #region Mouse

    get onMouseDown() {
        return this.scope.onMouseDown;
    }
    get onMousePress() {
        return this.scope.onMousePress;
    }
    get onMouseRelease() {
        return this.scope.onMouseRelease;
    }
    get onMouseMove() {
        return this.scope.onMouseMove;
    }
    get onScroll() {
        return this.scope.onScroll;
    }
    get mousePos() {
        return this.app.mousePos;
    }
    get mouseDeltaPos() {
        return this.app.mouseDeltaPos;
    }
    get isMouseDown() {
        return this.app.isMouseDown;
    }
    get isMousePressed() {
        return this.app.isMousePressed;
    }
    get isMouseReleased() {
        return this.app.isMouseReleased;
    }
    get isMouseMoved() {
        return this.app.isMouseMoved;
    }
    get setCursor() {
        return this.app.setCursor;
    }
    get getCursor() {
        return this.app.getCursor;
    }
    get setCursorLocked() {
        return this.app.setCursorLocked;
    }
    get isCursorLocked() {
        return this.app.isCursorLocked;
    }

    // #endregion

    // #region Touch

    get onTouchStart() {
        return this.scope.onTouchStart;
    }
    get onTouchMove() {
        return this.scope.onTouchMove;
    }
    get onTouchEnd() {
        return this.scope.onTouchEnd;
    }
    get isTouchscreen() {
        return this.app.isTouchscreen;
    }

    // #endregion

    // #region Gamepad

    get onGamepadConnect() {
        return this.scope.onGamepadConnect;
    }
    get onGamepadDisconnect() {
        return this.scope.onGamepadDisconnect;
    }
    get onGamepadButtonDown() {
        return this.scope.onGamepadButtonDown;
    }
    get onGamepadButtonPress() {
        return this.scope.onGamepadButtonPress;
    }
    get onGamepadButtonRelease() {
        return this.scope.onGamepadButtonRelease;
    }
    get onGamepadStick() {
        return this.scope.onGamepadStick;
    }
    get isGamepadButtonDown() {
        return this.app.isGamepadButtonDown;
    }
    get isGamepadButtonPressed() {
        return this.app.isGamepadButtonPressed;
    }
    get isGamepadButtonReleased() {
        return this.app.isGamepadButtonReleased;
    }
    get getGamepadStick() {
        return this.app.getGamepadStick;
    }
    get getGamepadAnalogButton() {
        return this.app.getGamepadAnalogButton;
    }
    get getGamepads() {
        return this.app.getGamepads;
    }

    // #endregion

    // #region Virtual buttons (input bindings)

    get onButtonDown() {
        return this.scope.onButtonDown;
    }
    get onButtonPress() {
        return this.scope.onButtonPress;
    }
    get onButtonRelease() {
        return this.scope.onButtonRelease;
    }
    get isButtonDown() {
        return this.app.isButtonDown;
    }
    get isButtonPressed() {
        return this.app.isButtonPressed;
    }
    get isButtonReleased() {
        return this.app.isButtonReleased;
    }
    get getButton() {
        return this.app.getButton;
    }
    get getButtons() {
        return this.app.getButtons;
    }
    get setButton() {
        return this.app.setButton;
    }
    get pressButton() {
        return this.app.pressButton;
    }
    get releaseButton() {
        return this.app.releaseButton;
    }

    // #endregion

    /** The last used input device type ("keyboard", "mouse", "gamepad"...). */
    get getLastInputDeviceType() {
        return this.app.getLastInputDeviceType;
    }
}
