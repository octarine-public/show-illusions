import { IllusionIcons } from "./icons"

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

	constructor() {
		const entry = Menu.AddEntry("Visual")
		const menu = entry.AddNode("Show Illusions", IllusionIcons.Page)
		menu.SortNodes = false

		this.State = menu.AddToggle("State", true)
		this.State.IconPath = IllusionIcons.State
		menu.HeaderControl = this.State
		menu.Gate = this.State

		this.Glow = menu.AddToggle(
			"Glow effect",
			true,
			"Glow effect useful e.g. on Chaos Knight\nany ill-distinguished illusions"
		)
		this.Glow.IconPath = IllusionIcons.Glow

		this.Color = menu.AddColorPicker("Illusion", new Color(0, 0, 160))
		this.Color.IconPath = IllusionIcons.Illusion
		this.ColorClone = menu.AddColorPicker(
			"Clones",
			new Color(161, 0, 255),
			"Clones color (e.x Meepo, Vengeful spirit)"
		)
		this.ColorClone.IconPath = IllusionIcons.Clones

		this.IllusionType = menu.AddDropdown("Illusions type", [
			"Default",
			"Hidden (+FPS)"
		])
		this.IllusionType.IconPath = IllusionIcons.Type

		this.hIllusionTree = menu.AddNode(
			"Settings",
			IllusionIcons.Settings,
			"Setting up invisible illusions"
		)
		this.Size = this.hIllusionTree.AddSlider("Size", 33, 30, 200)
		this.Size.IconPath = IllusionIcons.Size
		this.Opacity = this.hIllusionTree.AddSlider("Opacity", 80, 10, 100)
		this.Opacity.Suffix = "%"
		this.Opacity.IconPath = IllusionIcons.Opacity
		this.DrawType = this.hIllusionTree.AddDropdown("Draw type", this.typeArr, 1)
		this.DrawType.IconPath = IllusionIcons.DrawType

		this.hIllusionTree.IsHidden = this.IllusionType.SelectedID !== 1
		this.IllusionType.OnValue(
			call => (this.hIllusionTree.IsHidden = call.SelectedID !== 1)
		)
	}

	public OnChangeMenu(callback: () => void) {
		this.Glow.OnValue(callback)
		this.State.OnValue(callback)
		this.Color.OnValue(callback)
		this.ColorClone.OnValue(callback)
		this.IllusionType.OnValue(callback)
	}
}
