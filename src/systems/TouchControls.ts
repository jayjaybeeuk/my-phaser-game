import Phaser from 'phaser';
import { DEPTHS } from '../constants/depths';

export interface TouchInput {
    left: boolean;
    right: boolean;
    up: boolean;
    jump: boolean;
    select: boolean;
}

/**
 * On-screen touch controls for mobile/tablet play.
 * Shows directional buttons (left, right, up) and action buttons (jump, select).
 * Automatically hides when keyboard or gamepad input is detected,
 * and reappears on touch.
 */
export class TouchControls {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private visible: boolean = false;
    private input: TouchInput = { left: false, right: false, up: false, jump: false, select: false };

    // Track which buttons are currently held
    private activePointers: Map<number, string> = new Map();

    // Button references for hit testing
    private buttons: { key: string; zone: Phaser.GameObjects.Zone; graphic: Phaser.GameObjects.Container }[] = [];

    // Callback for hiding on keyboard/gamepad
    private keyboardListener?: (event: KeyboardEvent) => void;
    private gamepadCheckTimer?: Phaser.Time.TimerEvent;
    private lastGamepadTimestamp: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0).setDepth(DEPTHS.TOUCH_CONTROLS).setAlpha(0.6);

        this.createButtons();
        this.setupTouchListeners();
        this.setupHideOnPhysicalInput();

        // Start hidden - show on first touch
        this.hide();
    }

    private createButtons(): void {
        const gameWidth = 800;
        const gameHeight = 600;

        // --- D-pad (left side) ---
        const dpadBaseX = 90;
        const dpadBaseY = gameHeight - 90;
        const btnSize = 56;
        const gap = 6;

        // Left button
        this.createButton('left', dpadBaseX - btnSize - gap, dpadBaseY, btnSize, btnSize, '\u25C0');
        // Right button
        this.createButton('right', dpadBaseX + btnSize + gap, dpadBaseY, btnSize, btnSize, '\u25B6');
        // Up button
        this.createButton('up', dpadBaseX, dpadBaseY - btnSize - gap, btnSize, btnSize, '\u25B2');

        // --- Action buttons (right side) ---
        const actionBaseX = gameWidth - 90;
        const actionBaseY = gameHeight - 90;

        // Jump button (large, prominent)
        this.createButton('jump', actionBaseX, actionBaseY - 30, 70, 70, 'JUMP', '#00cc44');

        // Select / confirm button (smaller, above jump)
        this.createButton('select', actionBaseX, actionBaseY - 110, 50, 40, 'SEL', '#cc8800');
    }

    private createButton(
        key: string,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        color: string = '#ffffff'
    ): void {
        const btnContainer = this.scene.add.container(x, y);

        // Background rounded rect
        const bg = this.scene.add.graphics();
        const radius = 10;
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.3);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.8);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // Label text
        const text = this.scene.add.text(0, 0, label, {
            fontSize: key === 'jump' ? '16px' : '14px',
            color: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btnContainer.add([bg, text]);
        this.container.add(btnContainer);

        // Interactive zone for hit detection
        const zone = this.scene.add.zone(x, y, width + 16, height + 16)
            .setInteractive()
            .setDepth(DEPTHS.TOUCH_CONTROLS + 1);

        // Store background reference on zone for highlight effect
        (zone as any)._touchBg = bg;
        (zone as any)._touchColor = color;
        (zone as any)._touchWidth = width;
        (zone as any)._touchHeight = height;

        this.buttons.push({ key, zone, graphic: btnContainer });
    }

    private setupTouchListeners(): void {
        // Use pointer events on each zone
        for (const btn of this.buttons) {
            btn.zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                if (!this.visible) {
                    this.show();
                }
                this.activePointers.set(pointer.id, btn.key);
                this.updateInputState();
                this.highlightButton(btn, true);
            });

            btn.zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
                this.activePointers.delete(pointer.id);
                this.updateInputState();
                this.highlightButton(btn, false);
            });

            btn.zone.on('pointerout', (pointer: Phaser.Input.Pointer) => {
                this.activePointers.delete(pointer.id);
                this.updateInputState();
                this.highlightButton(btn, false);
            });
        }

        // Also show controls on any touch on the game canvas
        this.scene.input.on('pointerdown', () => {
            if (!this.visible) {
                this.show();
            }
        });
    }

    private highlightButton(btn: { key: string; zone: Phaser.GameObjects.Zone; graphic: Phaser.GameObjects.Container }, active: boolean): void {
        const zone = btn.zone as any;
        const bg = zone._touchBg as Phaser.GameObjects.Graphics;
        const color = zone._touchColor as string;
        const width = zone._touchWidth as number;
        const height = zone._touchHeight as number;
        const radius = 10;

        bg.clear();
        const colorInt = Phaser.Display.Color.HexStringToColor(color).color;
        bg.fillStyle(colorInt, active ? 0.6 : 0.3);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        bg.lineStyle(2, colorInt, active ? 1 : 0.8);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }

    private updateInputState(): void {
        this.input.left = false;
        this.input.right = false;
        this.input.up = false;
        this.input.jump = false;
        this.input.select = false;

        for (const key of this.activePointers.values()) {
            if (key === 'left') this.input.left = true;
            if (key === 'right') this.input.right = true;
            if (key === 'up') this.input.up = true;
            if (key === 'jump') this.input.jump = true;
            if (key === 'select') this.input.select = true;
        }
    }

    private setupHideOnPhysicalInput(): void {
        // Hide on any keyboard press
        this.keyboardListener = () => {
            if (this.visible) {
                this.hide();
            }
        };
        window.addEventListener('keydown', this.keyboardListener);

        // Hide when gamepad input is detected (poll every 500ms)
        this.gamepadCheckTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                try {
                    if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
                        const pad = this.scene.input.gamepad.getPad(0);
                        if (pad) {
                            const timestamp = (pad as any).timestamp || 0;
                            if (timestamp !== this.lastGamepadTimestamp) {
                                this.lastGamepadTimestamp = timestamp;
                                // Check if any button or axis is active
                                const anyButton = pad.buttons.some(b => b?.pressed);
                                const anyAxis = pad.leftStick && (Math.abs(pad.leftStick.x) > 0.2 || Math.abs(pad.leftStick.y) > 0.2);
                                if (anyButton || anyAxis) {
                                    if (this.visible) {
                                        this.hide();
                                    }
                                }
                            }
                        }
                    }
                } catch {
                    // Gamepad access failed, ignore
                }
            },
            loop: true
        });
    }

    show(): void {
        this.visible = true;
        this.container.setVisible(true);
        for (const btn of this.buttons) {
            btn.zone.setVisible(true);
        }
    }

    hide(): void {
        this.visible = false;
        this.container.setVisible(false);
        for (const btn of this.buttons) {
            btn.zone.setVisible(false);
        }
        // Clear any active input
        this.activePointers.clear();
        this.updateInputState();
    }

    isVisible(): boolean {
        return this.visible;
    }

    getInput(): TouchInput {
        return this.input;
    }

    /**
     * Check if select/confirm was just pressed (rising edge).
     * Call once per frame in update(); resets after reading.
     */
    private selectWasPressed: boolean = false;
    private lastSelectState: boolean = false;

    updateSelectEdge(): void {
        if (this.input.select && !this.lastSelectState) {
            this.selectWasPressed = true;
        }
        this.lastSelectState = this.input.select;
    }

    consumeSelectPress(): boolean {
        const was = this.selectWasPressed;
        this.selectWasPressed = false;
        return was;
    }

    /**
     * Check if jump was just pressed (rising edge) for use as confirm in menus.
     */
    private jumpWasPressed: boolean = false;
    private lastJumpState: boolean = false;

    updateJumpEdge(): void {
        if (this.input.jump && !this.lastJumpState) {
            this.jumpWasPressed = true;
        }
        this.lastJumpState = this.input.jump;
    }

    consumeJumpPress(): boolean {
        const was = this.jumpWasPressed;
        this.jumpWasPressed = false;
        return was;
    }

    destroy(): void {
        if (this.keyboardListener) {
            window.removeEventListener('keydown', this.keyboardListener);
        }
        if (this.gamepadCheckTimer) {
            this.gamepadCheckTimer.remove();
        }
        this.container.destroy();
        for (const btn of this.buttons) {
            btn.zone.destroy();
        }
        this.buttons = [];
    }
}
