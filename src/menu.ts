import { Color, ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Glow: Menu.Toggle
	public readonly State: Menu.Toggle

	public readonly Color: Menu.ColorPicker
	public readonly ColorClone: Menu.ColorPicker

	public readonly Size: Menu.Slider
	public readonly Opacity: Menu.Slider
	public readonly DrawType: Menu.Dropdown
	public readonly IllusionType: Menu.Dropdown

	private readonly hIllusionTree: Menu.Node
	private readonly typeArr = ["Circle", "Images"]

	private readonly icon = ImageData.Paths.AbilityIcons + "/modifier_illusion_png.vtex_c"

	constructor() {
		const entry = Menu.AddEntry("Visual")
		const menu = entry.AddNode("Show Illusions", this.icon, undefined, 0)

		this.State = menu.AddToggle("State", true)
		this.Glow = menu.AddToggle(
			"Glow effect",
			true,
			"Glow effect useful e.g. on Chaos Knight\nany ill-distinguished illusions"
		)
		this.Color = menu.AddColorPicker("Illusion", new Color(0, 0, 160))
		this.ColorClone = menu.AddColorPicker(
			"Clones",
			new Color(161, 0, 255),
			"Clones color (e.x Meepo, Vengeful spirit)"
		)

		this.IllusionType = menu.AddDropdown("Illusions type", [
			"Default",
			"Hidden",
			"Only color"
		])

		this.hIllusionTree = menu.AddNode(
			"Settings",
			"menu/icons/settings.svg",
			"Setting up invisible illusions"
		)
		this.Size = this.hIllusionTree.AddSlider("Size", 33, 30, 200)
		this.Opacity = this.hIllusionTree.AddSlider("Opacity", 80, 10, 100)
		this.DrawType = this.hIllusionTree.AddDropdown("Draw type", this.typeArr, 1)

		this.IllusionType.OnValue(
			call => (this.hIllusionTree.IsHidden = call.SelectedID !== 1)
		)
	}

	public OnChangeMenu(callback: () => void) {
		this.Size.OnValue(callback)
		this.Glow.OnValue(callback)
		this.State.OnValue(callback)
		this.Opacity.OnValue(callback)
		this.DrawType.OnValue(callback)
		this.Color.OnValue(callback)
		this.ColorClone.OnValue(callback)
		this.IllusionType.OnValue(callback)
	}
}
