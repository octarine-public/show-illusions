import { canvas } from "../render"
import { EDrawType } from "./enums"
import { MenuManager } from "./menu"

/** The game's own illusion badge: the icon the buff bar shows on an illusion. */
const ICON = `${PathData.AbilityImagePath}/modifier_illusion_png.vtex_c`
/** How many times the ring fits in the marker's diameter: the stroke is a fifteenth of it. */
const RING_DIVISION = 15

/**
 * The marker over a hidden illusion: the illusion badge or a yellow disc, ringed in the colour
 * of the player who owns it. The old renderer anchored the drawing to the entity and kept it
 * until something invalidated it; the canvas keeps no drawing of its own between frames, so the
 * marker is projected and painted again every frame. What the menu asks for is the same for
 * every illusion in a frame, so it is taken once in {@link IllusionGUI.BeginFrame}.
 */
export class IllusionGUI {
	private readonly size = new Vector2()
	private readonly half = new Vector2()
	private readonly position = new Vector2()
	/** The colours a marker is painted in this frame: only their alpha follows the slider. */
	private readonly badge = new Color()
	private readonly disc = Color.Yellow
	private readonly ring = new Color()
	private readonly badgeStyle = { color: this.badge, circle: true }
	private readonly discStyle = { color: this.disc }
	/** The stroke of the ring in px. */
	private thickness = 0
	private alpha = 255
	private drawImage = true

	constructor(private readonly menu: MenuManager) {}

	/** Takes the size, the stroke and the opacity the menu asks for this frame. */
	public BeginFrame() {
		const menu = this.menu,
			size = GUIInfo.ScaleHeight(menu.Size.value)
		this.size.SetVector(size, size)
		this.half.SetVector(size / 2, size / 2)
		this.thickness = size / RING_DIVISION
		this.alpha = (menu.Opacity.value / 100) * 255
		this.drawImage = menu.DrawType.SelectedID === EDrawType.Images
		this.badge.CopyFrom(Color.WhiteReadonly).SetA(this.alpha)
		this.disc.SetA(this.alpha)
	}

	/** Paints the marker centred on the unit's origin, ringed in its owner's colour. */
	public Draw(unit: Unit) {
		const w2s = RendererSDK.WorldToScreen(unit.Position)
		if (w2s === undefined) {
			return
		}
		this.position.CopyFrom(w2s).SubtractForThis(this.half)
		if (this.drawImage) {
			canvas.Image(ICON, this.position, this.size, this.badgeStyle)
		} else {
			canvas.Circle(this.position, this.size, this.discStyle)
		}
		this.ring.CopyFrom(unit.Color).SetA(this.alpha)
		canvas.Arc(w2s, this.size.x / 2, this.thickness, -90, 360, this.ring)
	}
}
