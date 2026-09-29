import { Paths } from "./paths"

/** Glyphs of the menu page: the SDK set where it has one, our own outline glyph for the page. */
export const IllusionIcons = {
	/** A figure with its dashed copy beside it: the page itself. */
	Page: `${Paths.Icons}/illusion.svg`,
	State: Menu.Icons.Power,
	Glow: Menu.Icons.Lighting,
	Illusion: Menu.Icons.Palette,
	/** Two overlapping sheets: the copies a hero makes of itself. */
	Clones: Menu.Icons.Files,
	/** An eye struck through: the illusions the game is told not to draw. */
	Type: Menu.Icons.EyeOff,
	Settings: Menu.Icons.Settings,
	Size: Menu.Icons.Expand,
	Opacity: Menu.Icons.Checkerboard,
	DrawType: Menu.Icons.GridPick
} as const
