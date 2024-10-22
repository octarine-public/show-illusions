import { Color, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Glow: Menu.Toggle
	public readonly State: Menu.Toggle
	public readonly ColorCone: Menu.ColorPicker
	public readonly ColorIllusion: Menu.ColorPicker

	public readonly Size: Menu.Slider
	public readonly Opacity: Menu.Slider
	public readonly Distance: Menu.Slider
	public readonly DrawType: Menu.Dropdown
	public readonly HiddenIllusion: Menu.Toggle

	private readonly hIllusionTree: Menu.Node
	private readonly typeArr = ["Circle", "Images"]

	constructor() {
		const entry = Menu.AddEntry("Visual")
		const menu = entry.AddNode(
			"Show Illusions",
			"panorama/images/spellicons/modifier_illusion_png.vtex_c",
			undefined,
			0
		)

		this.State = menu.AddToggle("State", true)
		this.Glow = menu.AddToggle(
			"Glow effect",
			true,
			"Glow effect useful e.g. on Chaos Knight\nany ill-distinguished illusions"
		)
		this.ColorIllusion = menu.AddColorPicker("Illusion", new Color(0, 0, 160))
		this.ColorCone = menu.AddColorPicker(
			"Clones",
			new Color(161, 0, 255),
			"Clones color (e.x Meepo, Vengeful spirit)"
		)

		this.HiddenIllusion = menu.AddToggle("Hide illusions", false)
		this.hIllusionTree = menu.AddNode(
			"Settings",
			"menu/icons/settings.svg",
			"Setting up invisible illusions"
		)
		this.Size = this.hIllusionTree.AddSlider("Size", 33, 30, 200)
		this.Opacity = this.hIllusionTree.AddSlider("Opacity", 80, 10, 100)
		this.Distance = this.hIllusionTree.AddSlider(
			"Distance",
			1500,
			0,
			3000,
			0,
			"The distance from you to the illusion\nat which the illusion becomes invisible"
		)
		this.DrawType = this.hIllusionTree.AddDropdown("Draw type", this.typeArr, 1)
		this.HiddenIllusion.OnValue(call => (this.hIllusionTree.IsHidden = !call.value))
	}

	public OnChangeMenu(callback: () => void) {
		this.Size.OnValue(callback)
		this.Glow.OnValue(callback)
		this.State.OnValue(callback)
		this.Opacity.OnValue(callback)
		this.Distance.OnValue(callback)
		this.DrawType.OnValue(callback)
		this.ColorCone.OnValue(callback)
		this.ColorIllusion.OnValue(callback)
		this.HiddenIllusion.OnValue(callback)
	}
}
